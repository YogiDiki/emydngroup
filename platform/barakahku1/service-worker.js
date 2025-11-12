// ====================================================
// 🔥 BarakahKu - Service Worker (PWA + FCM) - v20
// ====================================================

const CACHE_NAME = 'barakahku-cache-v22';

const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v20 starting...');

// ✅ FORCE SKIP WAITING
self.skipWaiting();

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
    storageBucket: "barakahku-app.appspot.com",
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
// INSTALL
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v20...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('✅ [SW] Cache populated');
      return self.skipWaiting();
    })
  );
});

// ====================================================
// ACTIVATE
// ====================================================

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v20...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => {
             console.log('🗑️ [SW] Deleting old cache:', key);
             return caches.delete(key);
           })
      );
    }).then(() => {
      console.log('✅ [SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ====================================================
// FETCH
// ====================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ✅ BYPASS EXTERNAL APIs
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store', mode: 'cors' })
    );
    return;
  }
  
  // ✅ NEVER CACHE SERVICE WORKER
  if (url.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  
  // ✅ CACHE ICONS
  if (url.pathname.includes('/assets/icons/') || url.pathname.match(/\.(png|jpg|svg)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
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
  
  // ✅ NETWORK FIRST FOR APP FILES
  if (url.pathname.match(/\/(app\.js|manifest\.json)$/)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // ✅ ALWAYS FRESH HTML
  if (url.pathname.startsWith('/platform/barakahku1')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match('/platform/barakahku1/index.html'))
    );
    return;
  }
  
  // ✅ DEFAULT: NETWORK FIRST
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

// ====================================================
// MESSAGE HANDLER
// ====================================================

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ [SW] v20 ready');