# Desain API Internal (API Design & Specifications)

Dokumen ini mendefinisikan rute API internal Next.js Route Handlers (`app/api/*`), parameter query, request body, struktur response JSON, kode HTTP, dan strategi penanganan error.

---

## 1. Konvensi Standar Response JSON

Semua API mengembalikan format terstandarisasi:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-11-03T13:52:00.000Z",
    "version": "v1"
  }
}
```

Format respon saat terjadi error:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Deskripsi kesalahan validasi atau input",
    "details": []
  }
}
```

---

## 2. Rincian Endpoint

### A. GET `/api/earthquakes`
Mengambil daftar riwayat gempa bumi dari database PostgreSQL.
- **Autentikasi**: Publik (Tidak perlu login).
- **Query Parameters**:
  - `limit` (optional, default: `15`, max: `50`): Jumlah data.
  - `min_magnitude` (optional, float): Filter gempa di atas magnitudo tertentu (misal `5.0`).
  - `type` (optional, enum: `'all' | 'felt' | 'latest'`): Filter tipe kejadian.
- **Status Codes**:
  - `200 OK`: Berhasil mengembalikan data.
  - `500 Internal Server Error`: Kegagalan koneksi database.

### B. GET `/api/earthquakes/latest`
Mengambil satu kejadian gempa bumi paling mutakhir yang tercatat dari BMKG.
- **Autentikasi**: Publik.
- **Contoh Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c8b417e0-9bc8-4a56-8ff4-934d7cb2e10a",
      "event_hash": "bmkg_2026-11-03T11:43:49+00:00_-8.27_120.63",
      "date_time": "2026-11-03T11:43:49.000Z",
      "date_str": "03 Nov 2026",
      "time_str": "18:43:49 WIB",
      "latitude": -8.27,
      "longitude": 120.63,
      "magnitude": 4.2,
      "depth_km": 10,
      "region": "Pusat gempa berada di laut 42 km Timur Laut Ruteng, Manggarai",
      "potential": "Gempa ini dirasakan untuk diteruskan pada masyarakat",
      "felt_mmi": "II - III Kab. Nagekeo, II - III Kab. Manggarai",
      "shakemap_url": "https://data.bmkg.go.id/DataMKG/TEWS/20261103184349.mmi.jpg",
      "is_latest": true,
      "source": "BMKG"
    }
  }
  ```

---

### C. POST `/api/cron/sync-bmkg`
Memicu proses sinkronisasi terpusat ke server BMKG.
- **Autentikasi**: Dilindungi header rahasia:
  `Authorization: Bearer <CRON_SECRET>`
- **Logika Internal**:
  1. Melakukan fetch paralel ke 3 endpoint BMKG.
  2. Parse dan kalkulasi hash.
  3. Upsert data ke PostgreSQL.
  4. Catat waktu dan status ke `system_logs`.
- **Status Codes**:
  - `200 OK`: Sinkronisasi berhasil (`{ success: true, new_events: 1, duration_ms: 342 }`).
  - `401 Unauthorized`: Header bearer secret salah atau tidak ada.
  - `502 Bad Gateway`: Server BMKG tidak dapat dihubungi atau mengembalikan respons tidak valid.

---

### D. POST `/api/simulation`
Menginjeksi skenario simulasi gempa tiruan (Hanya untuk keperluan demonstrasi hackathon).
- **Autentikasi**: Wajib sesi login Administrator (`role = 'admin'`).
- **Request Body (JSON)**:
  ```json
  {
    "scenario_name": "Simulasi Gempa Megathrust Selat Sunda",
    "magnitude": 7.4,
    "depth_km": 10,
    "latitude": -6.45,
    "longitude": 105.12,
    "region": "Selat Sunda, 85 km Barat Daya Banten",
    "potential": "BERPOTENSI TSUNAMI"
  }
  ```
- **Status Codes**:
  - `201 Created`: Simulasi aktif berhasil dipicu.
  - `401 Unauthorized`: Belum login.
  - `403 Forbidden`: Login sebagai user biasa, bukan admin di allowlist.
  - `422 Unprocessable Entity`: Input tidak lolos validasi Zod (misal magnitudo bernilai negatif).

---

### E. DELETE `/api/simulation`
Menghentikan skenario simulasi yang sedang berjalan.
- **Autentikasi**: Administrator.
- **Aksi**: Mengubah record simulasi aktif menjadi `is_active = false, status = 'STOPPED'`, memicu Supabase Realtime agar dashboard klien kembali ke data BMKG.
- **Status Code**: `200 OK`.

---

### F. GET `/api/health`
Mengembalikan status kesehatan sistem untuk monitoring dan verifikasi kesiapan demo.
- **Response**:
  ```json
  {
    "status": "HEALTHY",
    "database": "CONNECTED",
    "last_bmkg_sync": "2026-11-03T13:51:30.000Z",
    "sync_latency_ms": 312,
    "active_simulations": 0
  }
  ```
