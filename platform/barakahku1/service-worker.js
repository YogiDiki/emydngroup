// ====================================================
// 🔥 BarakahKu - Service Worker (PWA + FCM) - v24
// ====================================================

const CACHE_NAME = 'barakahku-cache-v26';

const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v24 starting...');

// ✅ FORCE SKIP WAITING
self.skipWaiting();

// ====================================================
// FIREBASE MESSAGING - IMPROVED WITH BETTER TIMING
// ====================================================

let firebaseReady = false;
let messagingInstance = null;
let initPromise = null; // Track initialization promise

async function initFirebase() {
  // Return existing promise if already initializing
  if (initPromise) {
    console.log('⏳ [SW] Firebase init already in progress, waiting...');
    return initPromise;
  }

  if (firebaseReady) {
    console.log('✅ [SW] Firebase already initialized');
    return true;
  }

  // Create and store the initialization promise
  initPromise = (async () => {
    try {
      console.log('📦 [SW] Loading Firebase SDK v8...');
      
      // Load Firebase scripts
      console.log('📥 [SW] Importing firebase-app.js v8...');
      self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
      console.log('✅ [SW] firebase-app.js loaded');
      
      console.log('📥 [SW] Importing firebase-messaging.js v8...');
      self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
      console.log('✅ [SW] firebase-messaging.js loaded');

      console.log('✅ [SW] Firebase SDK imported');
      console.log('📊 [SW] Firebase available:', typeof firebase !== 'undefined');

      // Initialize Firebase with CORRECT config
      if (!firebase.apps || firebase.apps.length === 0) {
        console.log('🔧 [SW] Initializing Firebase app...');
        firebase.initializeApp({
          apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
          authDomain: "barakahku-app.firebaseapp.com",
          projectId: "barakahku-app",
          storageBucket: "barakahku-app.firebasestorage.app",
          messagingSenderId: "510231053293",
          appId: "1:510231053293:web:921b9e574fc614492b5de4"
        });
        console.log('✅ [SW] Firebase app initialized');
        console.log('📊 [SW] Firebase apps:', firebase.apps.length);
      }

      // Get messaging instance
      console.log('📱 [SW] Creating messaging instance...');
      messagingInstance = firebase.messaging();
      console.log('✅ [SW] Messaging instance created');
      
      // Setup background message handler
      console.log('🔔 [SW] Setting up background message handler...');
      messagingInstance.onBackgroundMessage((payload) => {
        console.log('📩 [SW] Background message received:', payload);
        const title = payload.notification?.title || 'BarakahKu';
        const options = {
          body: payload.notification?.body || 'Notifikasi baru',
          icon: '/platform/barakahku1/assets/icons/icon-192.png',
          badge: '/platform/barakahku1/assets/icons/icon-192.png',
          tag: 'barakahku-fcm',
          vibrate: [200, 100, 200],
          data: payload.data || {}
        };
        return self.registration.showNotification(title, options);
      });
      console.log('✅ [SW] Background message handler ready');

      firebaseReady = true;
      console.log('🎉 [SW] Firebase Messaging fully ready');
      return true;

    } catch (err) {
      console.error('❌ [SW] Firebase init failed:', err);
      console.error('❌ [SW] Error name:', err.name);
      console.error('❌ [SW] Error message:', err.message);
      firebaseReady = false;
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

// DON'T initialize Firebase immediately - wait for activation
console.log('💡 [SW] Firebase will be initialized after activation');

// ====================================================
// INSTALL
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v24...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Caching resources...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [SW] Cache populated');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('❌ [SW] Install error:', err);
        // Don't fail installation, just log error
        return self.skipWaiting();
      })
  );
});

// ====================================================
// ACTIVATE
// ====================================================

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v24...');
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME)
             .map((key) => {
               console.log('🗑️ [SW] Deleting old cache:', key);
               return caches.delete(key);
             })
        );
      }),
      // Claim clients FIRST
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ [SW] Activated and claiming clients');
      // Initialize Firebase AFTER claiming clients with small delay
      console.log('🔥 [SW] Scheduling Firebase initialization...');
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('🔥 [SW] Starting Firebase initialization...');
          initFirebase().then(success => {
            if (success) {
              console.log('✅ [SW] Firebase initialized successfully');
              // Notify all clients that SW is ready
              return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({ 
                    type: 'SW_READY',
                    firebaseReady: true,
                    timestamp: Date.now()
                  });
                });
                resolve();
              });
            } else {
              console.warn('⚠️ [SW] Firebase initialization failed');
              resolve();
            }
          }).catch(err => {
            console.error('❌ [SW] Firebase init error:', err);
            resolve();
          });
        }, 500); // 500ms delay to ensure SW is fully activated
      });
    })
    .catch(err => {
      console.error('❌ [SW] Activate error:', err);
      // Don't fail activation
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
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
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
  console.log('📨 [SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CHECK_FIREBASE') {
    // If Firebase isn't ready yet, try to initialize it
    if (!firebaseReady) {
      console.log('🔥 [SW] Firebase check triggered, initializing...');
      initFirebase().then(success => {
        event.ports[0].postMessage({ 
          ready: success,
          hasMessaging: !!messagingInstance,
          timestamp: Date.now()
        });
      });
    } else {
      event.ports[0].postMessage({ 
        ready: firebaseReady,
        hasMessaging: !!messagingInstance,
        timestamp: Date.now()
      });
    }
  }
  
  if (event.data?.type === 'INIT_FIREBASE') {
    console.log('🔥 [SW] Manual Firebase init requested');
    initFirebase().then(success => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ 
          success,
          ready: firebaseReady,
          hasMessaging: !!messagingInstance
        });
      }
    });
  }
});

console.log('✅ [SW] v24 ready');