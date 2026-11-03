# Backend - BMKG Platform

Direktori ini disiapkan untuk service backend / API server sistem BMKG.

---

## 🛠️ Rekomendasi Tech Stack

Anda dapat menggunakan salah satu opsi berikut sesuai preferensi arsitektur:
- **Node.js / TypeScript**: Express.js, NestJS, atau Fastify
- **Python**: FastAPI (sangat cocok untuk integrasi data saintifik / geospasial / caching BMKG)
- **Go**: Gin atau Fiber (performa tinggi untuk streaming data / webhook gempa)

---

## 📂 Rekomendasi Struktur Folder

```text
backend/
├── src/
│   ├── config/        # Konfigurasi aplikasi & env
│   ├── controllers/   # Request handlers / routing
│   ├── services/      # Logika parser BMKG & caching
│   ├── models/        # Skema & model data
│   └── routes/        # Definisi route API
├── tests/             # Unit & integration testing
├── .env.example       # Template konfigurasi environment
├── package.json       # (atau requirements.txt / go.mod)
└── README.md
```

---

## 🚀 Langkah Awal

Ketika siap memulai inisialisasi backend, jalankan perintah inisialisasi proyek di folder ini (misal: `npm init -y` atau `python -m venv .venv` atau `go mod init bmkg-backend`).
