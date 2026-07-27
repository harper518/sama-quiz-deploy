/* ====== 刷题助手 Service Worker ====== */
var CACHE_NAME = 'sama-quiz-v1';
var CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js'
];

// 安装：预缓存核心资源
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        CACHE_URLS.map(function(url) {
          return cache.add(url).catch(function() {
            // 某些 CDN 资源可能加载失败，不阻塞安装
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
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

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', function(e) {
  // 跳过 chrome-extension: 和非 GET 请求
  if (e.request.method !== 'GET' || e.request.url.indexOf('chrome-extension:') === 0) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      // 网络请求，成功后缓存 CDN 资源
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200) return response;

        // 仅缓存 CDN 静态资源
        if (/katex|jsdelivr|cdn/.test(e.request.url)) {
          var cloned = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, cloned);
          });
        }
        return response;
      }).catch(function() {
        // 离线且无缓存：返回首页（SPA fallback）
        return caches.match('./');
      });
    })
  );
});
