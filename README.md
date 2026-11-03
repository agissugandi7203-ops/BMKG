# 🌋 BMKG Real-time Monitor & Leon Vasari VHS Archive

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

Platform web modern yang memadukan **Sistem Pemantauan Gempa Bumi & Peringatan Dini Tsunami Real-Time BMKG** dengan **Landing Page Eksklusif 3D Leon Vasari VHS Filmography Shelf**. Dibangun menggunakan framework **Next.js 14 (App Router)** dalam arsitektur **Unified Fullstack Monorepo**.

---

## 🧭 Peta Rute Aplikasi (Application Routing)

| Rute URL | Deskripsi Halaman | Akses |
|---|---|---|
| [`/`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/page.tsx) | **Leon Vasari — VHS Filmography Shelf Hero** (Landing Page Utama) | Publik |
| [`/bmkg`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/bmkg/page.tsx) | **BMKG Real-time Earthquake & Tsunami Monitor** (Dashboard Publik) | Publik |
| [`/earthquake/[id]`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/earthquake/[id]/page.tsx) | **Detail Kejadian Gempa Spesifik** (Shakemap resolusi penuh & share WA) | Publik |
| [`/admin/simulation`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/admin/simulation/page.tsx) | **Konsol Skenario Simulasi Gempa Tiruan** (Injeksi gempa demo hackathon) | Admin |
| [`/admin/logs`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/admin/logs/page.tsx) | **Audit Log Sinkronisasi BMKG** (Telemetri latensi jaringan) | Admin |
| [`/api/earthquakes`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/api/earthquakes/route.ts) | **Internal API Data Seismik** (Deduplikasi & caching data BMKG) | Publik |
| [`/api/health`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/app/api/health/route.ts) | **Health Check Endpoint** (Uptime & status koneksi) | Publik |

---

## 🌟 Fitur Utama

### 1. Dashboard Pemantauan Seismik BMKG (`/bmkg`)
- **Konsumsi Data Asli BMKG TEWS**: Terintegrasi langsung dengan 3 feed resmi BMKG (`autogempa.json`, `gempaterkini.json`, `gempadirasakan.json`).
- **Pencegahan Duplikasi & Idempotency**: Normalisasi data dan kalkulasi deterministik `event_hash` (MD5/SHA-256) untuk mencegah duplikasi rekaman.
- **Peta Spasial Indonesia (Leaflet GIS)**: Marker episentrum berdenyut (*pulsing beacon*) untuk gempa terkini dengan pewarnaan dinamis berdasarkan magnitudo, popup interaktif, dan tombol pusatkan peta.
- **Sirine Audio Peringatan (Web Audio API)**: Alarm audio otomatis ($M \ge 5.0$ atau mode simulasi) yang mematuhi kebijakan *browser autoplay policy* dengan tombol unlock dan mute.
- **Pratinjau Shakemap MMI**: Citra Shakemap resmi BMKG ditampilkan dalam modal lightbox resolusi penuh.
- **Konsol Simulasi Demo Terisolasi (`/admin/simulation`)**: Administrator dapat menguji respons darurat bencana dengan preset (*Megathrust Selat Sunda*, *Sesar Lembang*, dll.) tanpa merusak data asli BMKG. Banner merah menyala `⚠️ MODE SIMULASI AKTIF` otomatis muncul di dashboard.

### 2. Leon Vasari — 3D VHS Filmography Shelf Hero (`/` & `/vasari`)
- **3D Turning Cassette Shelf**: 36 kaset VHS 3D (3 putaran dari 12 film arsip Leon Vasari) dengan tekstur cover dan spine yang dipotong langsung menggunakan CSS background cropping dari Higgsfield image sheets (WebP).
- **Fisika Pegas & Tilt Interaktif**: Scroll roda mouse, drag kursor, keyboard panah, atau klik kaset mana pun untuk menggeser rak secara mulus (*sub-stepped spring physics*). Kaset aktif otomatis miring menghadap kursor.
- **Caption Mask Animation**: Judul, subjudul Romaji & Kanji, dan tahun rilis bergerak meluncur naik-turun melalui overflow mask saat film berganti.
- **Paper Sheet Growth & Ragged Ink Bleed**: Mengklik kaset atau tombol play akan memperbesar lembar kertas hingga layar penuh, teks sinopsis naik secara berurutan, dan poster film merebak menyerupai rembesan tinta (*ink bleed*) via SVG turbulence & displacement filter.
- **Paper Grain Noise Overlay**: Lapisan tekstur serat kertas analog SVG di seluruh layar.

---

## 📁 Struktur Direktori Monorepo

