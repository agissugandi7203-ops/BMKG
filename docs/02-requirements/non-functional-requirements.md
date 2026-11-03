# Kebutuhan Non-Fungsional (Non-Functional Requirements)

Dokumen ini mendefinisikan standar mutu, performa, keandalan, dan keamanan sistem. Setiap metrik performa diberi label `Proposed Target` yang realistis untuk lingkungan hackathon dan produksi skala menengah.

---

## 1. Performa (Performance)

- **NFR-P1 (Kecepatan Muat Awal - First Contentful Paint)**:
  - *Proposed Target*: FCP $\le 1.8$ detik pada jaringan 4G standar.
  - *Mekanisme*: Server-side rendering (SSR) / Incremental Static Regeneration (ISR) di Next.js App Router untuk data gempa awal, lazy loading untuk library peta Leaflet (menghindari error SSR `window is not defined`).
- **NFR-P2 (Latensi Distribusi Realtime)**:
  - *Proposed Target*: $\le 800$ ms dari saat record tersimpan di Supabase hingga event diterima di browser klien aktif.
  - *Mekanisme*: Supabase Realtime via PostgreSQL WAL (*Write-Ahead Logging*) Change Data Capture.
- **NFR-P3 (Latensi API Backend)**:
  - *Proposed Target*: p95 response time $\le 250$ ms untuk endpoint pembacaan data gempa riwayat (`/api/earthquakes`).
  - *Mekanisme*: Database indexing pada kolom `date_time DESC` dan *stale-while-revalidate* cache.

---

## 2. Keamanan (Security)

- **NFR-S1 (Isolasi Kredensial Rahasia)**:
  - Variabel rahasia seperti `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ALLOWLIST_EMAILS`, dan OAuth client secrets hanya boleh dideklarasikan di environment backend (`process.env`), tidak pernah diprefiks dengan `NEXT_PUBLIC_`.
- **NFR-S2 (Row-Level Security - RLS)**:
  - Tabel `earthquake_events` memiliki izin:
    - `SELECT`: Terbuka untuk umum (`anon` & `authenticated`).
    - `INSERT / UPDATE / DELETE`: Ditolak untuk umum; hanya boleh dijalankan oleh `service_role` (backend worker).
  - Tabel `simulation_events`:
    - `SELECT`: Terbuka untuk umum agar dapat menampilkan demonstrasi simulasi.
    - `INSERT / UPDATE / DELETE`: Hanya diizinkan bagi pengguna dengan profil `role = 'admin'` atau `service_role`.
- **NFR-S3 (Proteksi Injeksi & Validasi Data)**:
  - Semua payload yang masuk dari BMKG atau form input simulasi wajib divalidasi menggunakan schema validator seperti **Zod**.

---

## 3. Keandalan & Ketersediaan (Reliability & Availability)

- **NFR-R1 (Graceful Degradation saat BMKG Offline)**:
  - Jika server BMKG mengalami *timeout* atau *HTTP 500/403*, aplikasi tidak boleh crash (*error boundary*).
  - Dashboard tetap menampilkan data terakhir yang berhasil disimpan di database disertai status peringatan 🔴 *"Sumber Data BMKG Mengalami Gangguan - Menampilkan Data Tersimpan"*.
- **NFR-R2 (Pencegahan Throttling / Rate-Limiting BMKG)**:
  - Polling ke BMKG dibatasi secara terpusat dengan interval minimum 60 detik. Klien web tidak pernah diizinkan melakukan polling mandiri ke domain `data.bmkg.go.id`.
- **NFR-R3 (Mekanisme Retry dengan Exponential Backoff)**:
  - Jika request ke BMKG gagal, backend melakukan retry maksimal 2 kali dengan interval 3 detik sebelum mencatat status gagal ke `system_logs`.

---

## 4. Aksesibilitas & Kompatibilitas Browser (Accessibility & Compatibility)

- **NFR-A1 (Kepatuhan Autoplay Policy)**:
  - Audio alarm tidak boleh diputar otomatis sebelum pengguna secara eksplisit mengaktifkannya via tombol UI.
- **NFR-A2 (Responsif Lintas Perangkat)**:
  - Antarmuka harus proporsional dan berfungsi lancar pada resolusi layar ponsel (360px+), tablet (768px+), dan desktop (1280px+).
- **NFR-A3 (Dukungan Browser Modern)**:
  - Kompatibel dengan Chromium (Chrome, Edge, Brave), Safari (macOS & iOS 15+), dan Firefox.

---

## 5. Keteramatan & Logging (Observability)

- **NFR-O1 (Pencatatan Riwayat Sinkronisasi)**:
  - Setiap siklus pengambilan data BMKG dicatat dalam tabel `system_logs` (waktu eksekusi, status HTTP, durasi eksekusi, jumlah record baru).
- **NFR-O2 (Structured Error Logging)**:
  - Error parsing payload BMKG dicatat beserta raw response snippet untuk memudahkan investigasi saat skema BMKG berubah.
