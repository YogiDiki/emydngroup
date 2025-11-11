// ====================================================
// 🔥 BarakahKu - PWA Service Worker
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

const CACHE_NAME = 'barakahku-cache-v11';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu PWA Service Worker starting...');

// Install SW
self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v11...');
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
  console.log('✅ [SW] Activating v11...');
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
  
  // Skip caching untuk external APIs
  const externalAPIs = [
    'nominatim.openstreetmap.org',
    'api.aladhan.com',
    'equran.id',
    'gstatic.com',
    'googleapis.com',
    'firebaseio.com',
    'fcm.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'firebase.googleapis.com'
  ];
  
  if (externalAPIs.some(api => url.hostname.includes(api))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Cache-first strategy untuk file lokal
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch((err) => {
        console.error('❌ [SW] Fetch error:', err);
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

console.log('✅ [SW] BarakahKu PWA Service Worker v11 ready');
console.log('📍 [SW] Scope:', self.registration.scope);