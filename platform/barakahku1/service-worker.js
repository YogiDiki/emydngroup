// ====================================================
// 🔥 BarakahKu - Service Worker (PWA + FCM) - v23
// ====================================================

const CACHE_NAME = 'barakahku-cache-v25';

const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v23 starting...');

// ✅ FORCE SKIP WAITING
self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v23...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 [SW] Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [SW] Cache populated successfully');
      })
      .catch(err => {
        console.error('❌ [SW] Cache error:', err);
        // Don't throw - allow SW to install even if cache fails
      })
  );
});

// ====================================================
// FIREBASE MESSAGING - SAFE INITIALIZATION
// ====================================================

let firebaseReady = false;
let messagingInstance = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

async function initFirebase() {
  if (firebaseReady) {
    console.log('✅ [SW] Firebase already initialized');
    return true;
  }

  if (initAttempts >= MAX_INIT_ATTEMPTS) {
    console.warn('⚠️ [SW] Max Firebase init attempts reached');
    return false;
  }

  initAttempts++;
  console.log(`📦 [SW] Firebase init attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}`);

  try {
    // Load Firebase scripts with timeout and error handling
    console.log('📥 [SW] Loading Firebase SDK v8...');
    
    await Promise.race([
      (async () => {
        try {
          importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
          console.log('✅ [SW] firebase-app.js loaded');
        } catch (e) {
          console.error('❌ [SW] Failed to load firebase-app.js:', e);
          throw new Error('Firebase app script load failed');
        }
        
        try {
          importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
          console.log('✅ [SW] firebase-messaging.js loaded');
        } catch (e) {
          console.error('❌ [SW] Failed to load firebase-messaging.js:', e);
          throw new Error('Firebase messaging script load failed');
        }
      })(),
      new Promise((_, reject) => 
        setTimeout(() => {
          console.error('⏱️ [SW] Firebase SDK load timeout (10s)');
          reject(new Error('Firebase SDK timeout'));
        }, 10000)
      )
    ]);

    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase not defined after script load');
    }
    console.log('✅ [SW] Firebase SDK available');

    // Initialize Firebase app
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
    } else {
      console.log('✅ [SW] Firebase app already exists');
    }

    // Get messaging instance
    console.log('📱 [SW] Creating messaging instance...');
    messagingInstance = firebase.messaging();
    
    if (!messagingInstance) {
      throw new Error('Failed to create messaging instance');
    }
    console.log('✅ [SW] Messaging instance created');
    
    // Setup background message handler
    console.log('🔔 [SW] Setting up background message handler...');
    messagingInstance.onBackgroundMessage((payload) => {
      console.log('📩 [SW] Background message received:', payload);
      
      try {
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
      } catch (e) {
        console.error('❌ [SW] Error showing notification:', e);
      }
    });
    
    console.log('✅ [SW] Background message handler ready');

    firebaseReady = true;
    console.log('🎉 [SW] Firebase Messaging fully initialized');
    return true;

  } catch (err) {
    console.error('❌ [SW] Firebase init failed:', err.message || err);
    firebaseReady = false;
    return false;
  }
}

// ====================================================
// ACTIVATE
// ====================================================

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v23...');
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
      // Claim clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ [SW] Activated and claiming clients');
      // Try to initialize Firebase after activation
      return initFirebase();
    })
    .then((success) => {
      if (success) {
        console.log('✅ [SW] Firebase ready after activation');
      } else {
        console.warn('⚠️ [SW] Firebase init failed, will retry on message');
      }
    })
    .catch(err => {
      console.error('❌ [SW] Activate error:', err);
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
        .catch(() => new Response('Network error', { status: 408 }))
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
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 404 }));
      })
    );
    return;
  }
  
  // ✅ NETWORK FIRST FOR APP FILES
  if (url.pathname.match(/\/(app\.js|manifest\.json)$/)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
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
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .catch(() => new Response('Offline', { status: 503 }))
  );
});

// ====================================================
// NOTIFICATION CLICK
// ====================================================

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || '/platform/barakahku1';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('/platform/barakahku1') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch(err => console.error('❌ [SW] Error handling notification click:', err))
  );
});

// ====================================================
// MESSAGE HANDLER
// ====================================================

self.addEventListener('message', (event) => {
  console.log('📨 [SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('⏭️ [SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CHECK_FIREBASE') {
    console.log('🔍 [SW] Firebase status check requested');
    const status = {
      ready: firebaseReady,
      hasMessaging: !!messagingInstance,
      attempts: initAttempts
    };
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(status);
    }
  }
  
  if (event.data?.type === 'INIT_FIREBASE') {
    console.log('🔄 [SW] Manual Firebase init requested');
    initFirebase().then(success => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success });
      }
    });
  }
});

// ====================================================
// ERROR HANDLER
// ====================================================

self.addEventListener('error', (event) => {
  console.error('❌ [SW] Global error:', event.error || event.message);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [SW] Unhandled promise rejection:', event.reason);
});

console.log('✅ [SW] v23 loaded and ready for installation');