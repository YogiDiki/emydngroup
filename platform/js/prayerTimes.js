// prayerTimes.js — Notifikasi Waktu Shalat untuk Emydn Langit
const PRAYER_API = 'https://api.aladhan.com/v1/timingsByAddress';

async function fetchPrayerTimes() {
  try {
    const res = await fetch(`${PRAYER_API}?address=Jakarta, Indonesia&method=2`);
    const data = await res.json();
    const timings = data.data.timings;

    renderPrayerTimes(timings);
    scheduleNotifications(timings);
  } catch (err) {
    console.error('Gagal memuat jadwal shalat:', err);
  }
}

function renderPrayerTimes(timings) {
  const container = document.getElementById('prayer-times');
  if (!container) return;

  let html = `<div class="grid grid-cols-2 gap-2 text-sm mt-4">`;
  for (let [name, time] of Object.entries(timings)) {
    if (['Sunrise', 'Imsak', 'Midnight'].includes(name)) continue;
    html += `<div class="bg-gray-800 p-2 rounded flex justify-between">
      <span>${name}</span><span>${time}</span></div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function scheduleNotifications(timings) {
  if (!('Notification' in window)) return;

  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    for (let [name, time] of Object.entries(timings)) {
      if (['Sunrise', 'Imsak', 'Midnight'].includes(name)) continue;

      const [hour, minute] = time.split(':');
      const target = new Date(`${today}T${hour}:${minute}:00`);

      if (target > now) {
        const timeout = target - now;
        setTimeout(() => {
          new Notification(`Waktu ${name} telah tiba 🕌`, {
            body: 'Yuk, jangan lupa ibadah tepat waktu!',
            icon: '/icon.png',
          });
        }, timeout);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', fetchPrayerTimes);
