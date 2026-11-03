# Spesifikasi Halaman & Komponen (Page Specifications)

Dokumen ini menjelaskan struktur visual, hierarki informasi, komponen penyusun, interaksi pengguna, dan penanganan kondisi error/stale pada setiap halaman.

---

## 1. Halaman Beranda (`/`) - Public Monitoring Dashboard

### A. Tujuan Halaman
Menjadi pusat komando pemantauan aktivitas seismik Indonesia bagi masyarakat luas secara realtime, informatif, dan tanpa delay.

### B. Komponen Utama
1. **Header & Navigation Bar**:
   - Logo "BMKG Monitor".
   - Indikator Kesegaran Data: Badge berwarna hijau/kuning/merah dengan teks waktu sinkronisasi terakhir.
   - Tombol Toggle Audio: `[ 🔊 Suara: Aktif ]` / `[ 🔇 Suara: Mati ]`.
   - Tombol Notifikasi Browser: `[ 🔔 Aktifkan Notifikasi ]`.
   - Tombol Login / Avatar Profil Pengguna.
   - Tombol "Admin Panel" (Hanya muncul jika login sebagai admin di allowlist).

2. **Banner Peringatan Darurat (Alert Banner)**:
   - Tersembunyi pada kondisi normal.
   - Muncul otomatis di puncak halaman saat gempa baru $M \ge 5.0$ terdeteksi atau saat simulasi aktif.
   - Jika simulasi aktif: Berwarna merah tua menyala dengan teks mencolok **"⚠️ MODE SIMULASI AKTIF (BUKAN DATA ASLI BMKG)"**.

3. **Hero Card: Gempa Bumi Terkini**:
   - Teks Magnitudo berukuran besar (misal: **M 5.3**), dengan kode warna dinamis:
     - Hijau / Kuning: $M < 5.0$.
     - Oranye: $5.0 \le M < 6.5$.
     - Merah: $M \ge 6.5$.
   - Info Waktu: Jam dalam WIB dan waktu relatif (misal: "8 menit yang lalu").
   - Wilayah episenter (contoh: *"1 km Barat Daya TOMOHON-SULUT"*).
   - Kedalaman (contoh: *"148 km"*).
   - Status Tsunami (contoh: *"Tidak berpotensi tsunami"* atau *"BERPOTENSI TSUNAMI"*).
   - Wilayah Dirasakan (contoh: *"II - III Ternate, II Minahasa"*).
   - Thumbnail Shakemap resmi BMKG dengan tombol preview modal perbesar.
   - Tombol Bagikan Cepat (*Copy Link*, *Share to WhatsApp*).

4. **Peta Spasial Indonesia (Earthquake Map)**:
   - Menampilkan wilayah Indonesia dengan koordinat tengah `[-2.5, 118.0]` zoom `5`.
   - Marker denyut beranimasi (*pulsing marker*) pada episentrum gempa terkini.
   - Marker sekunder berwarna oranye/biru untuk 15 gempa terkini lainnya.
   - Popup interaktif saat marker diklik menampilkan ringkasan data kejadian.
   - Tombol kontrol: "Pusatkan ke Gempa Terkini", "Zoom In/Out".

5. **Daftar Riwayat Gempa (Earthquake Feeds Tab)**:
   - Tab 1: **Gempa M 5.0+ Terkini** (Daftar 15 gempa terbaru dari `gempaterkini.json`).
   - Tab 2: **Gempa Dirasakan Nyata** (Daftar gempa dengan skala MMI dari `gempadirasakan.json`).
   - Setiap item menampilkan baris interaktif: Badge Magnitudo, Waktu, Lokasi Wilayah, dan tombol panah untuk melihat detail.

---

## 2. Halaman Detail Kejadian (`/earthquake/[id]`)

### A. Tujuan Halaman
Memberikan informasi mendalam untuk satu kejadian gempa spesifik, berfungsi sebagai landing page saat pengguna membuka tautan dari media sosial/chat WhatsApp.

### B. Komponen Utama
- Kartu Ringkasan Seismik Lengkap.
- Peta mini fokus episentrum (zoom level 8–9).
- Tampilan gambar Shakemap MMI resolusi penuh dari server BMKG.
- Metadata OpenGraph dinamis (judul: *"Peringatan Gempa M [X] di [Wilayah] - Sumber: BMKG"*).
- Tombol navigasi kembali ke Dashboard Utama.

---

## 3. Halaman Konsol Simulasi Admin (`/admin/simulation`)

### A. Tujuan Halaman
Memberikan kontrol penuh kepada administrator/juri untuk menguji sistem peringatan dan demonstrasi hackathon tanpa merusak data asli.

### B. Komponen Utama
1. **Formulir Skenario Gempa**:
   - Field Nama Skenario (Default: *"Simulasi Gempa Megathrust"*).
   - Slider / Input Angka Magnitudo ($1.0 - 9.0$).
   - Input Kedalaman dalam km ($1 - 700$).
   - Input Wilayah Teks (contoh: *"Selatan Jawa Barat"*).
   - Pemilih Koordinat Peta: Admin dapat mengklik sembarang titik di mini-map untuk mengisi input Latitude dan Longitude secara otomatis.
   - Radio Button Potensi Tsunami: `[ ] Tidak Berpotensi` / `[x] Berpotensi Tsunami`.
2. **Tombol Aksi**:
   - `[ Jalankan Simulasi ]` (Tombol merah besar dengan modal konfirmasi).
   - `[ Hentikan / Reset Simulasi ]` (Mengembalikan status sistem ke data BMKG resmi).
3. **Panel Telemetri Realtime**:
   - Menampilkan daftar tab/klien browser yang sedang terhubung ke Supabase Realtime.
   - Log waktu siaran event simulasi.
