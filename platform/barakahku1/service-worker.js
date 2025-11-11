// ====================================================
// 🔥 BarakahKu - PWA Service Worker
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

const CACHE_NAME = 'barakahku-cache-v8';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu Service Worker starting...');

// Install SW
self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v8...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v8...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => {
             console.log('🗑️ [SW] Delete old cache:', key);
             return caches.delete(key);
           })
      );
    }).then(() => {
      console.log('✅ [SW] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // PENTING: Skip caching untuk external APIs
  const externalAPIs = [
    'nominatim.openstreetmap.org',
    'api.aladhan.com',
    'equran.id',
    'gstatic.com',
    'googleapis.com',
    'firebaseio.com',
    'fcm.googleapis.com'
  ];
  
  // Jika request ke external API, langsung fetch tanpa cache
  if (externalAPIs.some(api => url.hostname.includes(api))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Untuk file lokal, gunakan cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Hanya cache response yang sukses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Clone response karena hanya bisa digunakan sekali
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch((err) => {
        console.error('❌ [SW] Fetch error:', err);
        // Fallback ke halaman utama jika offline
        return caches.match('/platform/barakahku1/index.html');
      });
    })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ [SW] BarakahKu PWA Service Worker v8 ready');