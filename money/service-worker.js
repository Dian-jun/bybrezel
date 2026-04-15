// 교민 가계부 Service Worker — /money/ 경로용
// 목적:
// 1) index.html은 항상 최신 네트워크 우선
// 2) 아이콘/manifest만 가볍게 캐시
// 3) 캐시 버전 변경 시 오래된 캐시 제거
// 4) 모바일 홈 아이콘(PWA)에서 오래된 앱 코드가 남는 현상 최소화

const CACHE_VERSION = 'gyembu-v4';
const STATIC_CACHE = CACHE_VERSION;

const STATIC_ASSETS = [
  '/money/manifest.json',
  '/money/icons/icon-192.png',
  '/money/icons/icon-512.png',
];

// 안전한 캐시 put
const putInCache = async (request, response) => {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(STATIC_CACHE);
  await cache.put(request, response.clone());
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.warn('[SW] 초기 캐싱 실패:', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key !== STATIC_CACHE)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'SW_UPDATED' });
    }
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // GET 아닌 요청은 패스
  if (request.method !== 'GET') return;

  // cross-origin 요청은 건드리지 않음
  // (Supabase, esm.sh, Frankfurter 등 외부 요청 포함)
  if (url.origin !== self.location.origin) return;

  // 앱 내부 API가 있다면 캐시하지 않음
  if (url.pathname.startsWith('/money/api/')) return;

  // HTML 문서는 항상 최신 우선
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request, { cache: 'no-store' });

        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(STATIC_CACHE);
          await cache.put('/money/index.html', networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        const cached = await caches.match('/money/index.html');
        if (cached) return cached;

        return new Response('오프라인 상태입니다.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })());
    return;
  }

  // manifest / icons 는 cache-first
  const isStaticAsset =
    url.pathname === '/money/manifest.json' ||
    url.pathname.startsWith('/money/icons/');

  if (isStaticAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const networkResponse = await fetch(request);
      await putInCache(request, networkResponse);
      return networkResponse;
    })());
    return;
  }

  // 그 외 같은 origin 정적 파일은 network-first
  // 실패 시 캐시 fallback
  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(request);
      await putInCache(request, networkResponse);
      return networkResponse;
    } catch (err) {
      const cached = await caches.match(request);
      if (cached) return cached;

      return new Response('리소스를 불러올 수 없습니다.', {
        status: 504,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});