```text
BMKG/
├── app/                       # Next.js 14 App Router
│   ├── page.tsx               # Landing Page Utama (Leon Vasari 3D VHS Hero)
│   ├── bmkg/page.tsx          # Dashboard Publik Pemantauan Seismik BMKG
│   ├── earthquake/[id]/       # Halaman Detail Kejadian Gempa & Shakemap
│   ├── admin/                 # Konsol Administrator
│   │   ├── simulation/        # Pengendalian Skenario Simulasi Demo
│   │   └── logs/              # Audit Trail Sinkronisasi & Latensi BMKG
│   ├── api/                   # Backend Serverless Route Handlers
│   │   ├── earthquakes/       # Endpoint query data gempa & filter
│   │   ├── cron/sync-bmkg/    # Trigger sinkronisasi terpusat BMKG
│   │   ├── simulation/        # Start & stop simulasi kebencanaan
│   │   ├── health/            # Health check status sistem
│   │   └── logs/              # Log riwayat polling BMKG
│   ├── globals.css            # Tailwind CSS, font, & styling 3D preserve
│   └── layout.tsx             # Root Layout (Metadata, Leaflet stylesheet)
├── components/                # Komponen UI Modular
│   ├── VasariShelfHero.tsx    # Komponen Utama 3D VHS Filmography Shelf
│   ├── Navbar.tsx             # Navigasi BMKG, Toggle Sirine, Quick Switcher
│   ├── EarthquakeHero.tsx     # Kartu Sorotan Gempa Terkini
│   ├── EarthquakeMap.tsx      # Dynamic Client Wrapper Leaflet (No SSR)
│   ├── EarthquakeMapInner.tsx # Layer Map OpenStreetMap & Pulsing Markers
│   ├── EarthquakeList.tsx     # Tab Gempa M 5.0+, Dirasakan, dan Pencarian
│   ├── SimulationAlertBanner.tsx # Banner Peringatan Merah Mode Simulasi
│   └── SimulationModal.tsx    # Form Skenario Gempa Tiruan
├── lib/                       # Business Logic & Utility
│   ├── vasariData.ts          # Metadata 12 Film, Sheet URLs & Crop Boxes
│   ├── bmkg.ts                # Fetcher feed BMKG (Bypass Cloudflare 403)
│   ├── memoryStore.ts         # In-memory high-speed cache & state store
│   ├── audio.ts               # Web Audio API Synthesizer (Sirine & Chime)
│   └── types.ts               # Definisi antarmuka TypeScript
├── docs/                      # Dokumentasi Spesifikasi & Arsitektur (29 Dokumen)
├── public/                    # Aset statis & ikon
├── vercel.json                # Konfigurasi Deployment Vercel
├── .env.example               # Template Environment Variables
├── package.json               # Konfigurasi dependensi Node.js
└── README.md                  # Dokumentasi Utama Proyek
```

---

## 🚀 Panduan Menjalankan di Komputer Lokal (Local Development)

### Prasyarat
- [Node.js](https://nodejs.org/) v18.17+ atau v20+ atau v22+
- npm (bawaan Node.js) atau yarn / pnpm

### Langkah Menjalankan
```bash
# 1. Pindah ke direktori BMKG
cd BMKG

# 2. Salin template konfigurasi environment
cp .env.example .env.local

# 3. Instal dependensi
npm install

# 4. Jalankan server pengembangan
npm run dev
```

Buka peramban di **`http://localhost:3000`**:
- **Landing Page Leon Vasari:** `http://localhost:3000/`
- **Dashboard BMKG:** `http://localhost:3000/bmkg`
- **Konsol Simulasi:** `http://localhost:3000/admin/simulation`

Untuk menguji build produksi:
```bash
npm run build
npm run start
```

---

## ☁️ Panduan Deployment ke Vercel

Aplikasi ini 100% siap di-deploy ke Vercel tanpa perlu konfigurasi rumit:

### Opsi A: Melalui Dashboard Vercel (Rekomendasi)
1. Unggah kode ke repositori GitHub Anda: `https://github.com/agissugandi7203-ops/BMKG.git`.
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **"Add New..."** -> **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repositori `BMKG`.
4. Jika repositori Anda merupakan monorepo dengan subfolder, atur **Root Directory** ke `./` (atau `BMKG`).
5. Pada bagian **Environment Variables**, tambahkan variabel berikut (dapat disalin dari `.env.example`):
   - `CRON_SECRET` = *(string acak untuk melindungi endpoint cron)*
   - `BMKG_USER_AGENT` = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BMKG-Realtime-Monitor/1.0`
6. Klik **"Deploy"**. Vercel akan otomatis mendeteksi Next.js 14 dan mem-build aplikasi dalam ~60 detik.

### Opsi B: Melalui Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

---

## 📤 Panduan Push ke GitHub

Jalankan perintah berikut di terminal untuk menyinkronkan repositori lokal ke GitHub:

```bash
# 1. Pastikan berada di direktori BMKG
cd BMKG

# 2. Tambahkan remote GitHub (bila belum ada)
git remote add origin https://github.com/agissugandi7203-ops/BMKG.git

# 3. Pastikan branch utama bernama main
git branch -M main

# 4. Stage seluruh file dan commit
git add .
git commit -m "feat: complete BMKG Realtime Monitor and Leon Vasari VHS Shelf landing page"

# 5. Push ke GitHub
git push -u origin main
```

*(Jika remote `origin` sudah pernah dibuat sebelumnya, gunakan `git remote set-url origin https://github.com/agissugandi7203-ops/BMKG.git`)*

---

## 🏛️ Atribusi Sumber Data
Informasi kegempaan dan peringatan tsunami bersumber langsung dari **Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)** Indonesia melalui portal data terbuka TEWS (*Tsunami Early Warning System*):
- `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
- `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`

---

## 📜 Lisensi
Hak Cipta © 2026 BMKG Real-time Monitor Platform. Dilindungi Undang-Undang.
