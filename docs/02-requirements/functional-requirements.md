# Kebutuhan Fungsional (Functional Requirements)

Dokumen ini mendefinisikan spesifikasi fungsional fitur secara mendetail dengan identitas unik (**FR-ID**), alur utama, skenario gagal, kriteria penerimaan, dan prioritas.

---

## Modul 1: Pengambilan & Penyimpanan Data BMKG (Data Ingestion)

### FR-01: Sinkronisasi Terjadwal Data BMKG (Automated Sync)
- **Deskripsi**: Sistem backend melakukan polling otomatis ke 3 feed JSON BMKG setiap 60 detik.
- **Tujuan**: Menjaga data kejadian gempa di basis data selalu selaras dengan rilisan resmi BMKG tanpa intervensi manual.
- **Aktor**: Sistem Backend (Supabase Cron / Next.js Internal Worker).
- **Prekondisi**: Server memiliki akses internet menuju domain `data.bmkg.go.id`.
- **Main Flow**:
  1. Cron memicu endpoint backend `/api/cron/sync-bmkg` secara berkala (interval 60s).
  2. Backend mengirim HTTP GET ke endpoint `autogempa.json`, `gempaterkini.json`, dan `gempadirasakan.json` dengan header `User-Agent: BMKG-Realtime-Monitor/1.0`.
  3. Backend memvalidasi schema payload JSON yang diterima.
  4. Backend memetakan field ke entitas internal `earthquake_events`.
  5. Backend menghitung hash unik (`event_hash`).
  6. Backend melakukan operasi `upsert` ke database dengan kriteria `event_hash`.
  7. Jika terdeteksi record baru pada `autogempa.json`, sistem menandai flag `is_new_alert = true` dan memicu broadcast event realtime.
  8. Sistem mencatat timestamp sinkronisasi berhasil ke `system_logs`.
- **Alternative Flow**:
  - Jika data yang ditarik sama persis dengan yang ada di database, sistem memperbarui timestamp *last_checked* tanpa memicu notifikasi peringatan gempa baru.
- **Error Scenarios**:
  - HTTP 403 / 500 / Network Timeout dari BMKG: Backend mencatat error ke `system_logs` dengan status `FAILED_FETCH`, mengaktifkan flag `data_is_stale = true` jika kegagalan berturut-turut melebihi 3 menit.
- **Expected Result**: Database selalu memiliki daftar 15+ data gempa terkini dan gempa terbaru.
- **Priority**: **P0 (Must-Have)**.

---

### FR-02: Pencegahan Duplikasi Data (Deduplication & Idempotency)
- **Deskripsi**: Sistem harus mampu membedakan apakah suatu kejadian gempa merupakan kejadian baru atau pembaruan (*update parameter*) tanpa menghasilkan record duplikat.
- **Tujuan**: Mencegah spam notifikasi dan menjaga integritas data statistik seismik.
- **Aktor**: Parser Backend.
- **Prekondisi**: Data JSON berhasil di-fetch dari BMKG.
- **Main Flow**:
  1. Parser mengambil field `DateTime` (ISO UTC) dan `Coordinates` (`lat,lng`).
  2. Menghasilkan SHA-256 hash atau string deterministik: `bmkg_{DateTime}_{Coordinates}`.
  3. Menggunakan `event_hash` sebagai kolom `UNIQUE` pada tabel PostgreSQL.
  4. Menyimpan data menggunakan query `ON CONFLICT (event_hash) DO UPDATE ...` bila ada pembaruan wilayah/dirasakan, atau `DO NOTHING` bila identik.
- **Priority**: **P0 (Must-Have)**.

---

## Modul 2: Dashboard Publik & Peta Gempa (Public Dashboard & Mapping)

