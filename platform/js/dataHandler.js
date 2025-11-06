// dataHandler.js
// --- Sistem penyimpanan dan reset otomatis harian untuk Emydn Langit ---

// Nama key di localStorage
const STORAGE_KEY = 'emydn_langit_data';

// Ambil data dari localStorage
function getData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { date: getToday(), habits: {} };
}

// Simpan data ke localStorage
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Ambil tanggal hari ini (format YYYY-MM-DD)
function getToday() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Reset checklist jika hari berganti
function checkResetDaily() {
  const data = getData();
  const today = getToday();

  if (data.date !== today) {
    // simpan history lama
    saveHistory(data);

    // reset data baru
    const newData = {
      date: today,
      habits: {},
    };
    saveData(newData);
    console.log('✅ Checklist direset otomatis untuk hari baru:', today);
  }
}

// Simpan history ibadah harian (maks. 7 hari terakhir)
function saveHistory(oldData) {
  const historyKey = 'emydn_langit_history';
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  history.push({
    date: oldData.date,
    habits: oldData.habits,
  });

  // batasi maksimal 7 hari terakhir
  if (history.length > 7) history.shift();
  localStorage.setItem(historyKey, JSON.stringify(history));
}

// Ambil history
function getHistory() {
  return JSON.parse(localStorage.getItem('emydn_langit_history')) || [];
}

// Update checklist ibadah
function updateHabit(name, status) {
  const data = getData();
  data.habits[name] = status;
  saveData(data);
}

// Cek status habit
function isHabitDone(name) {
  const data = getData();
  return !!data.habits[name];
}

// Jalankan reset harian saat halaman dibuka
checkResetDaily();

// Export function (kalau kamu mau pakai di file lain)
window.emydnData = {
  getData,
  updateHabit,
  isHabitDone,
  getHistory,
  checkResetDaily,
};
