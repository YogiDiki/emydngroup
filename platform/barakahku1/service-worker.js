// ====================================================
// BarakahKu - Service Worker v25 (Minimal Clean)
// ====================================================

const CACHE_NAME = 'barakahku-v25';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] v25 starting...');
self.skipWaiting();

// ====================================================
// FIREBASE MESSAGING
// ====================================================

let firebaseReady = false;
let messaging = null;

async function initFirebase() {
  if (firebaseReady) return true;
  
  try {
    self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
    self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
    
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.firebasestorage.app",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4"
      });
    }
    
    messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      return self.registration.showNotification(
        payload.notification?.title || 'BarakahKu',
        {
          body: payload.notification?.body || 'Notifikasi baru',
          icon: '/platform/barakahku1/assets/icons/icon-192.png',
          badge: '/platform/barakahku1/assets/icons/icon-192.png',
          tag: 'barakahku-fcm',
          vibrate: [200, 100, 200],
          data: payload.data || {}
        }
      );
    });
    
    firebaseReady = true;
    console.log('✅ [SW] Firebase ready');
    return true;
  } catch (err) {
    console.error('❌ [SW] Firebase error:', err.message);
    return false;
  }
}

// ====================================================
// INSTALL & ACTIVATE
// ====================================================

self.addEventListener('install', (e) => {
  console.log('✅ [SW] Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('❌ [SW] Install error:', err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (e) => {
  console.log('✅ [SW] Activating...');
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys => 
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
    .then(() => new Promise(resolve => {
      setTimeout(() => {
        initFirebase().then(success => {
          if (success) {
            self.clients.matchAll().then(clients => {
              clients.forEach(c => c.postMessage({ type: 'SW_READY', firebaseReady: true }));
            });
          }
          resolve();
        });
      }, 500);
    }))
  );
});

// ====================================================
// FETCH
// ====================================================

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  if (url.origin !== location.origin) {
    return e.respondWith(fetch(e.request, { cache: 'no-store', mode: 'cors' }));
  }
  
  if (url.pathname.endsWith('/service-worker.js')) {
    return e.respondWith(fetch(e.request, { cache: 'no-store' }));
  }
  
  if (url.pathname.includes('/assets/icons/') || url.pathname.match(/\.(png|jpg|svg)$/)) {
    return e.respondWith(
      caches.match(e.request).then(cached => 
        cached || fetch(e.request).then(response => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
          }
          return response;
        })
      )
    );
  }
  
  if (url.pathname.match(/\/(app\.js|manifest\.json)$/)) {
    return e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
  
  if (url.pathname.startsWith('/platform/barakahku1')) {
    return e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match('/platform/barakahku1/index.html'))
    );
  }
  
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// ====================================================
// NOTIFICATION CLICK
// ====================================================

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes('/platform/barakahku1') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(e.notification.data?.url || '/platform/barakahku1');
    })
  );
});

// ====================================================
// MESSAGE HANDLER
// ====================================================

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  
  if (e.data?.type === 'CHECK_FIREBASE') {
    if (!firebaseReady) {
      initFirebase().then(success => {
        e.ports[0].postMessage({ ready: success, hasMessaging: !!messaging });
      });
    } else {
      e.ports[0].postMessage({ ready: firebaseReady, hasMessaging: !!messaging });
    }
  }
});

console.log('✅ [SW] v25 ready');