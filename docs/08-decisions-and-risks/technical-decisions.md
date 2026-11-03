# Catatan Keputusan Teknis (Architecture Decision Records - ADR)

Dokumen ini mendokumentasikan keputusan arsitektur penting yang diambil selama fase perencanaan, konteks pertimbangan, serta konsekuensi teknisnya.

---

## ADR-01: Mengadopsi Next.js Fullstack Monorepo Alih-Alih Backend Terpisah
- **Status**: Diterima (Accepted).
- **Konteks**: Batas waktu hackathon adalah 13 jam. Memisahkan repositori backend (misal Express.js / FastAPI) dan frontend (React Vite) membutuhkan 2 setup project terpisah, 2 domain hosting, konfigurasi CORS, dan manajemen dependensi ganda.
- **Keputusan**: Menggunakan Next.js App Router (Fullstack Monorepo).
- **Konsekuensi**:
  - *Positif*: Satu codebase tunggal, tipe TypeScript dapat dibagikan antara API handler dan komponen UI (*end-to-end type safety*), satu klik deployment di Vercel, nol masalah CORS internal.
  - *Negatif*: Serverless function tidak mendukung persistent TCP connections untuk custom WebSocket server.
  - *Mitigasi*: Menyerahkan beban WebSocket ke Supabase Realtime CDC.

---

## ADR-02: Menggunakan Supabase Realtime CDC Alih-Alih Mengelola Socket.io Mandiri
- **Status**: Diterima (Accepted).
- **Konteks**: Sistem membutuhkan transmisi gempa baru ke klien browser secara sub-detik tanpa refresh. Membangun server Socket.io di Node.js membutuhkan instance VM persisten (seperti EC2/VPS) dengan sticky sessions.
- **Keputusan**: Menggunakan Supabase Realtime berbasis PostgreSQL WAL (*Write-Ahead Logging*).
- **Konsekuensi**:
  - *Positif*: Tidak ada infrastruktur server realtime yang perlu dikelola. Database menjadi sumber kebenaran (*single source of truth*) yang otomatis menyiarkan perubahan saat ada baris data baru disisipkan.
  - *Negatif*: Bergantung pada SLA jaringan platform Supabase Cloud.
  - *Mitigasi*: Jika koneksi WebSocket terputus, klien fallback ke polling REST query setiap 60 detik.

---

## ADR-03: Menggunakan Leaflet & OpenStreetMap Alih-Alih Mapbox / Google Maps
- **Status**: Diterima (Accepted).
- **Konteks**: Aplikasi memerlukan visualisasi spasial peta Indonesia untuk menampilkan episentrum gempa.
- **Keputusan**: Menggunakan Leaflet v1.9+ dan tile OpenStreetMap.
- **Konsekuensi**:
  - *Positif*: 100% open-source, tanpa kartu kredit, tanpa risiko pemblokiran token kuota API berbayar saat demonstrasi juri.
  - *Negatif*: Perlu penanganan SSR khusus (`dynamic import` dengan `ssr: false`) agar tidak memicu error `window is not defined` di Next.js.

---

## ADR-04: Interval Polling Terpusat 60 Detik untuk Data BMKG
- **Status**: Diterima (Accepted).
- **Konteks**: Brief mengusulkan polling berkala ke BMKG. Muncul pertanyaan apakah interval dapat dipercepat (misal 5 atau 10 detik).
- **Keputusan**: Menetapkan interval polling terpusat sebesar 60 detik.
- **Konsekuensi**:
  - *Positif*: Mematuhi batas cache CDN Cloudflare BMKG (`max-age=60`). Mengurangi risiko IP server diblokir oleh BMKG. Menghemat resource serverless compute.
  - *Negatif*: Latensi deteksi gempa dari BMKG ke sistem adalah maksimal 60 detik (dapat diterima sepenuhnya untuk data seismik publik).

---

## ADR-05: Hashing Deterministik untuk Idempotensi & Pencegahan Duplikasi
- **Status**: Diterima (Accepted).
- **Konteks**: Endpoint BMKG tidak menyertakan UUID atau EventID global yang unik di payload-nya.
- **Keputusan**: Membuat `event_hash = md5(DateTime + latitude + longitude + magnitude)` sebagai kolom unik pada database PostgreSQL.
- **Konsekuensi**:
  - *Positif*: Operasi `UPSERT` di database menjadi sangat cepat dan terhindar dari entri kembar atau notifikasi berulang.