### FR-03: Tampilan Gempa Terkini (Latest Earthquake Hero Banner)
- **Deskripsi**: Menampilkan kartu sorotan utama gempa bumi terakhir dengan magnitudo terbesar atau teranyar.
- **Aktor**: Pengguna Publik / Anonim.
- **Main Flow**:
  1. Pengguna membuka halaman beranda `/`.
  2. Sistem menampilkan magnitudo, kedalaman, waktu relatif (misal: "12 menit lalu"), wilayah episenter, status potensi tsunami, dan status guncangan dirasakan (skala MMI).
  3. Jika tersedia Shakemap, sistem menampilkan thumbnail gambar resmi BMKG dengan opsi klik untuk memperbesar (*lightbox*).
  4. Menampilkan label jelas: **"Sumber Resmi: BMKG"**.
- **Priority**: **P0 (Must-Have)**.

---

### FR-04: Peta Spasial Episentrum Gempa (Interactive Leaflet Map)
- **Deskripsi**: Menampilkan visualisasi peta Indonesia dengan pin titik gempa bumi.
- **Aktor**: Pengguna Publik.
- **Main Flow**:
  1. Peta memuat *basemap* OpenStreetMap.
  2. Titik gempa terbaru ditandai dengan pin beranimasi (*pulsing marker*) berwarna merah (jika $M \ge 5.0$) atau oranye/kuning ($M < 5.0$).
  3. Titik-titik gempa riwayat (15 gempa terakhir) ditandai dengan pin sekunder.
  4. Pengguna dapat mengklik pin untuk membuka popup ringkasan: Magnitudo, Kedalaman, Tanggal, Jam WIB, dan Wilayah.
- **Alternative Flow**:
  - Pengguna menggunakan tombol "Pusatkan ke Gempa Terkini" untuk memindahkan fokus peta secara otomatis ke episentrum terbaru.
- **Priority**: **P0 (Must-Have)**.

---

### FR-05: Indikator Kesegaran Data (Data Freshness & Health Indicator)
- **Deskripsi**: Menampilkan waktu sinkronisasi terakhir dan status kesehatan koneksi ke BMKG.
- **Main Flow**:
  1. Di bagian header/footer dashboard, sistem menampilkan badge:
     - 🟢 **Live - Terhubung ke BMKG** (Pembaruan < 2 menit lalu).
     - 🟡 **Data Menunggu Sinkronisasi** (Pembaruan 2 - 5 menit lalu).
     - 🔴 **Koneksi BMKG Terganggu** (Pembaruan > 5 menit lalu).
- **Priority**: **P0 (Must-Have)**.

---

## Modul 3: Peringatan & Notifikasi (Alerts & Audio System)

### FR-06: Distribusi Pembaruan Realtime Tanpa Refresh
- **Deskripsi**: Dashboard menerima sinyal kejadian gempa baru melalui koneksi WebSocket.
- **Main Flow**:
  1. Klien browser berlangganan kanal Supabase Realtime `earthquake_events`.
  2. Saat backend menyisipkan row baru, event `INSERT` diterima oleh klien dalam < 1 detik.
  3. Kartu gempa terkini diperbarui secara otomatis.
  4. Titik koordinat baru di peta langsung ditambahkan dengan animasi denyut (*pulse*).
- **Priority**: **P0 (Must-Have)**.

---

### FR-07: Sirine Peringatan Suara (Sound Alert)
- **Deskripsi**: Sistem membunyikan audio peringatan saat terdeteksi gempa baru atau saat pengujian simulasi.
- **Aktor**: Pengguna Publik & Administrator.
- **Prekondisi**: Pengguna telah mengklik toggle "Aktifkan Suara" pada antarmuka (mematuhi *browser autoplay policy*).
- **Main Flow**:
  1. Pengguna mengaktifkan tombol switch suara di bilah navigasi atas.
  2. Browser menginisialisasi `AudioContext` atau memutar *chime* hening konfirmasi aktif.
  3. Ketika event gempa baru tiba:
     - Jika $M \ge 5.0$: Sistem membunyikan nada peringatan darurat berulang (high-priority tone).
     - Jika $M < 5.0$: Sistem membunyikan nada info notifikasi lembut (info chime).
  4. Pengguna dapat menekan tombol "Hentikan Suara" (Mute Alert) kapan saja.
- **Priority**: **P0 (Must-Have)**.

---

