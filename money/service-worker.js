// 교민 가계부 Service Worker — /money/ 경로용
const CACHE_VERSION = 'gyembu-v3';

const SHELL_ASSETS = [
  '/money/',
  '/money/index.html',
  '/money/manifest.json',
  '/money/icons/icon-192.png',
  '/money/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache =>
        Promise.allSettled(
          SHELL_ASSETS.map(url =>
            cache.add(url).catch(() => console.warn('[SW] 캐싱 실패:', url))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_VERSION)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // GET 외 요청은 건드리지 않음
  if (request.method !== 'GET') return;

  // API 요청은 캐싱 안 함
  if (url.pathname.startsWith('/money/api/')) return;

  // 환율 API는 네트워크 우선, 실패 시 에러 JSON
  if (url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response('{"error":"offline"}', {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // 문서(페이지 이동)는 최신 버전 우선
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(cache => {
              cache.put('/money/index.html', copy);
            });
          }
          return response;
        })
        .catch(() => caches.match('/money/index.html'))
    );
    return;
  }

  // 나머지 정적 파일은 Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});