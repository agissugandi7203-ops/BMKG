# Rencana Implementasi Hackathon 13 Jam (Implementation Roadmap)

Rencana kerja terstruktur berbasis waktu (*timeline-driven*) untuk mengeksekusi pengembangan produk MVP dalam total batas waktu **13 jam**.

---

## 1. Alokasi Waktu Berdasarkan Fase (13-Hour Breakdown)

```text
[ Jam 00:00 - 01:00 ] Fase 0: Setup Proyek, Dependensi & Supabase Initializing
[ Jam 01:00 - 02:30 ] Fase 1: Skema Database, RLS, & Google OAuth Authentication
[ Jam 02:30 - 04:30 ] Fase 2: Integrasi BMKG Parser, Deduplikasi & Polling Worker
[ Jam 04:30 - 07:00 ] Fase 3: Dashboard Utama, Komponen UI & Visualisasi Peta Leaflet
[ Jam 07:00 - 08:30 ] Fase 4: Supabase Realtime Broadcasting & Audio Alert Engine
[ Jam 08:30 - 10:30 ] Fase 5: Konsol Simulasi Administrator & Isolasi Data Skenario
[ Jam 10:30 - 11:30 ] Fase 6: Notifikasi Browser, Fitur Share & Indikator Kesegaran
[ Jam 11:30 - 12:30 ] Fase 7: Pengujian Menyeluruh (End-to-End Testing) & Bug Fixing
[ Jam 12:30 - 13:00 ] Fase 8: Deployment Final Vercel, Verifikasi URL Publik & Demo Rehearsal
```

---

## 2. Rincian Fase & Pekerjaan Paralel vs Sekuensial

| Fase | Durasi | Target Utama & Deliverables | Ketergantungan | Tim Dapat Paralel? |
| :--- | :---: | :--- | :--- | :---: |
| **Fase 0: Setup** | 1.0 jam | Next.js scaffold di folder `BMKG`, instalasi packages (Supabase, Leaflet, shadcn/ui, Zod, Lucide), setup git remote & `.env.local`. | Tidak ada | Sekuensial |
| **Fase 1: Database & Auth** | 1.5 jam | Eksekusi DDL PostgreSQL di Supabase Console, setup RLS, konfigurasi Google OAuth di Supabase Auth & login callback. | Selesai Fase 0 | **Paralel**: Dev A (DDL & RLS), Dev B (Konfigurasi Google Cloud Console) |
| **Fase 2: BMKG Ingestion** | 2.0 jam | Endpoint `/api/cron/sync-bmkg`, fetcher paralel 3 endpoint BMKG, normalisasi data, kalkulasi `event_hash`, log sinkronisasi. | Selesai Fase 1 | Sekuensial (Inti data aplikasi) |
| **Fase 3: Frontend & Peta** | 2.5 jam | Layout responsif, Hero Card gempa terkini, wrapper Leaflet dynamic import, rendering marker episentrum, tab riwayat gempa. | Selesai Fase 2 | **Paralel**: Dev A (Komponen Peta & Marker), Dev B (Hero Banner, Tab List & Desain UI) |
| **Fase 4: Realtime & Audio** | 1.5 jam | Supabase Realtime client listener, sinkronisasi state saat data baru masuk, sintesis suara sirine via Web Audio API, tombol mute toggle. | Selesai Fase 3 | **Paralel**: Dev A (Realtime Listener), Dev B (Web Audio Engine) |
| **Fase 5: Mode Simulasi** | 2.0 jam | Rute `/admin/simulation`, form input parameter gempa rekaan, verifikasi allowlist email admin, broadcast event simulasi, banner merah peringatan demo. | Selesai Fase 4 | Sekuensial |
| **Fase 6: Features P1** | 1.0 jam | Web Notification API, tombol copy link & share WhatsApp, status koneksi BMKG (hijau/kuning/merah). | Selesai Fase 5 | **Paralel**: Dev A (Web Notification), Dev B (Share Cards & Status Indicator) |
| **Fase 7: Testing & Fix** | 1.0 jam | Simulasi offline BMKG, uji browser autoplay di Chrome/Safari/Edge, uji login admin non-allowlist. | Selesai Fase 6 | Semua Anggota Tim |
| **Fase 8: Deploy & Demo** | 0.5 jam | Vercel production deployment, verifikasi domain publik, gladi bersih presentasi demo juri (2 menit durasi demo). | Selesai Fase 7 | Semua Anggota Tim |

---

## 3. Strategi Pengurangan Risiko Demo Hackathon (Fail-Safe Strategy)
1. **Aturan "P0 First, P1 Later"**: Jika pada Jam ke-08:30 integrasi P0 mengalami kendala, seluruh fitur P1 (Web Notification, PWA, dynamic OG image) langsung dipangkas agar fokus menyelesaikan alur simulasi dan dashboard utama.
2. **Mock Seed Data**: Sediakan file JSON lokal berisi 15 rekaman gempa statis di repositori. Jika koneksi internet ke BMKG terputus saat presentasi di depan juri, sistem dapat beralih ke mode *Local Demo Seed* dengan satu toggle environment variable.
3. **Pemberitahuan Suara Siap Uji**: Pastikan tombol "Uji Coba Suara" (*Test Sound*) tersedia di panel admin sehingga tim dapat membuktikan fitur audio bekerja tanpa harus menunggu gempa bumi nyata terjadi.
