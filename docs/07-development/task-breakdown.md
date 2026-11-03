# Rincian Tugas Pengembangan (Task Breakdown)

Daftar tiket tugas teknis terperinci untuk tim developer, lengkap dengan perkiraan durasi, prasyarat ketergantungan, potensi penghambat (*blocker*), dan kriteria selesai (*completion criteria*).

---

## Modul A: Fondasi, Database & Autentikasi (Fase 0 & 1)

### TASK-01: Inisialisasi Project Next.js & UI Scaffolding
- **Estimasi**: 45 menit
- **Dependencies**: Tidak ada
- **Action**: Inisialisasi Next.js 14/15 dengan TypeScript, Tailwind CSS, shadcn/ui (`button`, `badge`, `card`, `dialog`, `tabs`, `slider`, `switch`, `toast`), dan Lucide Icons.
- **Criteria**: Project dapat di-build dengan `npm run build` tanpa error TypeScript.

### TASK-02: Konfigurasi Database Supabase & DDL
- **Estimasi**: 45 menit
- **Dependencies**: TASK-01
- **Action**: Jalankan script SQL DDL untuk tabel `profiles`, `earthquake_events`, `simulation_events`, `system_logs`, dan `user_notification_preferences`. Pasang RLS dan aktifkan Realtime Publication.
- **Criteria**: Tabel terbentuk di Supabase Console dengan indexing dan policy aktif.

### TASK-03: Integrasi Google OAuth & Admin Role Guard
- **Estimasi**: 45 menit
- **Dependencies**: TASK-02
- **Action**: Setup Supabase Auth helper untuk SSR, konfigurasi Google Client ID, buat middleware proteksi `/admin` berbasis `ADMIN_ALLOWLIST_EMAILS`.
- **Criteria**: Pengguna bisa login via Google. Pengguna biasa ditolak masuk `/admin`, sedangkan email admin diizinkan.

---

## Modul B: Engine Ingestion Data BMKG (Fase 2)

### TASK-04: Implementasi Client Fetcher & Normalizer BMKG
- **Estimasi**: 60 menit
- **Dependencies**: TASK-02
- **Action**: Buat modul `lib/bmkg/fetcher.ts` dengan header browser wajib, parser normalisasi `lib/bmkg/normalizer.ts`, dan hashing deterministik `event_hash`.
- **Criteria**: Script berhasil mengambil 3 feed BMKG dan mencetak data JSON terstruktur yang valid.

### TASK-05: Route Handler Ingestion `/api/cron/sync-bmkg`
- **Estimasi**: 60 menit
- **Dependencies**: TASK-04
- **Action**: Buat endpoint POST/GET yang dilindungi token `CRON_SECRET`. Lakukan upsert idempotent ke PostgreSQL dan catat log sinkronisasi ke `system_logs`.
- **Criteria**: Pemanggilan endpoint menghasilkan HTTP 200 dan baris data masuk ke tabel `earthquake_events` tanpa duplikasi.

---

## Modul C: Antarmuka Publik & Peta Seismik (Fase 3 & 4)

### TASK-06: Hero Component Gempa Terkini
- **Estimasi**: 60 menit
- **Dependencies**: TASK-05
- **Action**: Buat komponen kartu gempa terbaru dengan magnitudo kontras, waktu relatif, status tsunami, MMI, dan thumbnail Shakemap BMKG.
- **Criteria**: Data gempa terbaru tampil responsif di desktop dan mobile.

### TASK-07: Integrasi Komponen Peta Leaflet (GIS)
- **Estimasi**: 90 menit
- **Dependencies**: TASK-01
- **Action**: Buat wrapper `dynamic import` untuk Leaflet (hindari error SSR). Render peta Indonesia, marker episentrum berdenyut untuk gempa terkini, dan marker sekunder riwayat gempa.
- **Criteria**: Peta muncul tanpa error `window is not defined`, marker dapat diklik dan menampilkan popup data gempa.

### TASK-08: Supabase Realtime Listener & State Sync
- **Estimasi**: 45 menit
- **Dependencies**: TASK-05, TASK-06, TASK-07
- **Action**: Buat custom hook `useRealtimeEarthquakes` yang mendengarkan event `INSERT` di tabel `earthquake_events`. Perbarui state React secara instan.
- **Criteria**: Saat ada baris baru masuk ke database, UI peta dan Hero Card ter-update dalam < 1 detik tanpa refresh halaman.

### TASK-09: Web Audio Alert Siren Engine
- **Estimasi**: 45 menit
- **Dependencies**: TASK-08
- **Action**: Buat kelas sintesis audio `AudioContext` untuk nada sirine darurat. Sediakan tombol toggle unlock autoplay di navigasi atas.
- **Criteria**: Suara sirine berbunyi saat data baru diterima jika toggle aktif, dan dapat dimatikan via tombol mute.

---

## Modul D: Konsol Kontrol Simulasi Administrator (Fase 5)

### TASK-10: Form Kontrol Skenario Simulasi (`/admin/simulation`)
- **Estimasi**: 60 menit
- **Dependencies**: TASK-03
- **Action**: Buat form input parameter gempa (magnitudo, kedalaman, koordinat titik klik peta, potensi tsunami) dan tombol eksekusi simulasi.
- **Criteria**: Form divalidasi dengan Zod dan hanya dapat dikirim oleh admin yang sah.

### TASK-11: Mekanisme Broadcast Simulasi & Isolasi UI
- **Estimasi**: 60 menit
- **Dependencies**: TASK-10, TASK-08
- **Action**: Simpan simulasi ke tabel `simulation_events`. Siarkan event ke klien publik. Dashboard publik menampilkan banner merah menyala **"SIMULASI"** dan membunyikan alarm demo. Sediakan tombol reset simulasi.
- **Criteria**: Simulasi berhasil didemonstrasikan di hadapan penonton/juri tanpa mencampuri tabel data asli BMKG.

---

## Modul E: Polishing, Deployment & Demo Rehearsal (Fase 6, 7 & 8)

### TASK-12: Web Notification API & Tombol Share
- **Estimasi**: 45 menit
- **Dependencies**: TASK-08
- **Action**: Integrasikan Web Notification API untuk notifikasi desktop, dan tombol copy link kejadian gempa spesifik.
- **Criteria**: Notifikasi browser muncul saat tab aplikasi berada di latar belakang.

### TASK-13: Deployment Vercel & Production Health Check
- **Estimasi**: 45 menit
- **Dependencies**: Semua task sebelumnya
- **Action**: Konfigurasi environment variables di dashboard Vercel, trigger deployment production, periksa status koneksi publik.
- **Criteria**: Aplikasi aktif dan dapat diakses publik dengan SSL (HTTPS) valid.
