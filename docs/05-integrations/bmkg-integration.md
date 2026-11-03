# Integrasi Data Terbuka BMKG (BMKG TEWS Integration)

Dokumen ini merangkum hasil uji konektivitas langsung, observasi skema data aktual, karakteristik jaringan, dan strategi transformasi data dari server resmi BMKG (*Badan Meteorologi, Klimatologi, dan Geofisika*).

---

## 1. Verifikasi Endpoint & Status Jaringan Aktual

Pengujian konektivitas langsung dilakukan ke server resmi BMKG (`data.bmkg.go.id`):

| Endpoint | Kegunaan | Tipe Return | Cache CDN BMKG | Status Uji |
| :--- | :--- | :--- | :--- | :---: |
| `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` | 1 Kejadian Gempa Bumi Terbaru (M 5.0+ / Dirasakan) | Single Object | `max-age=60` | ✅ 200 OK |
| `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` | 15 Kejadian Gempa Bumi Terkini (Magnitudo 5.0+) | Array of Objects | `max-age=60` | ✅ 200 OK |
| `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json` | 15 Kejadian Gempa Bumi yang Dirasakan Nyata | Array of Objects | `max-age=60` | ✅ 200 OK |

> [!WARNING]
> **Karakteristik Proteksi Cloudflare BMKG**:
> Server BMKG dilindungi oleh Cloudflare. Request yang dikirim tanpa header browser standar (misalnya default CLI user agent) berpotensi menerima respons `{"status": 403, "message": "Forbidden"}`.
> **Solusi Wajib**: Setiap request fetch backend wajib menyertakan header:
> ```ts
> headers: {
>   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BMKG-Realtime-Monitor/1.0',
>   'Accept': 'application/json'
> }
> ```

---

## 2. Struktur Payload Aktual BMKG (Inspeksi Riil)

### A. Endpoint `autogempa.json`
```json
{
  "Infogempa": {
    "gempa": {
      "Tanggal": "03 Nov 2026",
      "Jam": "18:43:49 WIB",
      "DateTime": "2026-11-03T11:43:49+00:00",
      "Coordinates": "-8.27,120.63",
      "Lintang": "8.27 LS",
      "Bujur": "120.63 BT",
      "Magnitude": "4.2",
      "Kedalaman": "10 km",
      "Wilayah": "Pusat gempa berada di laut 42 km Timur Laut Ruteng, Manggarai",
      "Potensi": "Gempa ini dirasakan untuk diteruskan pada masyarakat",
      "Dirasakan": "II - III Kab. Nagekeo, II - III Kab. Manggarai",
      "Shakemap": "20261103184349.mmi.jpg"
    }
  }
}
```

### B. Endpoint `gempaterkini.json` (Array)
```json
{
  "Infogempa": {
    "gempa": [
      {
        "Tanggal": "02 Nov 2026",
        "Jam": "15:13:10 WIB",
        "DateTime": "2026-11-02T08:13:10+00:00",
        "Coordinates": "1.31,124.83",
        "Lintang": "1.31 LU",
        "Bujur": "124.83 BT",
        "Magnitude": "5.3",
        "Kedalaman": "148 km",
        "Wilayah": "1 km Barat Daya TOMOHON-SULUT",
        "Potensi": "Tidak berpotensi tsunami"
      }
      // ... 14 data lainnya
    ]
  }
}
```

### C. Endpoint `gempadirasakan.json` (Array)
```json
{
  "Infogempa": {
    "gempa": [
      {
        "Tanggal": "03 Nov 2026",
        "Jam": "18:43:49 WIB",
        "DateTime": "2026-11-03T11:43:49+00:00",
        "Coordinates": "-8.27,120.63",
        "Lintang": "8.27 LS",
        "Bujur": "120.63 BT",
        "Magnitude": "4.2",
        "Kedalaman": "10 km",
        "Wilayah": "Pusat gempa berada di laut 42 km Timur Laut Ruteng, Manggarai",
        "Dirasakan": "II - III Kab. Nagekeo, II - III Kab. Manggarai"
      }
      // ... 14 data lainnya
    ]
  }
}
```

---

## 3. Logika Normalisasi Data (Parser Logic)

Setiap record BMKG dinormalisasi sebelum masuk ke database:

```ts
// lib/bmkg/normalizer.ts
import { z } from 'zod';
import crypto from 'crypto';

export interface NormalizedEarthquake {
  event_hash: string;
  date_time: Date;
  date_str: string;
  time_str: string;
  latitude: number;
  longitude: number;
  coordinates_raw: string;
  magnitude: number;
  depth_km: number;
  depth_raw: string;
  region: string;
  potential: string;
  felt_mmi: string | null;
  shakemap_filename: string | null;
  shakemap_url: string | null;
  is_latest: boolean;
  source: 'BMKG';
}

export function normalizeBMKGRecord(raw: any, isLatest = false): NormalizedEarthquake {
  // Parse Koordinat "-8.27,120.63"
  const [latStr, lngStr] = (raw.Coordinates || '0,0').split(',');
  const latitude = parseFloat(latStr.trim());
  const longitude = parseFloat(lngStr.trim());

  // Parse Magnitudo string "4.2" -> 4.2
  const magnitude = parseFloat(raw.Magnitude);

  // Parse Kedalaman "10 km" -> 10
  const depthMatch = (raw.Kedalaman || '').match(/\d+/);
  const depth_km = depthMatch ? parseInt(depthMatch[0], 10) : 0;

  // Format Shakemap Image URL
  const shakemap_filename = raw.Shakemap || null;
  const shakemap_url = shakemap_filename 
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${shakemap_filename}`
    : null;

  // Composite Key Pencegah Duplikasi
  const event_hash = crypto
    .createHash('md5')
    .update(`${raw.DateTime}_${latitude}_${longitude}_${magnitude}`)
    .digest('hex');

  return {
    event_hash,
    date_time: new Date(raw.DateTime),
    date_str: raw.Tanggal,
    time_str: raw.Jam,
    latitude,
    longitude,
    coordinates_raw: raw.Coordinates,
    magnitude,
    depth_km,
    depth_raw: raw.Kedalaman,
    region: raw.Wilayah,
    potential: raw.Potensi || 'Tidak berpotensi tsunami',
    felt_mmi: raw.Dirasakan || null,
    shakemap_filename,
    shakemap_url,
    is_latest: isLatest,
    source: 'BMKG'
  };
}
```

---

## 4. Analisis Batasan & Strategi Polling
- **Frekuensi Pembaruan BMKG**: BMKG memperbarui file JSON saat sensor TEWS mendeteksi gempa (rata-rata selang hitungan menit hingga jam).
- **Interval Polling Rekomendasi**: **60 detik**. Polling dengan frekuensi lebih rapat (< 60s) sia-sia karena cache CDN Cloudflare BMKG memiliki durasi `max-age=60`.
- **Penanganan Outage BMKG**: Jika fetch gagal 3x berturut-turut, sistem menyalakan alert `data_stale` di dashboard publik agar pengguna terinformasi.
