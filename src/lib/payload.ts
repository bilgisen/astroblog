/**
 * Payload CMS API client.
 *
 * Production (Cloudflare Workers): uses PABACK Service Binding via
 * `import { env } from "cloudflare:workers"` — Astro v6 compatible.
 *
 * Local dev: falls back to the public PAYLOAD_API_URL env variable.
 */

import { env as cfEnv } from 'cloudflare:workers';

const PUBLIC_API_URL =
  import.meta.env.PAYLOAD_API_URL ?? 'https://paback.paraanaliz.workers.dev';

/**
 * Core fetch helper.
 * Uses PABACK Service Binding in production, public URL in local dev.
 */
export async function fetchFromPayload(endpoint: string): Promise<unknown> {
  let res: Response;

  const paback = (cfEnv as unknown as { PABACK?: Fetcher }).PABACK;

  if (paback) {
    // Production: Service Binding — direct Worker-to-Worker call
    res = await paback.fetch(`http://paback${endpoint}`);
  } else {
    // Local dev: public URL
    res = await fetch(`${PUBLIC_API_URL}${endpoint}`);
  }

  if (!res.ok) throw new Error(`Payload API error: ${res.status} ${endpoint}`);
  return res.json();
}

// --- Type definitions ---

export interface NewsAuthor {
  id: number;
  name: string;
  slug: string;
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

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  body: unknown; // Lexical rich text — rendered separately
  category: NewsCategory;
  author: NewsAuthor;
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
  limit = 20
): Promise<NewsListResponse> {
  return fetchFromPayload(
    `/api/news?depth=1&draft=true&trash=false&page=${page}&limit=${limit}`
  ) as Promise<NewsListResponse>;
}

/** Fetch a single news article by ID */
export async function fetchNewsById(id: number): Promise<NewsItem> {
  return fetchFromPayload(
    `/api/news/${id}?depth=2&draft=true&trash=false`
  ) as Promise<NewsItem>;
}

/** Fetch a single news article by slug */
export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await fetchFromPayload(
    `/api/news?where[slug][equals]=${slug}&depth=2&draft=true&trash=false&limit=1`
  ) as NewsListResponse;
  return data.docs[0] ?? null;
}

/**
 * Resolve the full image URL.
 * Payload stores relative paths like /api/media/file/xxx.jpg
 */
export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${PUBLIC_API_URL}${url}`;
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
