# Struktur Situs & Navigasi (Sitemap & Routing)

Dokumen ini memetakan seluruh rute halaman, komponen utama, hak akses pengguna, dan perilaku responsif sistem.

---

## 1. Peta Rute Aplikasi (Application Sitemap)

```text
/ (Root)
│
├── / (Beranda / Public Monitoring Dashboard)
│   ├── Hero Section: Gempa Terkini + Shakemap Image
│   ├── Map Section: Peta Spasial Indonesia (Leaflet)
│   ├── Feed Section: Tab Gempa M 5.0+ dan Gempa Dirasakan
│   └── System Status Bar: Status Koneksi BMKG & Kesegaran Data
│
├── /earthquake/[id] (Halaman Detail Kejadian Gempa)
│   ├── Informasi Spesifik Parameter Seismik
│   ├── Peta Episentrum Terfokus (Zoom Tinggi)
│   ├── Gambar Shakemap Resolusi Penuh
│   └── Tombol Bagikan (Shareable Link, Twitter/X, WhatsApp)
│
├── /admin (Area Khusus Administrator - Dilindungi RBAC)
│   ├── /admin/simulation (Konsol Skenario Simulasi Gempa)
│   │   ├── Form Input Parameter Gempa Tiruan
│   │   ├── Kontrol Status Simulasi (Jalankan / Hentikan)
│   │   └── Riwayat Skenario Simulasi Demo
│   │
│   └── /admin/logs (Audit Trail Sistem)
│       └── Tabel Log Sinkronisasi Cron BMKG & Durasi Eksekusi
│
└── /auth
    └── /auth/callback (Penanganan Redirect OAuth Supabase)
```

---

## 2. Matriks Rute & Proteksi Halaman

| Rute URL | Tipe Halaman | Hak Akses | Perilaku Responsif |
| :--- | :--- | :--- | :--- |
| `/` | SSR + Client Realtime | Publik (Semua) | Desktop: Layout 2 Kolom (Kiri: Hero & Tabel, Kanan: Peta Statis Terkunci). Mobile: Stack Vertikal (Hero -> Peta -> List). |
| `/earthquake/[id]` | Server Component | Publik (Semua) | Kartu terpusat yang ramah tampilan mobile untuk kemudahan membaca dari link WhatsApp. |
| `/admin/simulation` | Client Interactive | Administrator Saja | Tampilan formulir kontrol dengan pratinjau peta interaktif pemilihan koordinat titik gempa. |
| `/admin/logs` | Server Component | Administrator Saja | Tabel data dengan filter status `SUCCESS` / `FAILED`. |
| `/auth/callback` | Server Route Handler | Publik | Memproses token OAuth dan me-redirect pengguna ke halaman asal. |
