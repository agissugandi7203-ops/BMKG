# BMKG Real-time Earthquake Monitor & Alert Platform

Platform pemantauan aktivitas gempa bumi terpadu di Indonesia yang terintegrasi langsung dengan data terbuka resmi BMKG TEWS (*Badan Meteorologi, Klimatologi, dan Geofisika*).

Sistem ini dibangun dengan arsitektur **Unified Fullstack Monorepo** (Next.js 14 App Router + Supabase), menyatukan antarmuka frontend responsif dan backend Route Handlers dalam satu project yang rapi, cepat, dan mudah di-manage.

---

## 🌟 Fitur Utama

- **Integrasi Data Asli BMKG**: Mengambil dan menormalisasi data dari 3 feed resmi BMKG (`autogempa.json`, `gempaterkini.json`, `gempadirasakan.json`).
- **Peta Seismik Spasial**: Peta interaktif kepulauan Indonesia (Leaflet + OpenStreetMap) dengan penanda berdenyut (*pulsing marker*) pada episentrum terkini.
- **Sirine Audio Peringatan (Web Audio API)**: Alarm suara otomatis saat terdeteksi gempa baru signifikan atau saat pengujian simulasi, dengan kepatuhan terhadap kebijakan *browser autoplay*.
- **Peta Guncangan (Shakemap)**: Menampilkan citra Shakemap MMI resmi BMKG dalam modal lightbox resolusi penuh.
- **Konsol Simulasi Demo Terisolasi**: Administrator/penguji dapat menguji respons darurat sistem (magnitudo, kedalaman, koordinat, potensi tsunami) tanpa mencampuri basis data resmi BMKG.
- **Backend & Frontend Menyatu**: Tidak ada server terpisah! Cukup jalankan satu perintah `npm run dev`, frontend dan backend API langsung aktif di port yang sama (`http://localhost:3000`).

---

## 📁 Struktur Direktori

```text
BMKG/
├── app/                       # Next.js App Router (Frontend Pages & Backend APIs)
│   ├── api/                   # Backend Route Handlers (REST API)
│   │   ├── earthquakes/       # GET: Query daftar gempa & gempa terkini
│   │   ├── cron/sync-bmkg/    # POST/GET: Ingestion & sinkronisasi data BMKG
│   │   ├── simulation/        # POST/GET/DELETE: Kontrol simulasi demo
│   │   └── health/            # GET: Status kesehatan sistem & sinkronisasi
│   ├── globals.css            # Styling tema gelap Tailwind CSS & animasi radar
│   ├── layout.tsx             # Root Layout (Leaflet stylesheet & metadata)
│   └── page.tsx               # Dashboard Utama Pemantauan Seismik
├── components/                # Komponen Antarmuka Pengguna
│   ├── Navbar.tsx             # Navigasi, Toggle Sirine, Status BMKG, Tombol Simulasi
│   ├── EarthquakeHero.tsx     # Kartu Sorotan Gempa Terkini + Shakemap Preview
│   ├── EarthquakeMap.tsx      # Dynamic Client Wrapper Peta Leaflet (No SSR)
│   ├── EarthquakeMapInner.tsx # Render Marker Episentrum & Layer OpenStreetMap
│   ├── EarthquakeList.tsx     # Tab Daftar Gempa M 5.0+ dan Gempa Dirasakan
│   ├── SimulationAlertBanner.tsx # Banner Merah Peringatan Mode Simulasi
│   └── SimulationModal.tsx    # Modal Kontrol Skenario Simulasi Demo
├── lib/                       # Modul Logika, Parser & State
│   ├── bmkg.ts                # Fetcher data BMKG dengan bypass proteksi Cloudflare 403
│   ├── memoryStore.ts         # In-memory cache & state store berkecepatan tinggi
│   ├── supabase.ts            # Client Supabase PostgreSQL
│   ├── audio.ts               # Sintesis suara sirine darurat berbasis Web Audio API
│   └── types.ts               # Definisi tipe TypeScript
├── sql/
│   └── schema.sql             # Skema DDL PostgreSQL untuk Supabase SQL Editor
├── docs/                      # Dokumentasi Teknis Lengkap (29 Dokumen Arsitektur)
├── .env.local                 # Konfigurasi Environment & Kredensial Supabase
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Server Pengembangan
Cukup jalankan satu perintah:
```bash
npm run dev
```
Buka browser di **`http://localhost:3000`**. Frontend dan Backend API sudah langsung aktif bersamaan!

---

## 🔌 Dokumentasi Endpoint Backend Internal

- `GET /api/earthquakes` : Mengambil daftar gempa terkini (mendukung filter `?limit=15`, `?min_magnitude=5.0`, `?type=felt`).
- `GET /api/earthquakes/latest` : Mengambil satu gempa paling mutakhir.
- `POST /api/cron/sync-bmkg` : Menjalankan sinkronisasi data dari server BMKG (dilindungi `CRON_SECRET`).
- `GET /api/simulation` : Mengambil status skenario simulasi aktif.
- `POST /api/simulation` : Memicu skenario simulasi gempa tiruan untuk demonstrasi.
- `DELETE /api/simulation` : Menghentikan simulasi aktif dan mengembalikan dashboard ke data BMKG.
- `GET /api/health` : Mengembalikan status kesehatan koneksi dan cache sistem.

---

## 🗄️ Menyiapkan Supabase Database

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) untuk project Anda: `https://uxcrswziszmzpgphyujo.supabase.co`.
2. Masuk ke menu **SQL Editor**.
3. Buka file [`sql/schema.sql`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/sql/schema.sql), salin seluruh isinya, dan klik **Run**.
4. Di menu **Project Settings -> API**, salin `anon public key` ke dalam file `.env.local` pada variabel `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
