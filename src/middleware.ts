import { defineMiddleware } from 'astro:middleware';

/**
 * HTML sayfaları için edge caching.
 * SSR sayfaları (/, /haberler, /yazarlar, vb.) Cloudflare Cache API'de
 * 60s taze + 300s stale-while-revalidate ile önbelleklenir. Böylece her
 * ziyaretçi Payload'a yavaş çağrı yapan taze SSR yerine cache'ten servis alır.
 *
 * /api/*, /media/* ve /_astro/* (statik assetler) middleware kapsamı dışındadır.
 */
const HTML_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

function getCache(): any {
  try {
    // @ts-ignore
    return typeof caches !== 'undefined' && caches.default ? caches.default : null;
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const method = context.request.method;

  const isCacheablePage =
    method === 'GET' &&
    !url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/media/') &&
    !url.pathname.startsWith('/_astro/');

  if (!isCacheablePage) {
    return next();
  }

  const cache = getCache();
  const cacheKey = new Request(url.toString());

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } catch {
      // cache okuma hatası → taze render
    }
  }

  const response = await next();

  if (response.status >= 200 && response.status < 400) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      response.headers.set('Cache-Control', HTML_CACHE_CONTROL);
      if (cache) {
        try {
          const body = await response.clone().arrayBuffer();
          await cache.put(
            cacheKey,
            new Response(body, {
              status: response.status,
              headers: {
                'content-type': contentType,
                'cache-control': HTML_CACHE_CONTROL,
              },
            })
          );
        } catch {
          // cache yazma hatası kritik değil
        }
      }
    }
  }

  return response;
});
