const CACHE_NAME = 'para-analiz-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      // addAll bir asset başarısız olursa reddeder — ön bellekleme dene, hata kritik değil
      .catch((err) => {
        console.warn('PWA: initial cache failed (offline?), continuing:', err);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip API, Wrangler, or CMS admin calls
  if (event.request.url.includes('/api/') || event.request.url.includes('/admin/')) return;

  // Identify static local assets we want to cache dynamically
  const isStaticAsset = event.request.url.startsWith(self.location.origin) &&
    (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|woff|ttf|webp)$/) || event.request.url.includes('/_astro/'));

  if (isStaticAsset) {
    // ── Stale-While-Revalidate Strategy ──
    // Returns cached response instantly, then fetches fresh version from network in background to update cache.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => null); // ağ hatası — sessizce cache'e düş

          return cachedResponse || fetchPromise;
        });
      }).catch(() => fetch(event.request))
    );
    return;
  }

  // ── Network-First with Cache Fallback for HTML Page Navigations ──
  // This ensures users always get the freshest articles. On network failure,
  // serve the cached version of the SAME URL — never a different page (the
  // home page) so that a shared article link can't silently open the home page.
  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return offlineFallback(event.request);
        });
      })
    );
    return;
  }

  // Default Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(() => offlineFallback(event.request))
  );
});

// Minimal offline page — shown only when the network fails AND there is no
// cached copy of the exact requested URL. Never redirects to the home page.
function offlineFallback(request) {
  return new Response(
    '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bağlantı kurulamadı</title></head><body style="font-family:system-ui,sans-serif;text-align:center;padding:4rem 1rem;color:#222"><h1>Bağlantı kurulamadı</h1><p>Lütfen internet bağlantınızı kontrol edip tekrar deneyin.</p><p><a href="/">Ana sayfaya dön</a></p></body></html>',
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}