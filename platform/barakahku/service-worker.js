/* Simple service worker for caching + showNotification handling */
const CACHE_NAME = 'barakahku-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  // core assets - add more as needed
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

/* Fetch: network first for dynamic, else cache fallback */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      // Update cache
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
  );
});

/* Notification display when receiving message from client */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'show-notification') {
    const { title, body, tag } = data.payload;
    self.registration.showNotification(title, {
      body,
      tag: tag || 'barakahku',
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-192x192.png',
      vibrate: [100, 50, 100]
    });
  }
});

/* Click handler for notifications */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('/index.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/index.html');
    })
  );
});
