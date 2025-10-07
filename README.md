# Emydn Group Website

Website statis profesional untuk Emydn Group dengan 4 lini bisnis utama: Sistem & Aplikasi, Edukasi, Esport, dan F&B.

## 🌟 Fitur Utama

- **Responsive Design** - Tampilan optimal di semua perangkat
- **SEO Optimized** - Meta tags, heading structure, dan URL yang SEO-friendly
- **Blog System** - 3 artikel contoh dengan template yang dapat dikembangkan
- **AI Chatbot** - Chatbot sederhana untuk interaksi pengunjung
- **WhatsApp Integration** - Tombol floating untuk kontak langsung
- **Modern UI/UX** - Desain profesional dengan Tailwind CSS

## 📁 Struktur Folder

```
emydn-group-website/
├── index.html
├── about.html
├── contact.html
├── line-of-business.html
├── blog.html
├── articles/
│   ├── teknologi-edukasi-modern.html
│   ├── inovasi-esport-digital.html
│   └── tren-fnb-2025.html
├── assets/
│   └── js/
│       └── main.js
├── vercel.json
└── README.md
```

## 🚀 Deploy ke Vercel

### Opsi 1: Deploy via GitHub

1. **Buat Repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Emydn Group Website"
   git branch -M main
   git remote add origin https://github.com/username/emydn-group.git
   git push -u origin main
   ```

2. **Connect ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Klik "New Project"
   - Import repository Anda
   - Klik "Deploy"

### Opsi 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy ke Production**
   ```bash
   vercel --prod
   ```

## 🎨 Kustomisasi

### Warna

Edit warna di setiap file HTML pada bagian `tailwind.config`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#8B0000',    // Merah gelap
                secondary: '#87CEFA',  // Biru muda
            }
        }
    }
}
```

### Konten

- **Hero Section**: Edit di `index.html` bagian Hero Section
- **Lini Bisnis**: Edit di `line-of-business.html`
- **Blog**: Tambah artikel baru di folder `articles/`
- **Footer**: Edit informasi kontak di setiap file

### Chatbot Responses

Edit responses chatbot di `assets/js/main.js`:

```javascript
const botResponses = {
    'halo': 'Halo! Senang bertemu dengan Anda...',
    'bisnis': 'Kami memiliki 4 lini bisnis...',
    // Tambahkan response lainnya
};
```

## 📱 Fitur Responsif

Website ini fully responsive dengan breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Teknologi

- **HTML5** - Struktur semantik
- **Tailwind CSS** - Styling modern via CDN
- **Vanilla JavaScript** - Interaktivitas tanpa framework
- **Font Awesome** - Icon library
- **Vercel** - Hosting & deployment

## 📞 Kontak WhatsApp

Ubah nomor WhatsApp di semua file HTML:

```html
<a href="https://wa.me/6285819672814" target="_blank">
```

Ganti `6285819672814` dengan nomor Anda (format: kode negara + nomor tanpa 0 di depan)

## 🔍 SEO Tips

1. **Update Meta Tags** di setiap halaman
2. **Tambahkan Google Analytics** (optional)
3. **Submit Sitemap** ke Google Search Console
4. **Optimize Images** - gunakan format WebP untuk gambar
5. **Add Schema Markup** untuk rich snippets

## 📝 Menambah Artikel Baru

1. **Copy template artikel** dari `articles/` folder
2. **Ganti konten** judul, tanggal, dan isi artikel
3. **Update `blog.html`** tambahkan card artikel baru
4. **Update `vercel.json`** tambahkan rewrite rule:

```json
{
  "source": "/articles/artikel-baru",
  "destination": "/articles/artikel-baru.html"
}
```

## 🛠️ Maintenance

- **Update dependencies**: Tailwind CSS dan Font Awesome via CDN selalu up-to-date
- **Backup**: Gunakan Git untuk version control
- **Monitoring**: Setup Vercel Analytics untuk tracking

## 📄 License

Copyright © 2025 Emydn Group. All rights reserved.

## 🤝 Support

Untuk pertanyaan atau dukungan, hubungi:
- Email: info@emydngroup.com
- WhatsApp: +62 858-1967-2814

---

**Made with ❤️ by Emydn Group**