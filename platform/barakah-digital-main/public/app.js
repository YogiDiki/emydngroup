// BarakahKu - Islamic PWA App
// Alpine.js Application Logic

function barakahApp() {
    return {
        // State
        activeTab: 'quran',
        showSearch: false,
        showInstallPrompt: false,
        searchQuery: '',
        searchResults: [],
        selectedSurah: null,
        isStandalone: false,
        
        // Data
        surahs: [],
        doas: [],
        prayerTimes: {},
        location: 'Memuat lokasi...',
        bookmarks: [],
        lastRead: null,
        checklist: [
            { task: 'Sholat Subuh', done: false },
            { task: 'Dzikir Pagi', done: false },
            { task: 'Baca Al-Qur\'an', done: false },
            { task: 'Sholat Dzuhur', done: false },
            { task: 'Sholat Ashar', done: false },
            { task: 'Dzikir Sore', done: false },
            { task: 'Sholat Maghrib', done: false },
            { task: 'Sholat Isya', done: false },
            { task: 'Sedekah', done: false }
        ],
        
        // Audio Player
        currentAudio: null,
        isPlaying: false,
        audioProgress: 0,
        audioTime: '0:00',
        audioElement: null,
        deferredPrompt: null,

        // Initialize
        async init() {
            console.log('🕌 BarakahKu Started');
            
            // Check if standalone (already installed)
            this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                window.navigator.standalone === true;
            
            // Register Service Worker
            this.registerServiceWorker();
            
            // Setup PWA Install Prompt
            this.setupInstallPrompt();
            
            // Load saved data from localStorage
            this.loadFromStorage();
            
            // Load API data
            await this.loadQuranData();
            await this.loadDoaData();
            await this.loadPrayerTimes();
            
            // Setup audio element
            this.audioElement = document.getElementById('audioPlayer');
            
            // Check notification permission
            this.checkNotificationPermission();
            
            // Reset checklist daily
            this.checkDailyReset();
        },

        // Service Worker Registration
        registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('✅ Service Worker registered', reg))
                    .catch(err => console.error('❌ Service Worker registration failed', err));
            }
        },

        // PWA Install Prompt
        setupInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                this.showInstallPrompt = true;
            });
        },

        promptInstall() {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('✅ User accepted install');
                    }
                    this.deferredPrompt = null;
                    this.showInstallPrompt = false;
                });
            } else {
                alert('Untuk install:\n\niOS: Tap tombol Share → Add to Home Screen\nAndroid: Tap menu (⋮) → Install app');
            }
        },

        installPWA() {
            this.promptInstall();
        },

        // Load Quran Data from API
        async loadQuranData() {
            try {
                const response = await fetch('https://equran.id/api/v2/surat');
                const data = await response.json();
                this.surahs = data.data.map(surah => ({
                    number: surah.nomor,
                    name: surah.nama,
                    name_latin: surah.namaLatin,
                    name_short: surah.nama,
                    translation: surah.arti,
                    number_of_ayahs: surah.jumlahAyat,
                    revelation: surah.tempatTurun,
                    audio: surah.audioFull['05'] // Mishari Rashid al-Afasy
                }));
                console.log('✅ Loaded', this.surahs.length, 'surahs');
            } catch (error) {
                console.error('❌ Error loading Quran:', error);
            }
        },

        // Open Surah Detail
        async openSurah(number) {
            try {
                const response = await fetch(`https://equran.id/api/v2/surat/${number}`);
                const data = await response.json();
                this.selectedSurah = {
                    number: data.data.nomor,
                    name_latin: data.data.namaLatin,
                    name_short: data.data.nama,
                    translation: data.data.arti,
                    ayahs: data.data.ayat.map(ayah => ({
                        number: ayah.nomorAyat,
                        text: ayah.teksArab,
                        latin: ayah.teksLatin,
                        translation: ayah.teksIndonesia
                    }))
                };
                
                // Save as last read
                this.lastRead = { surah: number, ayah: 1 };
                this.saveToStorage();
                
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('❌ Error loading surah:', error);
            }
        },

        // Load Doa Data
        async loadDoaData() {
            // Hardcoded popular daily duas
            this.doas = [
                {
                    id: 1,
                    title: 'Doa Sebelum Makan',
                    arabic: 'اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
                    latin: 'Allahumma barik lana fiima razaqtana waqina \'adzaaban naar',
                    translation: 'Ya Allah, berkahilah kami dalam rezeki yang Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka.'
                },
                {
                    id: 2,
                    title: 'Doa Sesudah Makan',
                    arabic: 'اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ',
                    latin: 'Alhamdu lillahil ladzi ath\'amana wa saqona wa ja\'alna muslimin',
                    translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami orang muslim.'
                },
                {
                    id: 3,
                    title: 'Doa Masuk Rumah',
                    arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا',
                    latin: 'Bismillahi walajnaa, wa bismillahi kharajnaa, wa \'alallahi rabbina tawakkalnaa',
                    translation: 'Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.'
                },
                {
                    id: 4,
                    title: 'Doa Keluar Rumah',
                    arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ',
                    latin: 'Bismillahi, tawakkaltu \'alallahi, laa hawla wa laa quwwata illa billah',
                    translation: 'Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan melainkan dengan pertolongan Allah.'
                },
                {
                    id: 5,
                    title: 'Doa Sebelum Tidur',
                    arabic: 'بِاسْمِكَ اللّٰهُمَّ اَمُوْتُ وَاَحْيَا',
                    latin: 'Bismika Allahumma amuutu wa ahyaa',
                    translation: 'Dengan nama-Mu ya Allah aku mati dan aku hidup.'
                },
                {
                    id: 6,
                    title: 'Doa Bangun Tidur',
                    arabic: 'اَلْحَمْدُ ِللهِ الَّذِىْ اَحْيَانَا بَعْدَ مَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ',
                    latin: 'Alhamdu lillahil ladzi ahyana ba\'da ma amatana wa ilaihin nusyur',
                    translation: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati dan hanya kepada-Nya kami kembali.'
                },
                {
                    id: 7,
                    title: 'Doa Masuk Masjid',
                    arabic: 'اَللّٰهُمَّ افْتَحْ لِيْ اَبْوَابَ رَحْمَتِكَ',
                    latin: 'Allahummaf tah lii abwaaba rahmatik',
                    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.'
                },
                {
                    id: 8,
                    title: 'Doa Keluar Masjid',
                    arabic: 'اَللّٰهُمَّ اِنِّى اَسْأَلُكَ مِنْ فَضْلِكَ',
                    latin: 'Allahumma inni as-aluka min fadlik',
                    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu.'
                },
                {
                    id: 9,
                    title: 'Doa Naik Kendaraan',
                    arabic: 'سُبْحَانَ الَّذِىْ سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِيْنَ وَاِنَّآ اِلٰى رَبِّنَا لَمُنْقَلِبُوْنَ',
                    latin: 'Subhanal ladzi sakhkhara lana hadza wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun',
                    translation: 'Maha Suci (Allah) yang telah menundukkan ini semua bagi kami, padahal sebelumnya kami tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.'
                },
                {
                    id: 10,
                    title: 'Doa Minta Hujan',
                    arabic: 'اَللّٰهُمَّ اسْقِنَا غَيْثًا مُغِيْثًا مَرِيْئًا مَرِيْعًا نَافِعًا غَيْرَ ضَآرٍّ عَاجِلاً غَيْرَ اٰجِلٍ',
                    latin: 'Allahummas qina ghaitsan mughitsan mari-an mari\'an nafi\'an ghaira dhaarin \'ajilan ghaira aajil',
                    translation: 'Ya Allah, turunkanlah kepada kami hujan yang banyak, berguna, menyenangkan, dan bermanfaat, bukan yang berbahaya, dan segeralah Engkau menurunkannya, jangan Engkau tunda.'
                }
            ];
            console.log('✅ Loaded', this.doas.length, 'duas');
        },

        // Load Prayer Times
        async loadPrayerTimes() {
            try {
                // Get user location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        // Fetch prayer times from Aladhan API
                        const today = new Date();
                        const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
                        
                        const response = await fetch(
                            `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=11`
                        );
                        const data = await response.json();
                        
                        this.prayerTimes = {
                            subuh: data.data.timings.Fajr,
                            dzuhur: data.data.timings.Dhuhr,
                            ashar: data.data.timings.Asr,
                            maghrib: data.data.timings.Maghrib,
                            isya: data.data.timings.Isha
                        };
                        
                        this.location = data.data.meta.timezone;
                        
                        // Setup prayer notifications
                        this.setupPrayerNotifications();
                        
                        console.log('✅ Prayer times loaded:', this.prayerTimes);
                    }, (error) => {
                        console.error('❌ Location error:', error);
                        this.location = 'Lokasi tidak tersedia';
                        // Use default Jakarta times
                        this.prayerTimes = {
                            subuh: '04:30',
                            dzuhur: '12:00',
                            ashar: '15:15',
                            maghrib: '18:00',
                            isya: '19:10'
                        };
                    });
                }
            } catch (error) {
                console.error('❌ Error loading prayer times:', error);
            }
        },

        // Setup Prayer Notifications
        setupPrayerNotifications() {
            if ('Notification' in window && Notification.permission === 'granted') {
                // Check every minute for upcoming prayer
                setInterval(() => {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    
                    Object.entries(this.prayerTimes).forEach(([name, time]) => {
                        if (currentTime === time) {
                            this.sendNotification(`Waktu ${name.charAt(0).toUpperCase() + name.slice(1)}`, 'Sudah masuk waktu sholat');
                        }
                    });
                }, 60000); // Check every minute
            }
        },

        // Check Notification Permission
        checkNotificationPermission() {
            if ('Notification' in window && Notification.permission === 'default') {
                setTimeout(() => {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            console.log('✅ Notification permission granted');
                        }
                    });
                }, 3000);
            }
        },

        // Send Notification
        sendNotification(title, body) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    tag: 'barakahku-prayer',
                    requireInteraction: true
                });
            }
        },

        // Search Function
        performSearch() {
            if (this.searchQuery.length < 3) {
                this.searchResults = [];
                return;
            }

            const query = this.searchQuery.toLowerCase();
            this.searchResults = [];

            // Search in Duas
            this.doas.forEach(doa => {
                if (doa.title.toLowerCase().includes(query) ||
                    doa.translation.toLowerCase().includes(query) ||
                    doa.latin.toLowerCase().includes(query)) {
                    this.searchResults.push({
                        id: 'doa-' + doa.id,
                        type: 'Doa',
                        arabic: doa.arabic,
                        translation: doa.translation,
                        title: doa.title
                    });
                }
            });

            // Search in Surahs
            this.surahs.forEach(surah => {
                if (surah.name_latin.toLowerCase().includes(query) ||
                    surah.translation.toLowerCase().includes(query)) {
                    this.searchResults.push({
                        id: 'surah-' + surah.number,
                        type: 'Surah',
                        arabic: surah.name,
                        translation: `${surah.name_latin} - ${surah.translation}`,
                        title: surah.name_latin
                    });
                }
            });

            console.log('🔍 Search results:', this.searchResults.length);
        },

        // Bookmark Functions
        toggleBookmark(surahNumber, ayahNumber) {
            const key = `${surahNumber}-${ayahNumber}`;
            const index = this.bookmarks.indexOf(key);
            
            if (index > -1) {
                this.bookmarks.splice(index, 1);
            } else {
                this.bookmarks.push(key);
            }
            
            this.saveToStorage();
        },

        isBookmarked(surahNumber, ayahNumber) {
            return this.bookmarks.includes(`${surahNumber}-${ayahNumber}`);
        },

        // Checklist Functions
        saveChecklist() {
            this.saveToStorage();
        },

        checkDailyReset() {
            const today = new Date().toDateString();
            const lastCheck = localStorage.getItem('barakahku_last_check');
            
            if (lastCheck !== today) {
                // Reset checklist
                this.checklist.forEach(item => item.done = false);
                localStorage.setItem('barakahku_last_check', today);
                this.saveToStorage();
            }
        },

        // Audio Player Functions
        playMurottal(surah) {
            this.currentAudio = surah;
            this.audioElement.src = surah.audio;
            this.audioElement.play();
            this.isPlaying = true;
        },

        togglePlay() {
            if (this.audioElement.paused) {
                this.audioElement.play();
                this.isPlaying = true;
            } else {
                this.audioElement.pause();
                this.isPlaying = false;
            }
        },

        updateAudioProgress() {
            if (this.audioElement.duration) {
                this.audioProgress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
                
                const minutes = Math.floor(this.audioElement.currentTime / 60);
                const seconds = Math.floor(this.audioElement.currentTime % 60);
                this.audioTime = `${minutes}:${String(seconds).padStart(2, '0')}`;
            }
        },

        audioEnded() {
            // Auto-play next surah
            const currentIndex = this.surahs.findIndex(s => s.number === this.currentAudio.number);
            if (currentIndex < this.surahs.length - 1) {
                this.playMurottal(this.surahs[currentIndex + 1]);
            } else {
                this.isPlaying = false;
                this.currentAudio = null;
            }
        },

        // Storage Functions
        saveToStorage() {
            localStorage.setItem('barakahku_bookmarks', JSON.stringify(this.bookmarks));
            localStorage.setItem('barakahku_last_read', JSON.stringify(this.lastRead));
            localStorage.setItem('barakahku_checklist', JSON.stringify(this.checklist));
        },

        loadFromStorage() {
            const bookmarks = localStorage.getItem('barakahku_bookmarks');
            const lastRead = localStorage.getItem('barakahku_last_read');
            const checklist = localStorage.getItem('barakahku_checklist');
            
            if (bookmarks) this.bookmarks = JSON.parse(bookmarks);
            if (lastRead) this.lastRead = JSON.parse(lastRead);
            if (checklist) this.checklist = JSON.parse(checklist);
        },

        // Computed
        get checklistProgress() {
            const completed = this.checklist.filter(item => item.done).length;
            return Math.round((completed / this.checklist.length) * 100);
        }
    };
}