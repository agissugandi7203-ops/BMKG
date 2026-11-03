# Batasan & Cakupan Proyek (Scope & Constraints)

## 1. Batasan Waktu & Sumber Daya (13-Hour Hackathon Constraint)
Pengembangan dilakukan dalam rentang waktu total **13 jam**. Oleh karena itu:
- Keputusan arsitektur harus memprioritaskan kesederhanaan, stabilitas komponen yang sudah teruji (*battle-tested*), dan kecepatan iterasi.
- Menggunakan arsitektur **Next.js Fullstack Monorepo** (App Router) yang terintegrasi dengan **Supabase BaaS** untuk mengeliminasi beban konfigurasi microservices, setup database server mandiri, atau manajemen server WebSocket kustom.

---

## 2. Cakupan Fitur Berdasarkan Prioritas (Feature Scope)

| Prioritas | Kategori | Fitur yang Dicakup | Alasan & Rasionalisasi |
| :--- | :--- | :--- | :--- |
| **P0** | **Must-Have (Wajib MVP)** | - Public Earthquake Dashboard<br/>- Integrasi 3 Endpoint BMKG (`autogempa`, `gempaterkini`, `gempadirasakan`)<br/>- Polling backend terpusat (interval 60 detik) & deduplikasi data<br/>- Supabase PostgreSQL + Realtime CDC updates<br/>- Visualisasi Peta Leaflet & OpenStreetMap<br/>- In-App Alert banner / popup<br/>- Sound Alert (Web Audio / HTML5 Audio) dengan tombol interaksi awal (*autoplay policy safe*)<br/>- Google Login via Supabase Auth<br/>- Role-based Admin via email allowlist<br/>- Mode Simulasi terisolasi (`simulation_events`) untuk demo juri<br/>- Indikator kesegaran data (*Data Freshness / Outage status*)<br/>- Deployment aktif di Vercel | Pondasi mutlak produk yang menjamin fungsionalitas riil, data asli, kesiapan demo interaktif, dan kelaikan presentasi. |
| **P1** | **Should-Have** | - Web Notification API (Browser push notification lokal)<br/>- Generate kartu gambar shareable gempa (OG Image / canvas template)<br/>- Shareable direct URL (`/earthquake/[id]`)<br/>- Filter gempa berdasarkan magnitudo minimum di peta/tabel<br/>- Riwayat notifikasi lokal (*Notification Center drawer*) | Menambah nilai lebih pengalaman pengguna jika sisa waktu pengerjaan P0 masih mencukupi. |
| **P2** | **Future (Pasca-Hackathon)** | - Auto-posting ke akun Twitter/X atau Telegram Bot BMKG community<br/>- Integrasi Webhook ke sistem penyiaran TV/Radio<br/>- Subskripsi filter gempa berbasis radius radius geolokasi pengguna (GPS)<br/>- Push Notification Service latar belakang (FCM / Web Push Service Worker offline) | Memerlukan kredensial API pihak ketiga, verifikasi bot berbayar, dan kompleksitas perizinan yang melebihi batas waktu 13 jam. |

---

## 3. Batasan Teknis & Lingkungan (Technical Constraints)

1. **Karakteristik API Publik BMKG**:
   - Endpoint BMKG berada di balik Cloudflare CDN dengan `Cache-Control: max-age=60`. Polling lebih cepat dari 60 detik tidak menghasilkan data baru dan hanya membuang bandwidth.
   - Endpoint BMKG terkadang menolak *User-Agent* yang tidak standar dengan kode `403 Forbidden`. Backend *fetcher* wajib menyertakan *header* `User-Agent` browser standar.
   - Tidak ada autentikasi atau rate limit berdokumen, namun lonjakan request dapat menyebabkan *Cloudflare rate limiting* atau blokir IP. Backend wajib menerapkan *backoff* dan *caching*.
2. **Kebijakan Browser Autoplay**:
   - Browser modern (Chrome, Safari, Edge, Firefox) secara ketat memblokir audio otomatis tanpa interaksi gestur pengguna (klik/tap) terlebih dahulu.
   - Solusi: UI harus menyediakan switch eksplisit "Aktifkan Sirine Gempa" yang saat diklik menginisialisasi `AudioContext` atau memutar nada konfirmasi hening (unlock audio).
3. **Isolasi Data Simulasi**:
   - Data simulasi TIDAK BOLEH disimpan di tabel `earthquake_events` resmi.
   - Data simulasi TIDAK BOLEH memicu notifikasi ke audiens umum jika sistem nantinya memiliki push subscriber massal.
   - Simulasi disimpan di tabel `simulation_events` dan disiarkan dengan kanal atau event payload yang memuat flag `is_simulation: true`.
4. **Keamanan Kredensial**:
   - Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) HANYA boleh diakses di backend/Route Handlers. Tidak boleh ada eksposur ke bundle browser klien.
