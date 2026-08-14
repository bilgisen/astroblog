/**
 * Payload CMS API client.
 *
 * Production (Cloudflare Workers): uses PABACK Service Binding via
 * `import { env } from "cloudflare:workers"` — Astro v6 compatible.
 *
 * Local dev: falls back to the public PAYLOAD_API_URL env variable.
 */

// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

const PUBLIC_API_URL =
  import.meta.env.PAYLOAD_API_URL ?? 'https://admin.paraanaliz.com';

/** Payload API yanıtları için Cloudflare Cache API TTL (saniye). */
export const PAYLOAD_CACHE_TTL = 120;

// Cache key namespace — değiştirilirse tüm payload cache anında geçersiz olur.
const PAYLOAD_CACHE_PREFIX = 'https://paraanaliz.com/.payload-cache/v2';

/**
 * Liste sorgularında payload'u küçültmek için Payload `select` parametresi.
 * `body` (Lexical rich text) dışarıda bırakılır — liste sayfaları gerekmez.
 */
const NEWS_LIST_SELECT =
  '&select[title]=true&select[slug]=true&select[category]=true' +
  '&select[author]=true&select[featuredImage]=true&select[tags]=true' +
  '&select[seo]=true&select[publishedAt]=true&select[updatedAt]=true&select[status]=true';

const BLOG_LIST_SELECT =
  '&select[title]=true&select[slug]=true&select[category]=true' +
  '&select[author]=true&select[featuredImage]=true' +
  '&select[seo]=true&select[publishedAt]=true&select[updatedAt]=true&select[status]=true';

/** Cloudflare Cache API — yalnızca Workers runtime'da mevcuttur (prod). */
function getCache(): any {
  try {
    // @ts-ignore
    return typeof caches !== 'undefined' && caches.default ? caches.default : null;
  } catch {
    return null;
  }
}

/** Edge cache'e yanıt yazar (hatalar sessizce yutulur). */
async function cachePut(
  cache: any,
  key: Request,
  body: ArrayBuffer,
  status: number,
  contentType: string | null,
  ttl: number
): Promise<void> {
  try {
    await cache.put(
      key,
      new Response(body, {
        status,
        headers: {
          'content-type': contentType ?? 'application/json',
          'cache-control': `public, max-age=${ttl}`,
          // Elle freshness kontrolü için — Cloudflare Cache API bazı durumlarda
          // max-age geçse bile eski yanıtı döndürebilir.
          'x-payload-cached-at': String(Date.now()),
        },
      })
    );
  } catch {
    // cache yazma hatası kritik değil
  }
}

/** Cache'ten yanıtı taze olarak döner; stale ise siler ve null döner. */
async function cacheGetFresh(cache: any, key: Request, ttl: number): Promise<Response | null> {
  try {
    const cached = await cache.match(key);
    if (!cached) return null;
    const cachedAt = Number(cached.headers.get('x-payload-cached-at') || 0);
    if (cachedAt && Date.now() - cachedAt < ttl * 1000) return cached;
    // stale → sil, taze istek yapılsın
    try {
      await cache.delete(key);
    } catch {
      // silme hatası kritik değil
    }
    return null;
  } catch {
    return null;
  }
}

/** Payload backend'in geçici 5xx hatalarına karşı retry ayarları. */
const RETRY_STATUSES = [500, 502, 503, 504];
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 400;

/**
 * Production list/detail reads are served by paback's lightweight `/api/lite/*`
 * endpoints (raw D1, no Payload cold-start cost). Local dev keeps the full
 * Payload REST API via the public URL.
 *
 * Only `/api/news?...` / `/api/blog?...` (query-string reads) are rewritten;
 * `/api/news/{id}` path lookups stay on the full Payload API.
 */
function toLiteEndpoint(endpoint: string): string {
  return endpoint
    .replace(/^\/api\/news(?=\?|$)/, '/api/lite/news')
    .replace(/^\/api\/blog(?=\?|$)/, '/api/lite/blog');
}

async function fetchPayloadOnce(endpoint: string): Promise<Response> {
  // @ts-ignore
  const paback = (cfEnv as any).PABACK;
  return paback
    ? paback.fetch(`http://admin${toLiteEndpoint(endpoint)}`)
    : fetch(`${PUBLIC_API_URL}${endpoint}`);
}

