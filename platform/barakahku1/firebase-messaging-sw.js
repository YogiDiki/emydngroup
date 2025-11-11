// ====================================================
// 🔥 Firebase Cloud Messaging Service Worker (v8)
// Lokasi: /platform/barakahku1/firebase-messaging-sw.js
// ====================================================

console.log('🚀 [FCM-SW] Firebase Messaging SW starting...');

// Import Firebase SDK v8 (Legacy)
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

console.log('✅ [FCM-SW] Firebase scripts loaded');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
  authDomain: "barakahku-app.firebaseapp.com",
  projectId: "barakahku-app",
  storageBucket: "barakahku-app.firebasestorage.app",
  messagingSenderId: "510231053293",
  appId: "1:510231053293:web:921b9e574fc614492b5de4"
});

console.log('✅ [FCM-SW] Firebase initialized');

// Get messaging instance
const messaging = firebase.messaging();
console.log('✅ [FCM-SW] Messaging instance created');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📩 [FCM-SW] Background message received:', payload);
  
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

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [FCM-SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || 'https://www.emydngroup.com/platform/barakahku1/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/platform/barakahku1/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('✅ [FCM-SW] Ready to receive notifications');
console.log('📍 [FCM-SW] Scope:', self.registration.scope);