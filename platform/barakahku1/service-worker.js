// ====================================================
// 🔥 PWA Service Worker (Cache Only - NO Firebase)
// ====================================================

const CACHE_NAME = 'barakahku-cache-v3';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

// Install SW
self.addEventListener('install', event => {
  console.log('✅ PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate SW & bersihkan cache lama
self.addEventListener('activate', event => {
  console.log('✅ PWA Service Worker activated');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🗑️ Deleting old cache:', key);
              return caches.delete(key);
            })
      );
    })
  );
  return self.clients.claim();
});

// Fetch dari cache dulu, fallback ke network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(err => {
        console.error('❌ Fetch error:', err);
      });
    })
  );
});

console.log('✅ PWA Service Worker ready');