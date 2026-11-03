// Daftar Clean PWA Service Worker (Production-Optimized, Safe Caching)
const CACHE_NAME = 'daftar-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept non-GET, WebSockets, Next.js dev server, HMR, or chrome extensions
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('webpack') ||
    url.protocol.startsWith('chrome') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // Network-First with safe fallback (NEVER hangs the page)
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
