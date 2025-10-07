/// =======================================================
// Chatbot Interaktif dengan Kata Kunci Sangat Detail
// =======================================================

const botResponsesDetail = {
    // === 1. KULINER (F&B) - /business/fnb.html ===
    'fnb': { judul: 'Lini Bisnis Kuliner (F&B)', deskripsi: 'Bisnis F&B kami menawarkan konsep kuliner modern melalui berbagai partner individu. Cek menu lengkap kami!', url: '/business/fnb.html' },
    'kuliner': { judul: 'Lini Bisnis Kuliner (F&B)', deskripsi: 'Bisnis F&B kami menawarkan konsep kuliner modern melalui berbagai partner individu. Cek menu lengkap kami!', url: '/business/fnb.html' },
    'martabak': { judul: 'Martabak Telur & Manis', deskripsi: 'Menu Martabak (Telur Mini dan Manis) tersedia di outlet partner kami di lokasi **Cilandak, Jakarta Selatan**.', url: '/business/fnb.html' },
    'cilok': { judul: 'Cilok Kuah', deskripsi: 'Menu Cilok Kuah tersedia di outlet partner kami di lokasi **Bangka, Jakarta Selatan**.', url: '/business/fnb.html' },
    'churros': { judul: 'Churros & Pancake', deskripsi: 'Menu Churros dan Pancake tersedia di outlet partner kami di lokasi **Setiabudi, Jakarta Selatan**.', url: '/business/fnb.html' },
    'gorengan': { judul: 'Aneka Gorengan', deskripsi: 'Menu Aneka Gorengan tersedia di outlet partner kami di lokasi **Kemayoran, Jakarta Pusat**.', url: '/business/fnb.html' },

    // === 2. PENDIDIKAN (Edukasi) - /business/education.html ===
    'edukasi': { judul: 'Lini Bisnis Pendidikan', deskripsi: 'Kami menyediakan Platform E-Learning (SD-SMK/SMA) dan program Bimbingan Tatap Muka Anak Usia Dini.', url: '/business/education.html' },
    
    // NEW KEY: 'bimba' added here
    'bimbel': { 
        judul: 'BIMBA/BIMBEL (Bimbingan Anak)', 
        deskripsi: 'Program BIMBA/BIMBEL tatap muka berlokasi di Bintang Junior Bangka Raya, JakSel, untuk anak usia 3 tahun ke atas.', 
        url: '/business/education.html' 
    },
    'bimba': { // <--- KEY BARU UNTUK MATCHING KATA KUNCI 'bimba'
        judul: 'BIMBA/BIMBEL (Bimbingan Anak)', 
        deskripsi: 'Program BIMBA/BIMBEL tatap muka berlokasi di Bintang Junior Bangka Raya, JakSel, untuk anak usia 3 tahun ke atas.', 
        url: '/business/education.html' 
    },
    
    'paud': { judul: 'PAUD/BIMBA', deskripsi: 'Program PAUD/BIMBA tatap muka kami berlokasi di Bintang Junior Bangka Raya, Jakarta Selatan, untuk anak usia 3 tahun ke atas.', url: '/business/education.html' },
    'elearning': { judul: 'Sistem E-Learning', deskripsi: 'Kami menyediakan pembelajaran online interaktif untuk jenjang SD, SMP, hingga SMK/SMA. Fokus pada materi spesifik per-kursus.', url: '/business/education.html' },

    // === 3. SISTEM & APLIKASI - /business/system.html ===
    'sistem': { judul: 'Pengembangan Sistem & Aplikasi', deskripsi: 'Fokus pada jasa pengembangan Website, Aplikasi Mobile (Android/iOS), dan Sistem ERP/Manajemen untuk bisnis.', url: '/business/system.html' },
    'aplikasi': { judul: 'Pengembangan Aplikasi Mobile', deskripsi: 'Kami mengembangkan aplikasi native maupun hybrid untuk platform **Android** dan iOS, dengan penawaran harga kompetitif.', url: '/business/system.html' },
    'android': { judul: 'Pengembangan Aplikasi Android', deskripsi: 'Kami mengembangkan aplikasi native maupun hybrid untuk platform Android dan iOS, dengan penawaran harga kompetitif.', url: '/business/system.html' },
    'website': { judul: 'Pengembangan Website', deskripsi: 'Kami menawarkan pengembangan website statis (landing page) hingga sistem manajemen (CMS/CRM/ERP) berbasis web.', url: '/business/system.html' },

    // === 4. ESPORT - /business/esport.html ===
    'esport': { judul: 'Ekosistem Esport', deskripsi: 'Divisi Esport kami fokus pada pelatihan, manajemen tim, dan penyelenggaraan turnamen game. Kami membangun komunitas game yang profesional.', url: '/business/esport.html' },
    'role': { judul: 'Peluang Role & Tim Esport', deskripsi: 'Kami merekrut dan melatih role-role spesifik untuk tim Esport kami. Kunjungi halaman Esport untuk informasi lebih lanjut mengenai peluang ini.', url: '/business/esport.html' },

    // === 5. PERTANYAAN UMUM (Pendaftaran/Biaya) & KONTAK ===
    
    // NEW KEY: 'pendaftaran' and 'biaya' for generic fee/registration questions
    'pendaftaran': { 
        judul: 'Informasi Pendaftaran dan Biaya', 
        deskripsi: 'Untuk info pendaftaran dan biaya program/layanan secara rinci (termasuk BIMBA/BIMBEL), silakan hubungi tim kami melalui tombol WhatsApp. Kami akan memberikan detail harga dan jadwal terbaru.', 
        url: '#' 
    },
    'biaya': { 
        judul: 'Informasi Pendaftaran dan Biaya', 
        deskripsi: 'Untuk info pendaftaran dan biaya program/layanan secara rinci (termasuk BIMBA/BIMBEL), silakan hubungi tim kami melalui tombol WhatsApp. Kami akan memberikan detail harga dan jadwal terbaru.', 
        url: '#' 
    },
    
    'harga': {
        judul: 'Estimasi Biaya Proyek',
        deskripsi: 'Estimasi biaya sangat bergantung pada kompleksitas fitur. Silakan konsultasi gratis via WhatsApp untuk detail estimasi biaya yang rinci.',
        url: '#' 
    },
    'kontak': {
        judul: 'Informasi Kontak',
        deskripsi: 'Anda bisa menghubungi tim kami secara langsung melalui WhatsApp atau email. Kami siap membantu konsultasi Anda!',
        url: '/contact.html'
    },
    'default_message': {
        judul: 'Pencarian Tidak Ditemukan',
        deskripsi: 'Maaf, saya tidak dapat menemukan hasil yang relevan. Silakan coba kata kunci yang lebih spesifik atau tekan tombol WA untuk konsultasi langsung.',
        url: '#',
    },
    'greeting_message': {
        judul: 'Hai!',
        deskripsi: 'Halo! Saya asisten AI Emydn Group. Tanyakan tentang produk spesifik seperti **Martabak, BIMBA, Android, atau Harga Proyek**, dan saya akan carikan informasinya!',
        url: '#',
    }
};

