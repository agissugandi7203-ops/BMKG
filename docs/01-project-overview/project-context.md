# Konteks Proyek (Project Context)

## 1. Latar Belakang & Masalah Utama
Indonesia berada di wilayah pertemuan tiga lempeng tektonik utama dunia (Indo-Australia, Eurasia, dan Pasifik) serta Cincin Api Pasifik (*Pacific Ring of Fire*). Kondisi geologis ini menjadikan wilayah Indonesia rentan terhadap gempa bumi tektonik berkala dan potensi tsunami sekunder.

Meskipun **Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)** secara aktif dan cepat mempublikasikan data seismik melalui sistem peringatan dini TEWS (*Tsunami Early Warning System*), terdapat kesenjangan pada sisi penerimaan informasi di level masyarakat luas:
1. **Ketiadaan Peringatan Realtime Proaktif Tanpa Refresh Manual**: Masyarakat sering kali baru mengetahui gempa setelah beberapa menit terjadi atau harus me-refresh situs berulang kali.
2. **Keterbatasan Visualisasi Kontekstual**: Data mentah berupa tabel koordinat dan teks wilayah sering kali sulit dipahami secara spasial dalam hitungan detik pertama kejadian.
3. **Ketiadaan Alarm Suara Multilevel di Browser**: Saat kejadian gempa terjadi di malam hari atau pengguna tidak sedang menatap layar, notifikasi hening (*silent push*) sering kali terabaikan.
4. **Tantangan Simulasi & Kesiapsiagaan**: Tidak tersedianya lingkungan simulasi interaktif yang aman untuk menguji kesiapan sistem peringatan dini tanpa mengaburkan atau mencampuri data resmi BMKG.

---

## 2. Visi Produk
Membangun platform pemantauan aktivitas gempa bumi terpadu di Indonesia yang berorientasi pada kecepatan distribusi, kejelasan visualisasi spasial, dan keandalan sistem peringatan dini berbasis web. 

Platform ini bertindak sebagai **jembatan informasi pendukung (*secondary information broadcast platform*)** yang mengambil data terverifikasi langsung dari server BMKG, menyebarkannya secara instan melalui koneksi *event-driven realtime* (WebSocket/Supabase Realtime), dan menyajikannya secara profesional kepada publik.

> [!IMPORTANT]
> **Pernyataan Batas Etis & Legalitas**:
> Platform ini adalah sistem **distribusi informasi dan pemantauan**, BUKAN sistem prediksi gempa bumi. Sistem **TIDAK MENGKLAIM** dapat mendeteksi atau memprediksi gempa sebelum sensor BMKG mencatat dan mempublikasikannya. Semua atribusi data secara mutlak merujuk pada BMKG Republik Indonesia.

---

## 3. Target Pengguna
1. **Masyarakat Umum (Public Visitor)**:
   - Warga yang ingin memantau kondisi seismik di wilayahnya secara cepat.
   - Membutuhkan notifikasi audio/visual otomatis saat gempa signifikan terjadi di Indonesia.
   - Tidak diwajibkan mendaftar/login untuk mengakses data darurat publik.
2. **Pengguna Terdaftar (Registered User)**:
   - Pengguna umum yang login menggunakan akun Google untuk mengatur preferensi notifikasi, riwayat personal, atau feedback gempa dirasakan.
3. **Administrator / Penguji Sistem (System Operator / Hackathon Evaluator)**:
   - Pengguna dengan izin khusus yang terverifikasi di server melalui *allowlist*.
   - Bertanggung jawab memantau *health check* sinkronisasi BMKG, mengontrol skenario simulasi, dan memvalidasi saluran distribusi peringatan.

---

## 4. Alur Kerja Sistem Tingkat Tinggi (High-Level System Workflow)

```mermaid
flowchart TD
    subgraph External["External Layer"]
        BMKG["BMKG TEWS Server<br/>(Open Data JSON Feeds)"]
    end

    subgraph Backend["Backend & Sync Engine"]
        CronWorker["Scheduled Sync Worker<br/>(Supabase Cron / Next.js Handler)"]
        Parser["Parser, Normalizer &<br/>Deduplication Engine"]
        DB[(Supabase PostgreSQL)]
        RealtimeHub["Supabase Realtime<br/>(Postgres CDC Broadcast)"]
    end

    subgraph Client["Frontend Client (Next.js)"]
        PublicDash["Public Realtime Dashboard"]
        LeafletMap["Interactive Leaflet Map"]
        AudioAlert["Audio Alert Manager<br/>(Web Audio / Sound FX)"]
        WebNotify["Web Notification API"]
        AdminSim["Admin Simulation Console"]
    end

    BMKG -->|Polling tiap 60 detik| CronWorker
    CronWorker --> Parser
    Parser -->|Cek Hash & Simpan Data Baru| DB
    DB -->|Change Data Capture (CDC)| RealtimeHub
    RealtimeHub -->|WebSocket Push Event| PublicDash
    PublicDash --> LeafletMap
    PublicDash --> AudioAlert
    PublicDash --> WebNotify

    AdminSim -->|Trigger Simulasi Terisolasi| DB
    DB -->|CDC Event (Tipe: SIMULATION)| RealtimeHub
```
