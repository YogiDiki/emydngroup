// ==============================
// BarakahKu - app.js (lengkap + Firebase Messaging)
// ==============================

// ------------------------------
// Fungsi inisialisasi Firebase Messaging (dynamic import, tidak mengganggu non-module script)
// ------------------------------
async function initFirebaseMessaging() {
  try {
    // Cek permission dulu sebelum init
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Notifikasi belum diizinkan, skip Firebase Messaging init');
      return;
    }

    // Dynamic import dari CDN (versi modular)
    const firebaseAppModule = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
    const firebaseMessagingModule = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js');

    const { initializeApp } = firebaseAppModule;
    const { getMessaging, getToken, onMessage } = firebaseMessagingModule;

    // === GANTI dengan konfigurasi Firebase milikmu jika perlu ===
  const firebaseConfig = {

    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4",
    measurementId: "G-EQPYKJJGG7"

  };


    // Inisialisasi Firebase App & Messaging
    const fbApp = initializeApp(firebaseConfig);
    const messaging = getMessaging(fbApp);

    console.log('✅ Firebase App initialized');

    // Ambil token FCM
    try {
      // ====== GANTI vapidKey dengan VAPID public key dari Firebase Console ======
      const vapidKey = 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM';

      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log('🔑 FCM token diperoleh:', currentToken);
        // TODO: kirim token ini ke server/database jika perlu
      } else {
        console.warn('⚠️ Tidak mendapatkan FCM token');
      }
    } catch (err) {
      console.error('❌ Gagal mengambil FCM token:', err);
    }

  // Handler notifikasi ketika app dalam keadaan foreground
onMessage(messaging, (payload) => {
  console.log('📩 Pesan FCM diterima (foreground):', payload);
  try {
    const title = payload?.notification?.title || 'BarakahKu - Notifikasi';
    const body = payload?.notification?.body || '';
    
    // Tampilkan notifikasi (jika permission granted)
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        tag: 'barakahku-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200], // Pola getar
        data: {
          url: payload.notification?.click_action || 'https://www.emydngroup.com/platform/barakahku1/'
        }
      });

      // Ketika notifikasi diklik di foreground
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus(); // Fokus ke aplikasi
        notification.close();
      };
    } else {
      console.log('🔔 Notifikasi diterima tapi permission belum granted');
    }
  } catch (err) {
    console.error('❌ Error menampilkan notifikasi foreground:', err);
  }
}

