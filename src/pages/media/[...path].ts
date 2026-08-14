/**
 * Media proxy endpoint.
 * Proxies Payload CMS media files through the frontend domain.
 *
 * Usage: /media/api/media/file/image.jpg
 * Proxies to: https://admin.paraanaliz.com/api/media/file/image.jpg
 *
 * This ensures OG images are served from paraanaliz.com domain,
 * which social media crawlers can reliably access.
 */

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

const PUBLIC_API_URL =
  import.meta.env.PAYLOAD_API_URL ?? 'https://admin.paraanaliz.com';

/** Media dosyaları için edge cache TTL (saniye). */
const MEDIA_CACHE_TTL = 86400;

function getCache(): any {
  try {
    // @ts-ignore
    return typeof caches !== 'undefined' && caches.default ? caches.default : null;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ params, request }) => {
  const path = params.path;
  if (!path) {
    return new Response('Not found', { status: 404 });
  }

  const cache = getCache();
  const cacheKey = new Request(request.url);

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } catch {
      // cache okuma hatası → upstream'e düş
    }
  }

  try {
    // @ts-ignore
    const paback = (cfEnv as any).PABACK;
    let res: Response | null = null;
    const RETRY_STATUSES = [500, 502, 503, 504];
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (paback) {
        // Production: Service Binding
        res = await paback.fetch(`http://admin/${path}`);
      } else {
        // Local dev: Public URL
        res = await fetch(`${PUBLIC_API_URL}/${path}`);
      }
      if (res.ok || !RETRY_STATUSES.includes(res.status) || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }

    if (!res!.ok) {
      // 404'ün edge'de cache'lenmesini engelle — eski bir 404 cache kalıntısı
      // dosya geri geldiğinde bile kullanıcılara 404 döndürmesin.
      return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
    }

    const contentType = res!.headers.get('content-type') ?? 'image/jpeg';
    const body = await res!.arrayBuffer();

    const response = new Response(body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': `public, max-age=${MEDIA_CACHE_TTL}`,
      },
    });

    if (cache) {
      try {
        await cache.put(cacheKey, response.clone());
      } catch {
        // cache yazma hatası kritik değil
      }
    }

    return response;
  } catch (err) {
    console.error('Media proxy error:', err);
    return new Response('Error', { status: 500 });
  }
};
