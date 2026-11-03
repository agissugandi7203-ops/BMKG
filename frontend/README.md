# Frontend - BMKG Platform

Direktori ini disiapkan untuk aplikasi frontend / antarmuka web sistem BMKG.

---

## 🛠️ Rekomendasi Tech Stack

- **Framework**: Next.js (React), Nuxt (Vue), atau Vite + React/Svelte
- **Styling**: Tailwind CSS / Shadcn UI
- **Peta & Visualisasi**: Leaflet, Mapbox GL JS, atau OpenLayers (untuk visualisasi gempa bumi & sebaran cuaca)
- **State Management**: TanStack Query (React Query) / Zustand / SWR

---

## 📂 Rekomendasi Struktur Folder

```text
frontend/
├── public/            # Aset statis (icon, logo, gambar)
├── src/
│   ├── components/    # Reusable UI components (WeatherCard, EarthquakeMap, dll.)
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Halaman / Views (atau app/ untuk App Router)
│   ├── services/      # API client ke backend
│   └── utils/         # Helper functions / formatters
├── .env.example       # Template env frontend
├── package.json
└── README.md
```

---

## 🚀 Langkah Awal

Ketika siap memulai inisialisasi frontend, jalankan inisialisasi di folder ini (misalnya `npm create vite@latest .` atau `npx create-next-app@latest .`).
