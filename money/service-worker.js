// 교민 가계부 Service Worker — /money/ 경로용
const CACHE_VERSION = 'gyembu-v1';

const SHELL_ASSETS = [
  '/money/',
  '/money/index.html',
  '/money/manifest.json',
  '/money/icons/icon-192.png',
  '/money/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.allSettled(
        SHELL_ASSETS.map(url =>
          cache.add(url).catch(() => console.warn('[SW] 캐싱 실패:', url))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 캐싱 안 함
  if (url.pathname.startsWith('/money/api/')) return;

  // 환율 API는 네트워크 우선
  if (url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // 그 외: Cache First → Network Fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (request.method === 'GET' && response.status === 200) {
          const toCache = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, toCache));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('/money/index.html');
      });
    })
  );
});
