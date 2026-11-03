# Alur Data Sistem (Data Flow Specifications)

Dokumen ini memetakan secara detail alur data pada 4 skenario operasional utama sistem.

---

## 1. Alur Sinkronisasi Data Masuk (Ingestion Flow)

1. **Pemicu**: Penjadwal cron memanggil `/api/cron/sync-bmkg` setiap 60 detik.
2. **Pengambilan Data**: Backend mengirimkan GET request ke:
   - `autogempa.json` (1 objek data gempa terbaru).
   - `gempaterkini.json` (array 15 objek gempa $M \ge 5.0$).
   - `gempadirasakan.json` (array 15 objek gempa dirasakan).
3. **Transformasi & Normalisasi**:
   - Pemisahan string koordinat (contoh: `"-8.27,120.63"` dipecah menjadi float `latitude: -8.27`, `longitude: 120.63`).
   - Normalisasi angka magnitudo (string `"4.2"` menjadi float `4.2`).
   - Ekstraksi angka kedalaman (string `"10 km"` menjadi integer `10`).
   - Konversi format waktu ke `TIMESTAMPTZ` ISO 8601 UTC.
   - Pembangunan URL absolut Shakemap jika field tersedia: `https://data.bmkg.go.id/DataMKG/TEWS/` + `Shakemap`.
4. **Pencegahan Duplikasi**:
   - Membentuk `event_hash = md5(DateTime + latitude + longitude + magnitude)`.
   - Melakukan `UPSERT` pada tabel `earthquake_events` dengan basis kolom `event_hash`.
5. **Logging**:
   - Mencatat waktu selesai dan jumlah baris baru ke tabel `system_logs`.

---

## 2. Alur Siaran Peringatan Realtime (Realtime Broadcast Flow)

```mermaid
sequenceDiagram
    participant DB as PostgreSQL (earthquake_events)
    participant WAL as PostgreSQL Write-Ahead Log
    participant Realtime as Supabase Realtime Server
    participant WS as WebSocket Connection
    participant Browser as Client Browser (React State)
    participant Audio as Web Audio Chime

    DB->>WAL: INSERT New Row (is_latest: true)
    WAL->>Realtime: Logical Replication Payload
    Realtime->>WS: Push Event: 'postgres_changes' (INSERT)
    WS->>Browser: onReceivePayload(newEvent)
    Browser->>Browser: Update Earthquake State & Hero Banner
    Browser->>Browser: Animate Leaflet Marker Pulse
    alt Audio Switch == ON
        Browser->>Audio: playAlertSiren(newEvent.magnitude)
    end
```

---

## 3. Alur Eksekusi Simulasi Terisolasi (Simulation Flow)

Untuk menjaga integritas data ilmiah, alur eksekusi simulasi dipisahkan secara fisik di tingkat basis data:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant AdminUI as /admin/simulation UI
    participant Handler as POST /api/simulation
    participant SimTable as Table: simulation_events
    participant Realtime as Supabase Realtime
    participant PublicDash as Public Dashboard

    Admin->>AdminUI: Input Parameter (M 7.2, Selat Sunda, Tsunami: Ya)
    Admin->>AdminUI: Klik "Jalankan Simulasi"
    AdminUI->>Handler: POST { magnitude: 7.2, location: "Selat Sunda", ... }
    Handler->>Handler: Validasi Sesi & Role Admin
    Handler->>SimTable: INSERT INTO simulation_events (status='ACTIVE')
    SimTable-->>Realtime: WAL CDC Event (INSERT)
    Realtime-->>PublicDash: Broadcast { type: 'SIMULATION', data: {...} }
    PublicDash->>PublicDash: Tampilkan Banner Merah "PERINGATAN SIMULASI"
    PublicDash->>PublicDash: Bunyikan Alarm Simulasi

    Admin->>AdminUI: Klik "Hentikan Simulasi"
    AdminUI->>Handler: DELETE /api/simulation
    Handler->>SimTable: UPDATE simulation_events SET status='STOPPED'
    SimTable-->>Realtime: WAL CDC Event (UPDATE)
    Realtime-->>PublicDash: Broadcast { type: 'SIMULATION_STOPPED' }
    PublicDash->>PublicDash: Sembunyikan Banner Simulasi & Kembali ke Data BMKG
```

---

## 4. Alur Permintaan Detail & Shareable Card

1. Pengguna membuka URL `/earthquake/[id]` atau mengklik kartu gempa di dashboard.
2. Server Component memuat data gempa spesifik dari tabel `earthquake_events` berdasarkan ID unik.
3. Metadata OpenGraph (`og:title`, `og:description`, `og:image`) dirender di server:
   - URL gambar OG merujuk ke endpoint dinamis `/api/share/[id]/og-image`.
   - Endpoint menghasilkan gambar kartu darurat otomatis berisi magnitudo, waktu kejadian, peta mini, dan logo resmi BMKG.
4. Saat dibagikan ke WhatsApp, Twitter, atau Facebook, kartu pratinjau muncul secara instan dan rapi.
