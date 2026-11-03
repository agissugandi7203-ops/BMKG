# Tujuan Produk (Product Objectives)

## 1. Tujuan Utama (Core Objectives)

Sistem dirancang untuk mencapai sasaran objektif terukur dalam jangka waktu implementasi hackathon (13 jam) dan operasional jangka panjang:

1. **Pengambilan & Normalisasi Data Otomatis**:
   - Mengambil data berkala dari 3 endpoint resmi BMKG (`autogempa.json`, `gempaterkini.json`, `gempadirasakan.json`).
   - Melakukan parsing aman, penanganan format waktu (WIB/UTC), konversi koordinat (`lat,lng`), serta pemetaan skala intensitas MMI.
2. **Pendeteksian Kejadian Baru & Idempotensi (Deduplication)**:
   - Menghasilkan identitas unik deterministik (*composite key / hash*) dari setiap kejadian gempa.
   - Menolak duplikasi data di level basis data (*database constraints*) agar tidak memicu notifikasi berulang.
3. **Penyebaran Peringatan Realtime Sub-Detik**:
   - Meneruskan data gempa baru dari database ke seluruh klien yang sedang aktif membuka aplikasi tanpa *page reload*, memanfaatkan WebSocket melalui Supabase Realtime CDC (*Change Data Capture*).
4. **Visualisasi Spasial Interaktif**:
   - Memetakan episentrum gempa terbaru dan riwayat gempa di atas peta Indonesia menggunakan OpenStreetMap & Leaflet.
   - Menampilkan *depth color indicator*, radius potensi guncangan, dan tautan langsung ke Shakemap resmi BMKG.
5. **Sistem Notifikasi Multikanal (In-App, Browser, Audio Alert)**:
   - Menyediakan peringatan banner/modal in-app.
   - Memfasilitasi sirine suara gempa (*Audio Alert*) dengan kepatuhan terhadap kebijakan *browser autoplay policy*.
   - Menyediakan Web Notification API di desktop/mobile browser yang didukung.
6. **Lingkungan Simulasi Terisolasi untuk Demonstrasi**:
   - Memungkinkan administrator menginjeksi kejadian gempa tiruan secara aman untuk menunjukkan respons sistem secara langsung saat presentasi.
   - Memastikan isolasi ketat: data simulasi tidak pernah mencemari data historis atau statistik BMKG asli.
7. **Autentikasi Aman & Otorisasi Berbasis Peran**:
   - Memungkinkan autentikasi satu klik via Google OAuth (Supabase Auth).
   - Membatasi akses menu admin secara ketat di sisi server (*Server-Side Authorization & Allowlist*).

---

## 2. Non-Goals (Batasan yang Sengaja Dikecualikan)

Untuk menjaga integritas ilmiah dan fokus produk:
- **TIDAK Melakukan Prediksi Gempa Bumi**: Sistem tidak menggunakan model ML/AI untuk memprediksi kapan gempa akan terjadi di masa depan (hal ini secara ilmiah mustahil dan ilegal untuk dipublikasikan sebagai peringatan resmi).
- **TIDAK Menggantikan Kanal Peringatan Dini Nasional**: Sistem adalah instrumen sekunder untuk edukasi dan kemudahan akses masyarakat, bukan pengganti sirene BMKG atau sirine tsunami resmi pemerintah daerah.
- **TIDAK Melakukan Polling Mandiri dari Browser Klien**: Klien browser dilarang keras menembak langsung server BMKG secara massal (menghindari beban server BMKG dan risiko pemblokiran IP klien). Seluruh konsumsi data BMKG terpusat di backend.
- **TIDAK Menyediakan Notifikasi SMS Berbayar / Integrasi TV Broadcast pada MVP**: Fokus MVP adalah browser web, WebSocket, dan web notification.

---

## 3. Definisi Keberhasilan MVP (Definition of Done)

Produk dinyatakan memenuhi kriteria sukses hackathon jika:
- [x] Website beroperasi secara publik melalui Vercel / URL domain aktif.
- [x] Data gempa terkini BMKG ter-update otomatis di database dan tampil di dashboard.
- [x] Detektor gempa baru berhasil mendeteksi rekaman anyar dan memicu pembaruan UI secara realtime tanpa refresh manual.
- [x] Fitur sirine audio bersuara saat tombol trigger simulasi atau data baru diterima (setelah izin audio diaktifkan).
- [x] Peta memetakan koordinat secara akurat dengan pin informatif.
- [x] Login Google berfungsi, dan hanya email yang masuk daftar *allowlist* yang dapat membuka `/admin/simulation`.
- [x] Data simulasi berlabel **"SIMULASI"** merah mencolok dan tidak masuk ke tabel `earthquake_events` BMKG.