// --- FUNGSI MENDAPATKAN RESPON BOT (Simulasi AI Search) ---
// Logika ini tetap sama, ia akan mencari KEY (seperti 'pendaftaran' atau 'bimba') yang ada di dalam pesan user
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // 1. Cek Salam Pembuka
    if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('selamat pagi')) {
        return botResponsesDetail['greeting_message'];
    }

    // 2. Cek Kata Kunci Bisnis & Produk SPESIFIK
    for (let key in botResponsesDetail) {
        // Lewati pesan default dan greeting
        if (key === 'default_message' || key === 'greeting_message') continue; 
        
        // Cek apakah pesan mengandung KATA KUNCI
        if (lowerMessage.includes(key)) {
            return botResponsesDetail[key];
        }
    }

    // 3. Jika tidak ada yang cocok, berikan default
    return botResponsesDetail['default_message'];
}

// ... (fungsi addMessage dan sendMessage tidak perlu diubah)

// Fungsi addMessage dan sendMessage (tidak perlu diubah jika sudah menggunakan versi sebelumnya)
// ... (Pastikan Anda menggunakan fungsi addMessage dan sendMessage dari jawaban saya sebelumnya)


// --- FUNGSI MENAMPILKAN PESAN (Dengan Tombol WA CTA) ---
function addMessage(textOrObject, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${isUser ? 'text-right' : 'text-left'}`;
    
    const messageContent = document.createElement('div'); // Ubah ke div untuk menampung elemen lain
    messageContent.className = `inline-block p-3 rounded-lg max-w-[85%] break-words shadow-md ${
        isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
    }`;

    // Jika pesan dari user (hanya teks)
    if (isUser) {
        messageContent.textContent = textOrObject;
        messageDiv.appendChild(messageContent);
    } 
    // Jika pesan dari bot (berbentuk objek dengan judul, deskripsi, WA CTA)
    else {
        const response = textOrObject;
        
        // Judul Hasil Pencarian (Simulasi AI)
        const title = document.createElement('p');
        title.className = 'font-extrabold text-primary border-b border-primary/20 pb-1 mb-2';
        title.textContent = 'HASIL PENCARIAN (AI): ' + response.judul;
        messageContent.appendChild(title);

        // Deskripsi Hasil
        const description = document.createElement('p');
        description.className = 'text-sm mb-3';
        description.innerHTML = response.deskripsi; // Menggunakan innerHTML karena deskripsi mengandung <b> tag

        messageContent.appendChild(description);

        // --- TOMBOL WA CTA ---
        const waLink = 'https://wa.me/6285819672814?text=Halo%20Emydn%20Group%2C%20saya%20tertarik%20dengan%20' + encodeURIComponent(response.judul);
        const waButton = document.createElement('a');
        waButton.href = waLink;
        waButton.target = '_blank';
        waButton.className = 'mt-3 inline-block bg-green-500 text-white px-3 py-2 text-xs rounded-full font-semibold hover:bg-green-600 transition';
        waButton.innerHTML = '<i class="fab fa-whatsapp mr-1"></i> Konsultasi Lebih Lanjut';

        messageContent.appendChild(waButton);

        // Tambahkan tombol Lihat Detail jika ada URL yang valid (bukan '#')
        if (response.url && response.url !== '#') {
            const detailButton = document.createElement('a');
            detailButton.href = response.url;
            detailButton.className = 'mt-3 ml-2 inline-block bg-secondary/80 text-gray-900 px-3 py-2 text-xs rounded-full font-semibold hover:bg-secondary transition';
            detailButton.innerHTML = '<i class="fas fa-arrow-right mr-1"></i> Lihat Detail';
            messageContent.appendChild(detailButton);
        }

        messageDiv.appendChild(messageContent);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// --- REVISI FUNGSI WINDOW.SENDMESSAGE ---
// Fungsi ini harus memanggil addMessage dengan objek jika dari bot
window.sendMessage = function() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, true); // Tampilkan pesan pengguna
        chatInput.value = '';
        
        setTimeout(() => {
            const response = getBotResponse(message);
            // Panggil addMessage dengan objek respons (bukan hanya teks)
            addMessage(response, false); 
        }, 800); // Jeda simulasi ketik
    }
}
// ---------------------------------------------------------------------------


// Fungsionalitas Pencarian Internal (Biarkan seperti ini)
window.handleInternalSearch = function(inputId) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;
    
    const query = inputElement.value.trim().toLowerCase();

    if (!query) return;

    // Logika Pencarian
    if (query.includes('makan') || query.includes('food') || query.includes('f&b')) {
        window.location.href = '/business/fnb.html';
    } else if (query.includes('edukasi') || query.includes('belajar') || query.includes('education')) {
        window.location.href = '/business/education.html';
    } else if (query.includes('sistem') || query.includes('aplikasi') || query.includes('system') || query.includes('website')) {
        window.location.href = '/business/system.html';
    } else if (query.includes('esport') || query.includes('game')) {
        window.location.href = '/business/esport.html';
    } else if (query.includes('kontak') || query.includes('hubungi')) {
        window.location.href = '/contact.html';
    } else if (query.includes('tentang') || query.includes('about')) {
        window.location.href = '/about.html';
    } else if (query.includes('bisnis') || query.includes('line of business') || query.includes('lob')) {
        window.location.href = '/line-of-business.html';
    } else {
        alert('Hasil pencarian tidak ditemukan. Coba kata kunci yang lebih umum.');
    }

    // Tutup menu mobile setelah pencarian
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menu-icon');
    if (mobileMenu && menuIcon) {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// === Fungsi Utama yang Dijalankan Setelah DOM Dimuat ===
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Load Header & Footer ---
    Promise.all([
        fetch('/partials/header.html').then(response => response.text()),
        fetch('/partials/footer.html').then(response => response.text())
    ])
    .then(([headerData, footerData]) => {
        // Isi kontainer
        const headerEl = document.getElementById('header');
        const footerEl = document.getElementById('footer');
        if (headerEl) headerEl.innerHTML = headerData;
        if (footerEl) footerEl.innerHTML = footerData;

        // Panggil fungsi inisiasi header setelah elemen ada
        initHeaderFunctionality();
    })
    .catch(error => console.error('Gagal memuat partials:', error));


    // --- 2. Inisiasi Smooth Scroll (Tidak Perlu Diubah) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // --- 3. Inisiasi Chatbot (PENTING: Ambil elemen di sini) ---
    const chatbotBtn = document.getElementById('chatbot-btn');
    const chatbotModal = document.getElementById('chatbot-modal');
    const closeChatbot = document.getElementById('close-chatbot');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatbotBtn && chatbotModal && chatInput) {
        chatbotBtn.addEventListener('click', () => {
            chatbotModal.classList.toggle('hidden');
            if (!chatbotModal.classList.contains('hidden')) {
                // Opsional: Tambahkan salam pembuka awal jika chat kosong
                if (chatMessages && chatMessages.children.length === 0) {
                    addMessage(botResponses['halo'], false);
                }
                chatInput.focus();
            }
        });
    }
    if (closeChatbot && chatbotModal) {
        closeChatbot.addEventListener('click', () => {
            chatbotModal.classList.add('hidden');
        });
    }
    if (sendChat) {
        sendChat.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }


    // --- 4. Animation on Scroll (Tidak Perlu Diubah) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('section > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- 5. Scroll to Top Button (Tidak Perlu Diubah) ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    });
});


// === Fungsionalitas Header yang Terpisah (Diperlukan karena header di-load asinkron) ===
function initHeaderFunctionality() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menu-icon');

    // 1. Toggle Menu Mobile
    if (menuBtn && mobileMenu && menuIcon) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            } else {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        });

        // Tutup menu mobile saat klik link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            });
        });
    }

    // 2. Fungsionalitas Tombol Search
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    
    // Logika ini sudah memanggil window.handleInternalSearch yang ada di atas
    if (searchBtn) {
        searchBtn.addEventListener('click', () => handleInternalSearch('searchInput'));
    }
    if (searchBtnMobile) {
        searchBtnMobile.addEventListener('click', () => handleInternalSearch('searchInputMobile'));
    }
}