### FR-08: Web Notification API (Browser Notification)
- **Deskripsi**: Menampilkan notifikasi desktop/ponsel bawaan browser saat tab aplikasi sedang di latar belakang.
- **Aktor**: Pengguna yang memberikan izin `Notification.requestPermission()`.
- **Main Flow**:
  1. Pengguna menekan tombol "Aktifkan Notifikasi Browser".
  2. Browser menampilkan dialog izin (*permission prompt*).
  3. Bila disetujui, setiap gempa baru akan memicu `new Notification("Peringatan Gempa BMKG", { body: "M 5.3 - 10 km Barat Daya Tomohon", icon: "/icon.png" })`.
- **Priority**: **P1 (Should-Have)**.

---

## Modul 4: Autentikasi & Hak Akses (Auth & RBAC)

### FR-09: Login Google OAuth
- **Deskripsi**: Pengguna dapat masuk ke akun menggunakan Google Login melalui Supabase Auth.
- **Aktor**: Semua Pengguna.
- **Main Flow**:
  1. Pengguna menekan tombol "Login dengan Google".
  2. Dialihkan ke Google OAuth consent screen.
  3. Setelah sukses, Supabase membuat record di `profiles`.
  4. Pengguna kembali ke aplikasi dengan sesi aktif.
- **Priority**: **P0 (Must-Have)**.

---

### FR-10: Verifikasi Hak Akses Administrator Berbasis Server
- **Deskripsi**: Melindungi rute administratif dan aksi simulasi agar hanya dapat diakses oleh email tertentu.
- **Aktor**: Administrator terdaftar pada *allowlist*.
- **Main Flow**:
  1. Pengguna login dengan Google.
  2. Middleware/Server Handler memeriksa apakah email pengguna terdaftar di environment variable `ADMIN_ALLOWLIST_EMAILS` atau tabel `profiles.role = 'admin'`.
  3. Jika ya, menu "Admin Panel" & `/admin/simulation` dapat diakses.
  4. Jika tidak, redirect ke `/` dengan pesan error "Akses Terbatas: Bukan Administrator".
- **Priority**: **P0 (Must-Have)**.

---

## Modul 5: Lingkungan Simulasi Terisolasi (Simulation Mode)

### FR-11: Pembuatan & Eksekusi Skenario Simulasi
- **Deskripsi**: Halaman khusus admin untuk menginjeksi kejadian gempa rekaan untuk pengujian dan demonstrasi hackathon.
- **Aktor**: Administrator.
- **Prekondisi**: Pengguna telah terautentikasi sebagai Administrator.
- **Main Flow**:
  1. Admin membuka halaman `/admin/simulation`.
  2. Admin mengisi form skenario:
     - Magnitudo (misal: 6.8).
     - Kedalaman (misal: 10 km).
     - Lokasi / Wilayah (misal: "Selatan Jawa Barat").
     - Koordinat Latitude & Longitude (bisa klik di mini-map).
     - Potensi Tsunami (Ya / Tidak).
  3. Admin menekan tombol "Jalankan Simulasi".
  4. Backend memvalidasi hak admin dan menyisipkan data ke tabel `simulation_events`.
  5. Sistem menyiarkan event WebSocket bertipe `SIMULATION_TRIGGERED`.
  6. Pada dashboard yang sedang aktif, banner merah menyala muncul dengan label mencolok: **"⚠️ PERINGATAN SIMULASI (BUKAN KEJADIAN NYATA)"**.
  7. Audio alert berbunyi (jika diaktifkan).
  8. Peta memusatkan koordinat simulasi.
- **Priority**: **P0 (Must-Have)**.

---

### FR-12: Penghentian & Pembersihan Simulasi
- **Deskripsi**: Admin dapat menghentikan skenario simulasi aktif dan mengembalikan dashboard ke data BMKG resmi.
- **Aktor**: Administrator.
- **Main Flow**:
  1. Admin menekan tombol "Reset / Hentikan Simulasi".
  2. Backend mengirim sinyal `SIMULATION_STOPPED`.
  3. Dashboard menghapus banner simulasi dan kembali menampilkan rekaman `earthquake_events` resmi BMKG.
- **Priority**: **P0 (Must-Have)**.
