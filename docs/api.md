# Spesifikasi API BMKG

Dokumen ini memuat standar endpoint backend dan referensi integrasi data terbuka BMKG.

---

## 🛰️ Integrasi Data Terbuka BMKG (External Feeds)

BMKG menyediakan data terbuka publik melalui URL resmi:
- **Gempa Terkini**: `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
- **Daftar 15 Gempa M 5.0+**: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- **Daftar 15 Gempa Dirasakan**: `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
- **Prakiraan Cuaca**: Format XML per provinsi (misal: `https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Indonesia.xml`)

---

## 🔌 Desain Endpoint Internal Backend (Draft)

Backend akan mengabstraksi data mentah dari BMKG menjadi response JSON yang bersih dan terstruktur:

### 1. Gempa Bumi

- **GET `/api/v1/earthquake/latest`**
  - Mengambil data gempa terbaru (M 5.0+ atau dirasakan).
  - *Response*:
    ```json
    {
      "success": true,
      "data": {
        "datetime": "2026-11-03T13:42:00+07:00",
        "magnitude": 5.2,
        "depth": "10 km",
        "coordinates": {
          "latitude": -8.12,
          "longitude": 115.23
        },
        "region": "Selatan Bali",
        "potentialTsunami": false,
        "shakemapUrl": "https://data.bmkg.go.id/DataMKG/TEWS/..."
      }
    }
    ```

- **GET `/api/v1/earthquake/recent`**
  - Mengambil daftar gempa terkini.

### 2. Cuaca (Weather Forecast)

- **GET `/api/v1/weather/provinces`**
  - Mengambil daftar provinsi yang didukung.

- **GET `/api/v1/weather/forecast?province=dki-jakarta`**
  - Mengambil prakiraan cuaca per kota/kabupaten dalam rentang waktu beberapa hari ke depan.
