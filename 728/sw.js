/* ====== 刷题工具 7.28 Service Worker v2 ====== */
var CACHE_NAME = 'quiz-728-v2';
var CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        CACHE_URLS.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET' || e.request.url.indexOf('chrome-extension:') === 0) return;

  // HTML 文件用网络优先（确保用户总是拿到最新版）
  if (e.request.destination === 'document' || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        // 网络成功 → 更新缓存
        var cloned = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, cloned);
        });
        return response;
      }).catch(function() {
        // 离线时回退缓存
        return caches.match(e.request);
      })
    );
    return;
  }

  // 其他资源缓存优先
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        var cloned = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, cloned);
        });
        return response;
      });
    })
  );
});
