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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('PWA: Clearing Old Cache:', cache);
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
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn('PWA: Background fetch failed for:', event.request.url, err);
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ── Network-First with Cache Fallback for HTML Page Navigations ──
  // This ensures users always get the freshest articles, falling back to offline mode if needed.
  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Default Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
