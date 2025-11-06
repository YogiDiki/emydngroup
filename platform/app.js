// ======== NAVIGASI ANTAR HALAMAN ========
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// ======== WAKTU SHOLAT ========
async function getPrayerTimes() {
  try {
    const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia');
    const data = await res.json();
    const times = data.data.timings;
    let html = '';
    for (let [name, time] of Object.entries(times)) {
      if (["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)) {
        html += `<p><b>${name}</b>: ${time}</p>`;
      }
    }
    document.getElementById('praytimes').innerHTML = html;
  } catch {
    document.getElementById('praytimes').innerHTML = 'Gagal memuat waktu sholat.';
  }
}

// ======== AYAT HARIAN ========
async function getDailyAyah() {
  const res = await fetch('data/quran.json');
  const quran = await res.json();
  const randomSurah = Math.floor(Math.random() * quran.length);
  const surah = quran[randomSurah];
  document.getElementById('dailyAyah').innerText =
    `${surah.text}\n(QS ${surah.surah}:${surah.ayah})`;
}

// ======== HABIT TRACKER ========

const defaultHabits = [
  "Shalat Subuh",
  "Shalat Dzuhur",
  "Shalat Ashar",
  "Shalat Maghrib",
  "Shalat Isya",
  "Ngaji / Tilawah",
  "Dzikir / Doa",
  "Sedekah",
  "Puasa Sunnah"
];

const habitListEl = document.getElementById('habitList');
let habits = JSON.parse(localStorage.getItem('habits')) || defaultHabits.map(h => ({ name: h, done: false }));
let lastReset = localStorage.getItem('lastReset');
let points = parseInt(localStorage.getItem('points')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;

// ======== FUNGSI HABIT ========

function renderHabits() {
  habitListEl.innerHTML = '';
  habits.forEach((habit, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
        <input type="checkbox" ${habit.done ? 'checked' : ''} onchange="toggleHabit(${index})">
        <span>${habit.name}</span>
      </label>
    `;
    habitListEl.appendChild(li);
  });
  updateStats();
}

function toggleHabit(index) {
  const habit = habits[index];
  habit.done = !habit.done;

  if (habit.done) addPoints(10); // ✅ 10 poin per ibadah
  else addPoints(-10); // ❌ kurangin poin kalau di-uncheck

  saveHabits();
  renderHabits();
}

function addHabit() {
  const nama = prompt('Masukkan nama habit baru:');
  if (nama) {
    habits.push({ name: nama, done: false });
    saveHabits();
    renderHabits();
  }
}

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('lastReset', new Date().toDateString());
  localStorage.setItem('points', points);
  localStorage.setItem('level', level);
}

function resetDailyHabits() {
  const today = new Date().toDateString();
  if (lastReset !== today) {
    habits = habits.map(h => ({ ...h, done: false }));
    saveHabits();
    renderHabits();
    console.log('✅ Habit direset untuk hari baru!');
  }
}

// ======== SISTEM POIN & LEVEL ========

function addPoints(amount) {
  points = Math.max(0, points + amount);
  const nextLevel = level * 100;

  if (points >= nextLevel) {
    level++;
    points = points - nextLevel;
    alert(`🎉 Selamat! Kamu naik ke level ${level}!`);
  }

  saveHabits();
  updateStats();
}

function updateStats() {
  document.getElementById('points').textContent = points;
  document.getElementById('level').textContent = level;
  const percent = Math.min((points / (level * 100)) * 100, 100);
  document.getElementById('levelProgress').style.width = percent + '%';
}

// ======== MULAI APLIKASI ========
getPrayerTimes();
getDailyAyah();
renderHabits();
resetDailyHabits();
