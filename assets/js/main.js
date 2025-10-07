// ====== Logika Awal Mobile Menu & Chatbot (Harus Didefinisikan Global) ======
const chatbotBtn = document.getElementById('chatbot-btn');
const chatbotModal = document.getElementById('chatbot-modal');
const closeChatbot = document.getElementById('close-chatbot');
const sendChat = document.getElementById('send-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// === Fungsionalitas Chatbot (Ditempatkan di sini untuk akses global) ===
const botResponses = {
    'halo': 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu?',
    'hai': 'Hai! Ada yang ingin Anda tanyakan tentang Emydn Group?',
    'bisnis': 'Kami memiliki 4 lini bisnis: Sistem & Aplikasi, Edukasi, Esport, dan F&B. Mana yang ingin Anda ketahui lebih lanjut?',
    'sistem': 'Lini bisnis Sistem & Aplikasi kami fokus pada pengembangan software, aplikasi mobile, dan sistem enterprise. Silakan kunjungi halaman Bisnis Kami untuk info lengkap!',
    'edukasi': 'Kami menyediakan platform pembelajaran online dan pelatihan profesional. Kunjungi halaman Bisnis Kami untuk mengetahui lebih lanjut!',
    'esport': 'Divisi Esport kami mengelola tim profesional dan menyelenggarakan turnamen. Tertarik bergabung?',
    'fnb': 'Bisnis F&B kami menawarkan konsep kuliner modern dan inovatif. Cek halaman Bisnis Kami untuk detail!',
    'kontak': 'Anda bisa menghubungi kami melalui WhatsApp di +62 858-1967-2814 atau email di emydngroup@gmail.com',
    'alamat': 'Kantor kami berlokasi di Jakarta, Indonesia. Untuk informasi lebih lanjut, kunjungi halaman Kontak.',
    'terima kasih': 'Sama-sama! Senang bisa membantu Anda 😊',
    'default': 'Maaf, saya belum mengerti pertanyaan Anda. Silakan hubungi tim kami melalui WhatsApp atau halaman Kontak untuk bantuan lebih lanjut.'
};

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    for (let key in botResponses) {
        if (lowerMessage.includes(key)) {
            return botResponses[key];
        }
    }
    return botResponses['default'];
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${isUser ? 'text-right' : 'text-left'}`;
    
    const messageContent = document.createElement('p');
    messageContent.className = `inline-block p-3 rounded-lg max-w-[80%] ${
        isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
    }`;
    messageContent.textContent = text;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.sendMessage = function() { // Gunakan window.sendMessage agar bisa diakses dari HTML
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, true);
        chatInput.value = '';
        
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, false);
        }, 500);
    }
}
// ---------------------------------------------------------------------------


// Fungsionalitas Pencarian Internal (Diambil dari Include.js sebelumnya)
window.handleInternalSearch = function(inputId) {
    const query = document.getElementById(inputId).value.trim().toLowerCase();

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

    // --- 1. Load Header & Footer (Menggunakan Promise.all untuk memastikan keduanya selesai) ---
    Promise.all([
        fetch('/partials/header.html').then(response => response.text()),
        fetch('/partials/footer.html').then(response => response.text())
    ])
    .then(([headerData, footerData]) => {
        // Isi kontainer
        document.getElementById('header').innerHTML = headerData;
        document.getElementById('footer').innerHTML = footerData;

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
                // Menggunakan scrollIntoView yang lebih modern
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // --- 3. Inisiasi Chatbot (Ditempatkan di sini) ---
    if (chatbotBtn) {
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
    if (closeChatbot) {
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
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => handleInternalSearch('searchInput'));
    }
    if (searchBtnMobile) {
        searchBtnMobile.addEventListener('click', () => handleInternalSearch('searchInputMobile'));
    }
}