/**
 * Core fetch helper.
 * Production: PABACK Service Binding ile `http://admin/<endpoint>`, yanıtlar
 * Cloudflare Cache API'de TTL kadar önbelleklenir.
 * Local dev: public URL (cache yok).
 *
 * Geçici 5xx (500/502/503/504) ve ağ hatalarına karşı MAX_ATTEMPTS kadar
 * retry yapılır — Payload backend dengesiz (1.8–37s, anlık 500/503).
 */
export async function fetchFromPayload(endpoint: string): Promise<unknown> {
  const cache = getCache();
  const cacheKey = new Request(`${PAYLOAD_CACHE_PREFIX}${endpoint}`);

  if (cache) {
    const fresh = await cacheGetFresh(cache, cacheKey, PAYLOAD_CACHE_TTL);
    if (fresh) return fresh.json();
  }

  let res: Response | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      res = await fetchPayloadOnce(endpoint);
      // 4xx kalıcı hatadır — retry yok; 5xx'te son denemeye kadar devam et
      if (res.ok || !RETRY_STATUSES.includes(res.status) || attempt === MAX_ATTEMPTS) break;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
  }

  const finalRes = res!;
  if (finalRes.ok && cache) {
    const body = await finalRes.clone().arrayBuffer();
    await cachePut(cache, cacheKey, body, finalRes.status, finalRes.headers.get('content-type'), PAYLOAD_CACHE_TTL);
  }

  if (!finalRes.ok) throw new Error(`Payload API error: ${finalRes.status} ${endpoint}`);
  return finalRes.json();
}

// --- Type definitions ---

export interface NewsAuthor {
  id: number;
  name: string;
  slug: string;
  shortBio?: string | null;
  longBio?: any;
  socialLinks?: {
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    facebook?: string | null;
    youtube?: string | null;
  };
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export interface NewsFeaturedImage {
  id: number;
  alt: string;
  url: string;
  width: number;
  height: number;
}

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  body: unknown; // Lexical rich text — rendered separately
  category: NewsCategory;
  author: NewsAuthor;
  tags?: NewsTag[];
  featuredImage: NewsFeaturedImage | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  status: string;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
  };
}

export interface NewsListResponse {
  docs: NewsItem[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Fetch all news articles */
export async function fetchNewsList(
  page = 1,
  limit = 20,
  excludeCategoryIds?: number | number[]
): Promise<NewsListResponse> {
  let endpoint = `/api/news?depth=1&draft=true&trash=false&page=${page}&limit=${limit}`;
  if (excludeCategoryIds) {
    const ids = Array.isArray(excludeCategoryIds) ? excludeCategoryIds : [excludeCategoryIds];
    if (ids.length === 1) {
      endpoint += `&where[category][not_equals]=${ids[0]}`;
    } else if (ids.length > 1) {
      // Payload explicit array syntax for not_in
      ids.forEach((id) => {
        endpoint += `&where[category][not_in][]=${id}`;
      });
    }
  }
  endpoint += NEWS_LIST_SELECT;
  return fetchFromPayload(endpoint) as Promise<NewsListResponse>;
}

/** Fetch news articles by category ID */
export async function fetchNewsByCategory(
  categoryId: number,
  page = 1,
  limit = 20
): Promise<NewsListResponse> {
  const endpoint = `/api/news?depth=1&draft=true&trash=false&page=${page}&limit=${limit}&where[category][equals]=${categoryId}&sort=-publishedAt${NEWS_LIST_SELECT}`;
  return fetchFromPayload(endpoint) as Promise<NewsListResponse>;
}

/** Fetch a single news article by ID */
export async function fetchNewsById(id: number): Promise<NewsItem> {
  return fetchFromPayload(
    `/api/news/${id}?depth=2&draft=true&trash=false`
  ) as Promise<NewsItem>;
}

/** Fetch a single news article by slug */
export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  // Decode URL-encoded slug (handles Turkish chars like %C3%BC → ü)
  const decoded = decodeURIComponent(slug);
  const data = await fetchFromPayload(
    `/api/news?where[slug][equals]=${encodeURIComponent(decoded)}&depth=2&draft=true&trash=false&limit=1`
  ) as NewsListResponse;
  return data.docs[0] ?? null;
}

/**
 * Resolve the full image URL.
 * In production, proxies through /media/ endpoint so OG images
 * are served from the frontend domain (paraanaliz.com) instead of
 * admin.paraanaliz.com — required for social media crawlers.
 */
export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  // Already a full external URL (not Payload relative)
  if (url.startsWith('http') && !url.includes('admin.paraanaliz.com')) {
    return url;
  }
  // Payload relative path: /api/media/file/xxx.jpg
  const path = url.startsWith('/') ? url.slice(1) : url;
  // Strip the admin domain if present
  const cleanPath = path.replace('https://admin.paraanaliz.com/', '');
  return `/media/${cleanPath}`;
}

