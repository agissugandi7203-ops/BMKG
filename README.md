# BMKG Monorepo

Repositori monorepo untuk proyek BMKG (Badan Meteorologi, Klimatologi, dan Geofisika). Struktur repositori ini dirancang untuk memisahkan dokumentasi, aplikasi backend, dan frontend secara modular dan rapi.

---

## 📁 Struktur Direktori

```text
BMKG/
├── .github/
│   └── workflows/
│       └── ci.yml             # Workflow GitHub Actions CI (opsional/template)
├── backend/                   # Layanan & API Backend
│   └── README.md
├── frontend/                  # Antarmuka Pengguna (Web/Mobile)
│   └── README.md
├── docs/                      # Dokumentasi Sistem & Spesifikasi
│   ├── README.md
│   ├── architecture.md        # Arsitektur sistem & diagram
│   ├── api.md                 # Spesifikasi API endpoint & data BMKG
│   └── setup.md               # Panduan instalasi & konfigurasi lokal
├── .editorconfig              # Standar format kode editor
├── .gitignore                 # Konfigurasi ignore file Git
└── README.md                  # Dokumentasi utama proyek
```

---

## 🚀 Memulai (Getting Started)

### Prasyarat
- [Git](https://git-scm.com/)
- Runtime / Tools sesuai tech stack yang akan dipilih untuk Backend & Frontend (misal: Node.js, Python/FastAPI, Go, Docker, dll.)

### Navigasi Proyek
- Masuk ke subdirektori terkait untuk memulai pengembangan:
  - Dokumentasi: lihat folder [`docs/`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/README.md)
  - Backend API: lihat folder [`backend/`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/backend/README.md)
  - Frontend App: lihat folder [`frontend/`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/frontend/README.md)

---

## 📤 Panduan Push ke GitHub

Ikuti langkah-langkah berikut untuk menghubungkan dan mengunggah repositori ini ke GitHub:

1. Buat repositori baru di GitHub (misalnya dengan nama `BMKG`).
2. Jalankan perintah berikut di terminal:

```bash
# Pindah ke direktori BMKG
cd BMKG

# Tambahkan URL remote GitHub Anda (ganti username dan repository_name)
git remote add origin https://github.com/<USERNAME>/<REPOSITORY_NAME>.git

# Pastikan branch utama bernama main
git branch -M main

# Push seluruh branch ke GitHub
git push -u origin main
```
