// notification.js
document.addEventListener('DOMContentLoaded', async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      navigator.serviceWorker.register('sw.js').then(reg => {
        console.log('SW terdaftar:', reg);

        // Jadwal notifikasi dzuhur (contoh)
        setTimeout(() => {
          reg.showNotification('⏰ Waktu Dzuhur', {
            body: 'Ayo shalat Dzuhur sekarang! 🌙',
            icon: 'icons/icon-192x192.png',
          });
        }, 10000); // test 10 detik dulu
      });
    }
  }
});
