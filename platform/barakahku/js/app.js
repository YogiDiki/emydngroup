// File: js/app.js

function appData() {
  return {
    page: 'home', // halaman awal
    surahList: [],
    selectedSurah: null,

    // 🔹 Inisialisasi aplikasi
    async initApp() {
      console.log("📖 Memuat data Al-Qur'an...");
      await this.loadSurahList();
      this.setupInstallButton();
    },

    // 🔹 Ambil data surah.json
    async loadSurahList() {
      try {
        const res = await fetch('./data/surah.json');
        const data = await res.json();
        this.surahList = data.surahs;

        const listContainer = document.getElementById('quranList');
        listContainer.innerHTML = '';

        this.surahList.forEach((s) => {
          const el = document.createElement('div');
          el.className =
            'p-3 bg-white rounded-xl shadow hover:bg-green-50 cursor-pointer flex justify-between items-center';
          el.innerHTML = `
            <div>
              <p class="text-green-700 font-bold text-lg">${s.number}. ${s.name_latin}</p>
              <p class="text-sm text-gray-600">${s.meaning}</p>
            </div>
            <span class="text-2xl">${s.name}</span>
          `;
          el.addEventListener('click', () => this.openSurah(s.number));
          listContainer.appendChild(el);
        });
      } catch (e) {
        console.error('❌ Gagal memuat surah.json:', e);
      }
    },

    // 🔹 Buka surah tertentu
    async openSurah(number) {
      this.page = 'surah';
      const surah = this.surahList.find((s) => s.number === number);
      this.selectedSurah = surah;

      const container = document.querySelector('#quranList');
      container.innerHTML = `
        <button class="text-green-600 font-semibold mb-3" onclick="location.reload()">← Kembali ke daftar</button>
        <h2 class="text-xl font-bold mb-2 text-green-700">${surah.name_latin} (${surah.meaning})</h2>
        <p class="text-gray-600 mb-4">${surah.name} • ${surah.number_of_ayahs} ayat</p>
      `;

      surah.ayahs.forEach((a) => {
        const ayatDiv = document.createElement('div');
        ayatDiv.className = 'bg-white rounded-xl p-3 mb-2 shadow';
        ayatDiv.innerHTML = `
          <p class="text-right text-2xl mb-2">${a.arabic}</p>
          <p class="text-sm italic text-gray-700">${a.latin}</p>
          <p class="text-sm text-gray-600 mt-1">💬 ${a.translation}</p>
        `;
        container.appendChild(ayatDiv);
      });
    },

    // 🔹 Tombol instalasi PWA
    setupInstallButton() {
      let deferredPrompt;
      const installBtn = document.getElementById('installBtn');

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');

        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.log('✅ Aplikasi diinstal');
            }
            deferredPrompt = null;
            installBtn.classList.add('hidden');
          });
        });
      });
    },
  };
}
