# Pemilihan Teknologi & Evaluasi Stack (Technology Stack)

Dokumen ini menjelaskan pemilihan setiap komponen teknologi yang digunakan, evaluasi alternatif, kelebihan, keterbatasan, dan justifikasi teknis dalam koridor batas waktu hackathon **13 jam**.

---

## 1. Ringkasan Matriks Teknologi Terpilih

| Lapisan / Kebutuhan | Teknologi Terpilih | Versi / Rilis | Justifikasi Utama |
| :--- | :--- | :--- | :--- |
| **Framework Fullstack** | Next.js (App Router) | v14+ / v15 | Fullstack monorepo, Server Components untuk SEO cepat, Route Handlers untuk serverless backend. |
| **Bahasa Pemrograman** | TypeScript | v5+ | Jaminan type-safety dari skema database Supabase hingga komponen UI React. |
| **Styling & UI Kit** | Tailwind CSS + shadcn/ui | Latest | Komponen aksesibel siap pakai, styling cepat tanpa menulis CSS kustom dari nol. |
| **Iconography** | Lucide React | Latest | Koleksi icon kebencanaan lengkap (Activity, MapPin, AlertTriangle, Volume2, Shield). |
| **GIS & Peta** | Leaflet + React-Leaflet + OSM | Leaflet v1.9+ | Peta open-source tanpa perlu API Key/biaya (berbeda dengan Mapbox/Google Maps). |
| **Database & Auth** | Supabase (PostgreSQL + Auth) | Latest | PostgreSQL dengan Row Level Security, Google OAuth instan, dan Logical Replication. |
| **Komunikasi Realtime** | Supabase Realtime | Latest | CDC bawaan dari PostgreSQL tanpa perlu mengelola server Socket.io mandiri. |
| **Validasi Skema** | Zod | v3+ | Validasi tipe runtime untuk JSON feed BMKG dan request form simulasi. |
| **Deployment / Hosting**| Vercel + Supabase Cloud | Managed | CI/CD otomatis dari GitHub, latensi edge global, SSL gratis. |

---

## 2. Analisis & Evaluasi Komponen

### A. Frontend & Backend: Next.js App Router (Fullstack Monorepo) vs Express/FastAPI Terpisah
- **Pilihan**: Next.js App Router.
- **Alternatif yang Dipertimbangkan**:
  1. *React Vite (Frontend) + Express.js (Backend terpisah)*: Membutuhkan 2 repositori atau konfigurasi proxy CORS terpisah, 2 proses hosting berbeda.
  2. *React Vite + Python FastAPI*: Sangat baik untuk parsing data, namun menambah kompleksitas deployment dan autentikasi multi-server dalam batas 13 jam.
- **Kelebihan**: Satu codebase (*monorepo*), zero CORS issue untuk internal API, satu klik deploy ke Vercel.
- **Keterbatasan**: Tidak cocok untuk koneksi WebSocket *long-lived* yang di-host sendiri di serverless; diselesaikan secara elegan dengan mendelegasikan WebSocket ke Supabase Realtime.

### B. Database & Realtime: Supabase PostgreSQL vs Custom WebSocket (Socket.io)
- **Pilihan**: Supabase (PostgreSQL + Realtime).
- **Alternatif yang Dipertimbangkan**: Server Node.js mandiri dengan Socket.io + MongoDB.
- **Alasan Pemilihan**:
  - Mengelola server Socket.io sendiri rentan terputus saat auto-restart dan membutuhkan server berbayar (seperti Railway/DigitalOcean) dengan load-balancer sticky session.
  - Supabase Realtime mendengarkan perubahan langsung pada PostgreSQL WAL (*Write-Ahead Log*). Saat backend memasukkan record baru, Supabase otomatis menyiarkannya ke browser tanpa sebaris kode server WebSocket pun yang perlu dirawat.
- **Dampak Kecepatan**: Menghemat 3–4 jam waktu setup infrastruktur realtime.

### C. Visualisasi Spasial: Leaflet + OpenStreetMap vs Mapbox GL JS / Google Maps
- **Pilihan**: Leaflet + OpenStreetMap.
- **Alternatif yang Dipertimbangkan**: Mapbox GL JS, Google Maps Platform.
- **Alasan Pemilihan**:
  - Mapbox dan Google Maps memerlukan kartu kredit, pendaftaran token berbayar, dan memiliki kuota ketat yang berisiko terblokir saat demo jika token salah konfigurasi.
  - Leaflet dan tile OpenStreetMap 100% gratis, open-source, ringan, dan memiliki ekosistem plugin yang matang untuk visualisasi radius lingkaran dan custom marker berdenyut (*pulsing marker*).

### D. Autentikasi: Supabase Auth (Google OAuth) vs NextAuth.js (Auth.js)
- **Pilihan**: Supabase Auth bawaan.
- **Alasan Pemilihan**:
  - Langsung terhubung dengan sistem Row Level Security (RLS) PostgreSQL.
  - Sesi pengguna otomatis disinkronkan ke client dan server context tanpa perlu konfigurasi adapter database tambahan.
