// ====================================================
// 🔥 Firebase Cloud Messaging Service Worker ONLY
// File: firebase-messaging-sw.js (HARUS di root subdirectory)
// ====================================================
try {
  // Import Firebase scripts - gunakan versi COMPAT untuk service worker
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

  console.log('✅ Firebase scripts loaded');

  // Konfigurasi Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4",
    measurementId: "G-EQPYKJJGG7"
  });

  console.log('✅ Firebase initialized in SW');

  const messaging = firebase.messaging();

  // Handler untuk pesan background (ini yang muncul di Android tray)
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 📩 Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'BarakahKu - Notifikasi';
    const notificationOptions = {
      body: payload.notification?.body || 'Anda memiliki pesan baru.',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200], // Pola getar: vibrasi 200ms, pause 100ms, vibrasi 200ms
      data: {
        url: payload.notification?.click_action || 'https://www.emydngroup.com/platform/barakahku1/',
        time: new Date().getTime()
      },
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi',
          icon: '/platform/barakahku1/assets/icons/icon-192.png'
        },
        {
          action: 'close',
          title: 'Tutup'
        }
      ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Event listener ketika notifikasi diklik
  self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] 🖱️ Notification clicked:', event.action);
    
    event.notification.close(); // Tutup notifikasi

    // Buka aplikasi ketika notifikasi diklik
    if (event.action === 'open' || !event.action) {
      const urlToOpen = event.notification.data.url || 'https://www.emydngroup.com/platform/barakahku1/';
      
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((windowClients) => {
            // Cek apakah ada tab aplikasi yang sudah terbuka
            for (let i = 0; i < windowClients.length; i++) {
              const client = windowClients[i];
              if (client.url === urlToOpen && 'focus' in client) {
                return client.focus(); // Fokus ke tab yang sudah ada
              }
            }
            // Jika tidak ada, buka tab baru
            if (clients.openWindow) {
              return clients.openWindow(urlToOpen);
            }
          })
      );
    }
  });

  console.log('✅ Firebase Messaging Service Worker ready');

} catch (error) {
  console.error('❌ Firebase Messaging SW initialization failed:', error);
}