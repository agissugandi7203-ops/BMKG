# Arsitektur Sistem BMKG

Dokumen ini mendeskripsikan arsitektur tingkat tinggi dari platform BMKG.

## 🏛️ Gambaran Umum Arsitektur

Platform BMKG dirancang dengan pendekatan modular/monorepo yang memisahkan backend services dengan client frontend.

```text
+-----------------------+          +-------------------------+
|                       |          |                         |
|     Frontend Web      | <------> |      Backend API        |
|  (Next.js/React/Vite) |   REST/  | (Node.js/Go/Python/...) |
|                       |  GraphQL |                         |
+-----------------------+          +-------------------------+
                                                |
                                                v
                                   +-------------------------+
                                   |      Data Sources       |
                                   |  - BMKG Open Data (XML) |
                                   |  - Cache (Redis)        |
                                   |  - Database (Postgres)  |
                                   +-------------------------+
```

## 🧩 Komponen Utama

1. **Frontend**:
   - Menampilkan visualisasi cuaca, gempa bumi real-time, citra satelit, dan peringatan dini.
   - Peta interaktif (Leaflet / Mapbox / OpenLayers) untuk pemetaan episentrum gempa dan sebaran cuaca.

2. **Backend**:
   - Mengambil & mem-parse data terbuka BMKG (XML / JSON).
   - Layanan caching untuk menjaga performa dan efisiensi konsumsi data BMKG.
   - Menyediakan REST / GraphQL API seragam yang siap dikonsumsi oleh frontend.

3. **Infrastruktur & Deployment**:
   - GitHub Actions untuk CI/CD.
   - Containerization via Docker / Docker Compose.
