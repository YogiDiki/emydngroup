// ====================================================
// 🔥 BarakahKu - Service Worker (PWA + FCM) - FIXED
// ====================================================

const CACHE_NAME = 'barakahku-cache-v18-api-fixed';

const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v18 starting (API Fixed)...');

// ====================================================
// FIREBASE MESSAGING
// ====================================================

try {
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4"
  });

  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Background message:', payload);
    const title = payload.notification?.title || 'BarakahKu';
    const options = {
      body: payload.notification?.body || 'Notifikasi baru',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-fcm',
      vibrate: [200, 100, 200]
    };
    return self.registration.showNotification(title, options);
  });
  
  console.log('✅ [SW] Firebase ready');
} catch (err) {
  console.warn('⚠️ [SW] Firebase init failed:', err);
}

// ====================================================
// INSTALL & ACTIVATE
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v18...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v18...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ====================================================
// FETCH - CRITICAL FIX!
// ====================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ✅ CRITICAL: Skip ALL external domains - langsung fetch
  if (url.origin !== location.origin) {
    console.log('🌐 [SW] External request (bypassed):', url.href);
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ✅ Skip API endpoints (even if same origin)
  const apiPaths = ['/api/', '/v1/', '/v2/'];
  if (apiPaths.some(path => url.pathname.includes(path))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ✅ App assets (js, css, icons, images) - Cache First
  if (url.pathname.includes('/platform/barakahku1/assets/') ||
      url.pathname.endsWith('/app.js') ||
      url.pathname.endsWith('/manifest.json') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.css')) {
    
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          console.log('💾 [SW] Cache:', url.pathname);
          return cached;
        }
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
  
  // ✅ Service Worker file itself - NEVER cache
  if (url.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  
  // ✅ HTML pages under /platform/barakahku1/
  if (url.pathname.startsWith('/platform/barakahku1')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match('/platform/barakahku1/index.html');
        })
    );
    return;
  }
  
  // ✅ Everything else - Network First
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ====================================================
// NOTIFICATION CLICK
// ====================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/platform/barakahku1';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/platform/barakahku1') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ [SW] v18 ready - API calls bypassed');