/**
 * Extract plain text from a Payload Lexical rich-text body.
 */
export function lexicalToPlainText(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const root = (body as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return '';

  const lines: string[] = [];

  function walk(nodes: unknown[]) {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const n = node as { type?: string; text?: string; children?: unknown[] };
      if (n.type === 'text' && n.text) {
        lines.push(n.text);
      } else if (n.children) {
        walk(n.children);
      }
    }
  }

  walk(root.children);
  return lines.join(' ');
}

// --- Blog types ---

export interface BlogAuthorPhoto {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface BlogAuthor {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  shortBio: string | null;
  profilePhoto: BlogAuthorPhoto | null;
  socialLinks: {
    twitter: string | null;
    instagram: string | null;
    linkedin: string | null;
    facebook: string | null;
    youtube: string | null;
  };
}

export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  body: unknown;
  category: NewsCategory | null;
  author: BlogAuthor | null;
  featuredImage: NewsFeaturedImage | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  status: string;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
  };
}

export interface BlogListResponse {
  docs: BlogItem[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Fetch blog posts list */
export async function fetchBlogList(
  page = 1,
  limit = 10
): Promise<BlogListResponse> {
  return fetchFromPayload(
    `/api/blog?depth=2&draft=true&trash=false&page=${page}&limit=${limit}&sort=-publishedAt${BLOG_LIST_SELECT}`
  ) as Promise<BlogListResponse>;
}

/** Fetch a single blog post by slug */
export async function fetchBlogBySlug(slug: string): Promise<BlogItem | null> {
  const data = await fetchFromPayload(
    `/api/blog?where[slug][equals]=${slug}&depth=2&draft=true&trash=false&limit=1`
  ) as BlogListResponse;
  return data.docs[0] ?? null;
}

/**
 * Extract YouTube video ID from various YouTube URL formats:
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * Returns null if not a YouTube URL.
 */
export function getYouTubeEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('?')[0];
      return id || null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v');
      }
      // youtube.com/embed/VIDEO_ID
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/embed/')[1].split('?')[0] || null;
      }
    }
  } catch {
    // invalid URL
  }
  return null;
}

/**
 * Render Payload Lexical rich-text nodes to HTML string.
 * Handles: heading, paragraph, text formatting, lists, blockquote, links.
 * YouTube links are rendered as responsive embedded iframes.
 */
export function lexicalToHtml(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const root = (body as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return '';

  function renderNode(node: unknown): string {
    if (!node || typeof node !== 'object') return '';
    const n = node as {
      type?: string;
      tag?: string;
      text?: string;
      format?: number;
      children?: unknown[];
      fields?: { url?: string; linkType?: string };
      value?: { url?: string; alt?: string };
    };

    if (n.type === 'text') {
      let text = (n.text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (n.format && n.format & 1)  text = `<strong>${text}</strong>`;
      if (n.format && n.format & 2)  text = `<em>${text}</em>`;
      if (n.format && n.format & 8)  text = `<u>${text}</u>`;
      if (n.format && n.format & 16) text = `<code>${text}</code>`;
      return text;
    }

    const inner = n.children ? n.children.map(renderNode).join('') : '';

    switch (n.type) {
      case 'heading':   return `<${n.tag}>${inner}</${n.tag}>\n`;
      case 'paragraph': return inner.trim() ? `<p>${inner}</p>\n` : '';
      case 'list':      return `<ul>${inner}</ul>\n`;
      case 'listitem':  return `<li>${inner}</li>`;
      case 'quote':     return `<blockquote>${inner}</blockquote>\n`;
      case 'link':
      case 'autolink': {
        const href = n.fields?.url ?? '#';
        // Check if this is a YouTube link — render as embed
        const ytId = getYouTubeEmbedId(href);
        if (ytId) {
          return `<div class="yt-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe
            src="https://www.youtube.com/embed/${ytId}"
            title="YouTube video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;"
          ></iframe></div>\n`;
        }
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
      }
      case 'upload': {
        const url = n.value?.url ? resolveMediaUrl(n.value.url) : '';
        const alt = n.value?.alt || '';
        if (url) {
          return `<figure class="content-image"><img src="${url}" alt="${alt}" loading="lazy" /></figure>\n`;
        }
        return '';
      }
      default: return inner;
    }
  }

  return root.children.map(renderNode).join('');
}
