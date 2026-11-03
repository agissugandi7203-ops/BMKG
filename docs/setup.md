# Panduan Setup & Instalasi Lokal

Panduan langkah demi langkah untuk menjalankan proyek BMKG di komputer lokal.

---

## 🛠️ Prasyarat (Prerequisites)

- **Git** (versi 2.30+)
- **Node.js** (versi LTS terbaru, misal v20+) ATAU **Python** (versi 3.10+) / **Go** tergantung pilihan stack Anda
- **Package Manager**: `npm`, `pnpm`, atau `yarn`

---

## ⚙️ Langkah Instalasi

### 1. Clone Repositori
```bash
git clone https://github.com/<USERNAME>/BMKG.git
cd BMKG
```

### 2. Setup Backend
Masuk ke direktori backend dan instal dependensi (sesuai stack yang dipilih):
```bash
cd backend
# Contoh untuk Node.js:
# npm install
# npm run dev

# Contoh untuk Python:
# python -m venv .venv
# source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
# pip install -r requirements.txt
# uvicorn main:app --reload
```

### 3. Setup Frontend
Buka terminal baru, masuk ke direktori frontend:
```bash
cd frontend
# Contoh untuk Node.js / Vite / Next.js:
# npm install
# npm run dev
```

---

## 🔐 Environment Variables
Buat file `.env` pada masing-masing subdirektori (`backend/` dan `frontend/`) dengan mengacu pada template `.env.example` yang disediakan di direktori terkait.
