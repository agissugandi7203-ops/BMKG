# Manajemen Risiko, Keterbatasan & Pertanyaan Terbuka (Risks & Limitations)

Dokumen ini memetakan analisis risiko teknis, strategi mitigasi terencana, serta daftar pertanyaan terbuka (*open questions*) yang perlu diputuskan sebelum fase pengkodean dimulai.

---

## 1. Matriks Risiko Teknis & Rencana Mitigasi

| ID Risiko | Deskripsi Risiko | Dampak | Probabilitas | Rencana Mitigasi (Mitigation Plan) |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | **Pemblokiran Cloudflare BMKG (HTTP 403)**<br/>Request cron backend dianggap bot/scraper oleh WAF BMKG. | Tinggi | Sedang | Selalu sertakan header `User-Agent` browser standar desktop dalam fetcher backend. Jika IP Vercel terblokir, fallback sementara ke proxy router atau mock seed data untuk demo. |
| **RSK-02** | **Browser Memblokir Suara Sirine (Autoplay Policy)**<br/>Sirine darurat gagal bersuara saat gempa terdeteksi. | Sedang | Tinggi | Sediakan switch UI eksplisit "Aktifkan Sirine" yang melakukan `audioCtx.resume()` pada saat klik pertama. Tampilkan modal peringatan jika suara belum diaktifkan. |
| **RSK-03** | **Leaflet Error SSR di Next.js**<br/>`window is not defined` saat Next.js melakukan compile/prerender. | Tinggi | Sedang | Wajib menggunakan `next/dynamic` dengan opsi `{ ssr: false }` untuk semua komponen yang mengimpor library Leaflet atau CSS Leaflet. |
| **RSK-04** | **Keterlambatan Penyiapan Google OAuth**<br/>Google Cloud Console membutuhkan waktu verifikasi atau OAuth consent error. | Sedang | Rendah | Siapkan variabel lingkungan `ENABLE_DEV_ADMIN_BYPASS=true` khusus di localhost untuk menguji panel admin secara instan tanpa login Google jika OAuth terkendala. |
| **RSK-05** | **Latensi WebSocket Supabase Drop**<br/>Koneksi realtime WebSocket terputus saat demo akibat jaringan Wi-Fi venue hackathon tidak stabil. | Sedang | Rendah | Buat interval fallback polling ringan di sisi klien (setiap 30-45 detik) yang memicu refetch REST jika status channel Supabase disconnected. |

---

## 2. Keterbatasan Sistem (System Limitations)

1. **Bukan Pengganti Sirine Fisik BMKG**:
   Aplikasi ini adalah kanal informasi sekunder. Kinerja pengiriman peringatan bergantung pada koneksi internet pengguna dan status aplikasi yang sedang terbuka di browser.
2. **Ketergantungan pada Waktu Publikasi BMKG**:
   Aplikasi tidak dapat menampilkan gempa lebih cepat daripada waktu yang dibutuhkan sensor BMKG untuk memproses sinyal seismik dan mengunggah file JSON ke server TEWS.
3. **Data Simulasi Khusus untuk Demonstrasi**:
   Sistem simulasi tidak merefleksikan model perambatan gelombang gempa (*P-wave / S-wave*) secara geofisika akurat, melainkan simulasi respon penerimaan peringatan pada layer aplikasi.

---

## 3. Pertanyaan Terbuka & Rekomendasi Keputusan (Open Questions)

### Pertanyaan 1: Mekanisme Trigger Polling Cron di Vercel vs Supabase
- **Konteks**: Vercel Cron pada paket *Hobby (Gratis)* dibatasi maksimal 1 kali per hari atau per jam. Supabase memiliki ekstensi `pg_cron` dan `pg_net` yang dapat memicu HTTP request setiap 1 menit.
- **Rekomendasi Keputusan**:
  Gunakan `pg_cron` di Supabase untuk menembak endpoint `/api/cron/sync-bmkg` setiap 1 menit:
  ```sql
  SELECT cron.schedule(
    'sync-bmkg-every-minute',
    '* * * * *',
    $$ SELECT net.http_get('https://your-domain.vercel.app/api/cron/sync-bmkg', headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb); $$
  );
  ```
  Sebagai alternatif lokal saat testing: Gunakan script background Node / loop script sederhana.

### Pertanyaan 2: Format Suara Alarm yang Diizinkan
- **Konteks**: Apakah menggunakan file audio `.mp3` rekaman BMKG atau sintesis suara osilator `Web Audio API`?
- **Rekomendasi Keputusan**:
  Gunakan sintesis Web Audio API (osilator frekuensi naik-turun dual-tone) sebagai instrumen utama karena tidak memerlukan loading asset file eksternal dan bebas hak cipta, dengan opsi memutar file audio kustom jika tersedia.
