# Strategi Pengujian Sistem (Testing & QA Strategy)

Dokumen ini merumuskan protokol pengujian fungsionalitas, uji ketahanan jaringan (*network resilience*), penanganan *edge cases*, dan skenario gladi bersih (*demo rehearsal runbook*).

---

## 1. Matriks Kasus Uji Fungsional (Test Cases)

| ID Uji | Modul / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Ingestion BMKG Normal | Panggil `/api/cron/sync-bmkg` dengan token yang valid. | HTTP 200, 15+ data gempa terisi di database, log status `SUCCESS`. | Ready to Test |
| **TC-02** | Proteksi Cron Unauthorized | Panggil `/api/cron/sync-bmkg` tanpa header Authorization. | HTTP 401 Unauthorized, tidak ada pemanggilan keluar ke BMKG. | Ready to Test |
| **TC-03** | Pencegahan Duplikasi Data | Jalankan cron 3 kali berturut-turut dengan data BMKG yang tidak berubah. | Jumlah baris di `earthquake_events` tetap sama (idempotent), tidak ada error duplicate key. | Ready to Test |
| **TC-04** | Leaflet Map Rendering | Muat halaman beranda di Chrome, Safari, dan Edge. | Peta OpenStreetMap ter-render sempurna tanpa error `window is not defined`. | Ready to Test |
| **TC-05** | Browser Autoplay Handling | Buka web di tab baru tanpa interaksi, lalu picu audio. | Browser tidak melempar uncaught DOMException; audio hanya bersuara setelah pengguna klik "Aktifkan Suara". | Ready to Test |
| **TC-06** | Realtime Broadcast | Buka 2 jendela browser bersebelahan. Di jendela A, picu data baru/simulasi. | Jendela B memperbarui UI dalam waktu < 1 detik tanpa refresh manual. | Ready to Test |
| **TC-07** | Admin Allowlist Guard | Login dengan akun Google non-admin, lalu buka `/admin/simulation`. | Redirect ke `/` dengan pesan error akses ditolak (HTTP 403). | Ready to Test |
| **TC-08** | Isolasi Data Simulasi | Jalankan simulasi gempa M 7.8 dari halaman admin. | Tampil banner merah "PERINGATAN SIMULASI", record masuk ke `simulation_events`, tabel `earthquake_events` tetap utuh. | Ready to Test |
| **TC-09** | Pembersihan Simulasi | Klik tombol "Hentikan Simulasi" di panel admin. | Banner simulasi hilang seketika di semua browser terbuka, UI kembali ke data BMKG resmi. | Ready to Test |

---

## 2. Uji Ketahanan Jaringan (Fault-Tolerance & Edge Cases)

1. **Kasus Kegagalan Jaringan ke BMKG (BMKG Offline / Timeout)**:
   - *Simulasi*: Arahkan URL BMKG di environment ke domain invalid (misal: `https://invalid-bmkg-test.gov`).
   - *Verifikasi*: Aplikasi tidak crash; log mencatat status `FAILED`; dashboard menampilkan badge status 🔴 *"Koneksi BMKG Terganggu - Menampilkan Data Tersimpan"*.
2. **Kasus Respons BMKG Tidak Lengkap (Missing Shakemap / Felt MMI)**:
   - *Simulasi*: Berikan payload tanpa field `Shakemap` dan `Dirasakan`.
   - *Verifikasi*: Normalizer Zod mengisi nilai default `null`; Hero Card menyembunyikan thumbnail Shakemap secara elegan tanpa merusak tata letak komponen.

---

## 3. Skenario Gladi Bersih Presentasi Demo (2-Minute Demo Runbook)

Panduan langkah demi langkah saat melakukan demonstrasi di hadapan juri hackathon:

1. **Detik 00 - 30 (Pembukaan & Dashboard Publik)**:
   - Tunjukkan tampilan dashboard publik yang bersih, profesional, dan responsif.
   - Sorot badge kesegaran data dan teks atribusi resmi: *"Sumber Data: BMKG TEWS"*.
   - Klik tombol **"Aktifkan Sirine Gempa"** untuk membuka izin audio browser (*unlock audio*).
2. **Detik 30 - 60 (Interaksi Peta & Detail Riwayat)**:
   - Klik marker episentrum gempa terkini di peta Leaflet; tunjukkan popup koordinat, kedalaman, dan magnitudo.
   - Klik thumbnail gambar Shakemap resmi BMKG untuk memperbesar citra intensitas guncangan (MMI).
3. **Detik 60 - 90 (Autentikasi & Eksekusi Simulasi)**:
   - Buka jendela browser baru / incognito; lakukan login cepat via Google dengan akun admin.
   - Buka `/admin/simulation`. Klik salah satu titik di peta (misal: Selat Sunda), atur Magnitudo 7.2 dan potensi Tsunami.
   - Klik tombol **"Jalankan Simulasi"**.
4. **Detik 90 - 120 (Klimaks Demo Realtime & Peringatan)**:
   - Tunjukkan jendela dashboard publik: seketika banner merah **"⚠️ PERINGATAN SIMULASI"** muncul tanpa refresh, marker peta bergerak ke episentrum simulasi, dan **sirine suara berbunyi nyaring**.
   - Sorot ke juri bahwa data simulasi terisolasi dan tidak mencemari data resmi BMKG.
   - Klik tombol **"Hentikan Simulasi"** di admin; tunjukkan dashboard langsung kembali normal.
