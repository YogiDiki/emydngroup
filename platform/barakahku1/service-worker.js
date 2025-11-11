// ====================================================
// 🔥 BarakahKu - Unified Service Worker (PWA + FCM)
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

// ✅ BUMP VERSION: Ubah ini setiap kali ada perubahan URL!
const CACHE_NAME = 'barakahku-cache-v16-no-html';

// ✅ UPDATE: URL tanpa .html
const urlsToCache = [
  '/platform/barakahku1',           // ✅ Tanpa trailing slash & .html
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v16 starting (Clean URLs)...');

// ====================================================
// FIREBASE CLOUD MESSAGING INTEGRATION
// ====================================================

try {
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

  console.log('✅ [SW] Firebase scripts loaded');

  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4"
  });

  console.log('✅ [SW] Firebase initialized');

  const messaging = firebase.messaging();
  console.log('✅ [SW] Firebase Messaging ready');

  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Background message:', payload);
    
    const title = payload.notification?.title || 'BarakahKu';
    const options = {
      body: payload.notification?.body || 'Notifikasi baru',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-fcm',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: payload.data || {}
    };
    
    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('⚠️ [SW] Firebase init failed:', err);
}

// ====================================================
// PWA CACHING STRATEGY
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v16 (Clean URLs)...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v16...');
  event.waitUntil(
    // ✅ DELETE ALL OLD CACHES
    caches.keys().then((keys) => {
      console.log('🗑️ [SW] Deleting old caches:', keys.filter(k => k !== CACHE_NAME));
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => caches.delete(key))
      );
    }).then(() => {
      console.log('✅ [SW] All old caches deleted');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip external APIs
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
    return event.respondWith(fetch(event.request));
  }
  
  // ✅ Network-first untuk /platform/barakahku1 (supaya selalu fresh)
  if (url.pathname.startsWith('/platform/barakahku1')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback ke cache jika offline
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/platform/barakahku1');
          });
        })
    );
    return;
  }
  
  // Cache-first untuk file lainnya
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || '/platform/barakahku1';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/platform/barakahku1') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ [SW] BarakahKu v16 ready (Clean URLs)');
console.log('📍 [SW] Scope:', self.registration.scope);