// ==============================
// APLIKASI UTAMA BARAKAHKU (asli, tidak diubah logika)
// ==============================
const app = {
  activeTab: 'beranda',
  showSearch: false,
  quran: [],
  currentSurah: null,
  doaList: [],
  murotalList: [],
  jadwal: {},
  cityName: 'Memuat lokasi...',
  checklist: [
    { id: 1, name: 'Sholat Subuh', description: 'Sholat wajib 2 rakaat', icon: '🌅', done: false },
    { id: 2, name: 'Sholat Dzuhur', description: 'Sholat wajib 4 rakaat', icon: '☀️', done: false },
    { id: 3, name: 'Sholat Ashar', description: 'Sholat wajib 4 rakaat', icon: '🌤️', done: false },
    { id: 4, name: 'Sholat Maghrib', description: 'Sholat wajib 3 rakaat', icon: '🌆', done: false },
    { id: 5, name: 'Sholat Isya', description: 'Sholat wajib 4 rakaat', icon: '🌙', done: false },
    { id: 6, name: 'Dzikir Pagi', description: 'Dzikir setelah subuh', icon: '📿', done: false },
    { id: 7, name: 'Dzikir Sore', description: 'Dzikir setelah ashar', icon: '📿', done: false },
    { id: 8, name: 'Baca Al-Quran', description: 'Minimal 1 halaman', icon: '📖', done: false },
    { id: 9, name: 'Sedekah', description: 'Berbagi kepada yang membutuhkan', icon: '💝', done: false },
    { id: 10, name: 'Doa Malam', description: 'Doa sebelum tidur', icon: '🌛', done: false }
  ],

  async init() {
    console.log('🚀 BarakahKu - Memulai aplikasi...');
    await this.loadQuran();
    this.loadDoa();
    this.loadJadwal();
    this.loadChecklist();
    await this.loadMurotalList();
    this.registerServiceWorker();

    // ======= Firebase Messaging akan diinit hanya setelah user klik tombol =======
    // TIDAK dipanggil otomatis lagi agar tidak error permission

    // 🎧 Tambahan fitur: auto-stop murottal
    document.addEventListener('play', function (e) {
      const audios = document.getElementsByTagName('audio');
      for (let i = 0; i < audios.length; i++) {
        if (audios[i] !== e.target) {
          audios[i].pause();
        }
      }
    }, true);

    console.log('✅ Aplikasi siap digunakan');
  },

  // Load daftar 114 surah dari API
  async loadQuran() {
    try {
      console.log('📖 Memuat daftar surah...');
      const res = await fetch('https://equran.id/api/v2/surat');
      const data = await res.json();
      this.quran = data.data.map(s => ({
        nomor: s.nomor,
        namaLatin: s.namaLatin,
        arti: s.arti,
        jumlahAyat: s.jumlahAyat
      }));
      console.log(`✅ ${this.quran.length} surah berhasil dimuat`);
    } catch (err) {
      console.error('❌ Gagal memuat Quran:', err);
    }
  },

  // Load detail surah
  async loadSurah(nomor) {
    try {
      console.log(`📖 Membuka surah nomor ${nomor}...`);
      const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const data = await res.json();
      this.currentSurah = {
        namaLatin: data.data.namaLatin,
        ayat: data.data.ayat.map(a => ({
          nomorAyat: a.nomorAyat,
          arab: a.teksArab,
          latin: a.teksLatin,
          teks: a.teksIndonesia
        }))
      };
      localStorage.setItem('lastRead', nomor);
      console.log(`✅ Surah ${data.data.namaLatin} berhasil dimuat`);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('❌ Gagal memuat surah:', err);
    }
  },

  // Load doa-doa harian
  loadDoa() {
    console.log('🙏 Memuat doa-doa harian...');
    this.doaList = [
      {
        id: 1,
        judul: 'Doa Sebelum Makan',
        arab: 'بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ',
        latin: 'Bismillahi wa \'ala barakatillah',
        terjemah: 'Dengan menyebut nama Allah dan atas berkah Allah'
      },
      {
        id: 2,
        judul: 'Doa Sesudah Makan',
        arab: 'اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ',
        latin: 'Alhamdulillahilladzi ath\'amana wasaqona waja\'alana muslimin',
        terjemah: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim'
      },
      {
        id: 3,
        judul: 'Doa Bangun Tidur',
        arab: 'اَلْحَمْدُ ِللهِ الَّذِيْ اَحْيَانَا بَعْدَمَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ',
        latin: 'Alhamdu lillahil ladzi ahyana ba\'da ma amatana wa ilaihin nusyur',
        terjemah: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati dan hanya kepada-Nya kami kembali'
      },
      {
        id: 4,
        judul: 'Doa Sebelum Tidur',
        arab: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        latin: 'Bismika Allahumma amuutu wa ahyaa',
        terjemah: 'Dengan nama-Mu ya Allah aku mati dan aku hidup'
      },
      {
        id: 5,
        judul: 'Doa Masuk Kamar Mandi',
        arab: 'اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِِ وَالْخَبَائِثِ',
        latin: 'Allahumma inni a\'udzu bika minal khubutsi wal khaba\'its',
        terjemah: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan'
      },
      {
        id: 6,
        judul: 'Doa Keluar Kamar Mandi',
        arab: 'غُفْرَانَكَ',
        latin: 'Ghufraanaka',
        terjemah: 'Aku mohon ampunan-Mu'
      },
      {
        id: 7,
        judul: 'Doa Masuk Masjid',
        arab: 'اَللَّهُمَّ افْتَحْ لِيْ أَبْوَابَ رَحْمَتِكَ',
        latin: 'Allahummaftah lii abwaaba rahmatika',
        terjemah: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu'
      },
      {
        id: 8,
        judul: 'Doa Keluar Masjid',
        arab: 'اَللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        latin: 'Allahumma inni as\'aluka min fadhlika',
        terjemah: 'Ya Allah, sesungguhnya aku mohon kepada-Mu dari karunia-Mu'
      },
      {
        id: 9,
        judul: 'Doa Memakai Pakaian',
        arab: 'اَلْحَمْدُ لِلَّهِ الَّذِيْ كَسَانِيْ هَذَا وَرَزَقَنِيْهِ...',
        latin: 'Alhamdu lillahil ladzi kasani hadza wa razaqanihi min ghairi haulin minni wa laa quwwata',
        terjemah: 'Segala puji bagi Allah yang memberi aku pakaian ini dan memberi rizki kepadaku tanpa daya dan kekuatan dariku'
      },
      {
        id: 10,
        judul: 'Doa Ketika Turun Hujan',
        arab: 'اَللَّهُمَّ صَيِّبًا نَافِعًا',
        latin: 'Allahumma shayyiban naafi\'aa',
        terjemah: 'Ya Allah, turunkanlah hujan yang bermanfaat'
      }
    ];
    console.log(`✅ ${this.doaList.length} doa berhasil dimuat`);
  },

  // Load daftar murottal dari API - 114 Surah Lengkap
  async loadMurotalList() {
    try {
      console.log('🎵 Memuat daftar murottal...');
      const res = await fetch('https://equran.id/api/v2/surat');
      const data = await res.json();

      // Ambil SEMUA 114 surah dengan audio lengkap
      this.murotalList = data.data.map(s => {
        let audioUrl = '';
        if (s.audioFull && s.audioFull['05']) {
          audioUrl = s.audioFull['05'];
        } else if (s.audioFull && s.audioFull['01']) {
          audioUrl = s.audioFull['01'];
        }

        return {
          id: s.nomor,
          nomor: s.nomor,
          judul: s.namaLatin + ' - ' + s.nama,
          qari: 'Mishari Rashid Al-Afasy',
          audio: audioUrl
        };
      });

      console.log(`✅ ${this.murotalList.length} murottal berhasil dimuat`);
    } catch (err) {
      console.error('❌ Gagal memuat murottal:', err);
      this.murotalList = [];
    }
  },

  // 🎧 Putar murottal dengan cepat tanpa delay
  playMurotal(audioUrl) {
    try {
      const player = document.getElementById('murotalPlayer');
      if (!player) {
        console.warn('⚠️ Audio element tidak ditemukan di halaman.');
        return;
      }

      player.src = audioUrl;
      player.load(); // pre-load audio sebelum play
      player.play()
        .then(() => console.log('🎶 Murottal diputar:', audioUrl))
        .catch(err => console.warn('⚠️ Autoplay diblokir, butuh interaksi user:', err));
    } catch (err) {
      console.error('❌ Gagal memutar murottal:', err);
    }
  },

  // Load jadwal sholat berdasarkan kota dari GPS
  async loadJadwal() {
    if (!navigator.geolocation) {
      this.cityName = 'Lokasi tidak tersedia';
      console.warn('⚠️ Geolocation tidak didukung browser');
      return;
    }

    console.log('📍 Mendapatkan lokasi...');
    this.cityName = 'Mendapatkan lokasi...';

    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      console.log(`📍 Lokasi: ${latitude}, ${longitude}`);

      try {
        // Get city name dari koordinat
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const geoData = await geoRes.json();

        this.cityName = geoData.address.city ||
                        geoData.address.town ||
                        geoData.address.county ||
                        geoData.address.state ||
                        'Lokasi Anda';

        console.log(`📍 Kota: ${this.cityName}`);

        // Ambil jadwal sholat
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
        const data = await res.json();
        this.jadwal = data.data.timings;

        console.log('✅ Jadwal sholat berhasil dimuat');
      } catch (err) {
        console.error('❌ Gagal memuat jadwal sholat:', err);
        this.cityName = 'Gagal memuat lokasi';
      }
    }, err => {
      console.error('❌ Gagal mendapatkan lokasi:', err);
      this.cityName = 'Lokasi ditolak';
    });
  },

  // Load checklist dari localStorage dan reset jika hari berganti
  loadChecklist() {
    console.log('✅ Memuat checklist ibadah...');
    const saved = localStorage.getItem('checklist');
    if (saved) {
      try {
        this.checklist = JSON.parse(saved);
      } catch (e) {
        console.error('❌ Error parsing checklist:', e);
      }
    }

    // Reset checklist setiap hari baru
    const lastDate = localStorage.getItem('checklistDate');
    const today = new Date().toDateString();
    if (lastDate !== today) {
      console.log('🔄 Hari baru, reset checklist');
      this.checklist.forEach(item => item.done = false);
      localStorage.setItem('checklistDate', today);
      this.saveChecklist();
    }

    const doneCount = this.checklist.filter(i => i.done).length;
    console.log(`✅ Checklist dimuat: ${doneCount}/${this.checklist.length} selesai`);
  },

  // Simpan checklist ke localStorage
  saveChecklist() {
    try {
      localStorage.setItem('checklist', JSON.stringify(this.checklist));
      const doneCount = this.checklist.filter(i => i.done).length;
      console.log(`💾 Checklist disimpan: ${doneCount}/${this.checklist.length} selesai`);
    } catch (e) {
      console.error('❌ Error saving checklist:', e);
    }
  },

  // Bookmark ayat favorit
  bookmarkAyat(nomorAyat) {
    try {
      let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const key = `${this.currentSurah.namaLatin}-${nomorAyat}`;

      if (!bookmarks.includes(key)) {
        bookmarks.push(key);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        alert(`✅ Ayat ${nomorAyat} dari Surah ${this.currentSurah.namaLatin} berhasil disimpan! 🔖`);
        console.log('🔖 Bookmark disimpan:', key);
      } else {
        alert('ℹ️ Ayat sudah tersimpan sebelumnya');
      }
    } catch (e) {
      console.error('❌ Error bookmarking ayat:', e);
      alert('❌ Gagal menyimpan ayat');
    }
  },

  // Install PWA
  installApp() {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User menerima install prompt');
        } else {
          console.log('❌ User menolak install prompt');
        }
        window.deferredPrompt = null;
      });
    } else {
      alert('ℹ️ Aplikasi sudah terinstall atau browser tidak mendukung instalasi PWA.\n\nUntuk menginstall:\n• Chrome Android: Buka menu → Install app\n• Safari iOS: Tap Share → Add to Home Screen');
    }
  },

  // Minta izin notifikasi dengan user interaction
  async requestNotificationPermission() {
    if (Notification.permission === 'granted') {
      alert('✅ Izin notifikasi sudah diberikan!');
      console.log('🔔 Permission sudah granted');
      return;
    }
    
    if (Notification.permission === 'denied') {
      alert('❌ Izin notifikasi ditolak. Silakan aktifkan dari pengaturan browser:\n\n1. Klik ikon gembok di address bar\n2. Cari "Notifications"\n3. Ubah ke "Allow"');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Init Firebase Messaging setelah permission granted
        await initFirebaseMessaging();
        alert('✅ Notifikasi berhasil diaktifkan!\n\nAnda akan menerima pengingat sholat dan notifikasi ibadah.');
        console.log('🔔 Permission granted, Firebase Messaging initialized');
      } else {
        alert('❌ Izin notifikasi ditolak');
      }
    } catch (err) {
      console.error('❌ Error meminta izin notifikasi:', err);
      alert('❌ Gagal meminta izin notifikasi: ' + err.message);
    }
  },

 // Register service worker (PISAH: PWA + Firebase Messaging)
 registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register PWA Service Worker
    navigator.serviceWorker.register('/platform/barakahku1/service-worker.js')
      .then(registration => {
        console.log('✅ PWA Service Worker terdaftar:', registration.scope);
      })
      .catch(err => {
        console.error('❌ Gagal register service-worker.js:', err);
      });

    // Register Firebase Messaging Service Worker (TERPISAH)
    navigator.serviceWorker.register('/platform/barakahku1/firebase-messaging-sw.js')
      .then(registration => {
        console.log('✅ Firebase Messaging SW terdaftar:', registration.scope);
        
        // Cek apakah notifikasi sudah granted, jika ya init Firebase Messaging
        if (Notification.permission === 'granted') {
          console.log('🔔 Notifikasi sudah diizinkan, inisialisasi Firebase Messaging...');
          // Tunggu sebentar agar SW benar-benar ready
          setTimeout(() => {
            initFirebaseMessaging();
          }, 1000);
        }
      })
      .catch(err => {
        console.error('❌ Gagal register firebase-messaging-sw.js:', err);
        console.error('Detail error:', err.message);
      });
  } else {
    console.warn('⚠️ Service Worker tidak didukung browser');
  }
}

};

// ------------------------------
// Event global untuk PWA install prompt (harus berada di luar objek app)
// ------------------------------
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('📲 Install prompt tersedia');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ BarakahKu berhasil diinstall!');
  window.deferredPrompt = null;
});

// Jalankan aplikasi
app.init();