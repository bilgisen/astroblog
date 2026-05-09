const API_URL = import.meta.env.PAYLOAD_API_URL;

/**
 * Fetch data from the Payload CMS API.
 * @param endpoint - The API endpoint path, e.g. "/api/news"
 * @returns Parsed JSON response
 */
export async function fetchFromPayload(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
  return res.json();
}

// --- Type definitions based on the Payload CMS news collection ---

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
export async function fetchNewsList(page = 1, limit = 20): Promise<NewsListResponse> {
  return fetchFromPayload(
    `/api/news?depth=1&draft=false&trash=false&page=${page}&limit=${limit}`
  );
}

/** Fetch a single news article by ID */
export async function fetchNewsById(id: number): Promise<NewsItem> {
  return fetchFromPayload(`/api/news/${id}?depth=2&draft=false&locale=undefined&trash=false`);
}

/** Fetch a single news article by slug */
export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data: NewsListResponse = await fetchFromPayload(
    `/api/news?where[slug][equals]=${slug}&depth=2&draft=false&trash=false&limit=1`
  );
  return data.docs[0] ?? null;
}

/**
 * Resolve the full image URL.
 * Payload stores relative paths like /api/media/file/xxx.jpg
 */
export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

/**
 * Extract plain text from a Payload Lexical rich-text body.
 * Used for excerpts / meta descriptions.
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
