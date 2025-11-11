// ====================================================
// 🔥 BarakahKu - Unified Service Worker (PWA + FCM)
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

// ✅ BUMP VERSION: Ubah ini setiap kali ada perubahan URL!
const CACHE_NAME = 'barakahku-cache-v17-fixed';

// ✅ PERBAIKI: Tambah index.html dan assets lengkap
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html', // ✅ Wajib ada
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png',
  '/platform/barakahku1/assets/images/logo.png',
  '/platform/barakahku1/assets/css/styles.css'
];

console.log('🚀 [SW] BarakahKu v17 starting (Fixed URLs)...');

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
// PWA CACHING STRATEGY - DIPERBAIKI
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v17 (Fixed)...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Caching app files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v17...');
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('🗑️ [SW] Deleting old caches...');
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
  const requestUrl = event.request.url;
  
  // ✅ PERBAIKI: Skip SEMUA external APIs - BIARKAN LEWAT
  const externalAPIs = [
    'equran.id',
    'api.aladhan.com', 
    'nominatim.openstreetmap.org',
    'overpass-api.de',
    'gstatic.com',
    'googleapis.com',
    'firebaseio.com',
    'fcm.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'firebase.googleapis.com'
  ];
  
  // ✅ FIX: Biarkan semua API requests langsung ke network
  if (externalAPIs.some(api => requestUrl.includes(api))) {
    console.log('🌐 [SW] API Request allowed:', requestUrl);
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ✅ PERBAIKI: Untuk app routes, selalu serve index.html untuk SPA
  if (url.pathname.startsWith('/platform/barakahku1') && 
      !url.pathname.includes('.') && 
      !url.pathname.endsWith('/app.js') &&
      !url.pathname.endsWith('/service-worker.js') &&
      !url.pathname.includes('/assets/')) {
    
    console.log('🔄 [SW] SPA Route:', url.pathname);
    event.respondWith(
      caches.match('/platform/barakahku1/index.html')
        .then(cached => cached || fetch('/platform/barakahku1/index.html'))
    );
    return;
  }
  
  // ✅ Untuk app assets (js, css, images, icons) - cache first
  if (url.pathname.startsWith('/platform/barakahku1/assets/') ||
      url.pathname.endsWith('/app.js') ||
      url.pathname.endsWith('/manifest.json')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) {
            console.log('💾 [SW] Cache hit:', url.pathname);
            return cached;
          }
          return fetch(event.request).then(response => {
            // Cache the new response
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }
  
  // ✅ Default: network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
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

console.log('✅ [SW] BarakahKu v17 ready (Fixed)');
console.log('📍 [SW] Scope:', self.registration?.scope);