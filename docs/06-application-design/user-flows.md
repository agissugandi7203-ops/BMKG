# Alur Pengguna (User Flows)

Kumpulan diagram alur interaksi pengguna (User Flows) untuk skenario utama sistem: pengunjung publik, penerimaan gempa baru, dan demonstrasi simulasi oleh administrator.

---

## 1. Alur Pengunjung Publik (Public Visitor Flow)

```mermaid
flowchart TD
    A([Pengguna Membuka URL /]) --> B[Server Components Render Halaman Utama]
    B --> C[Browser Paint Dashboard & Inisialisasi Peta Leaflet]
    C --> D{Apakah Pengguna Mengaktifkan Suara?}
    
    D -- Ya --> E[Pengguna Klik Toggle Suara]
    E --> F[Browser Unlock AudioContext & Simpan State Aktif]
    
    D -- Tidak --> G[Tetap dalam Mode Audio Hening]
    
    F --> H[Browser Terhubung ke WebSocket Supabase Realtime]
    G --> H
    
    H --> I[Pengguna Menjelajahi Peta & Daftar Gempa]
    I --> J{Pengguna Klik Salah Satu Gempa?}
    J -- Ya --> K[Peta Bergeser ke Koordinat Episentrum & Tampilkan Popup]
    J -- Tidak --> I
```

---

## 2. Alur Penerimaan Data Gempa Baru (Incoming Earthquake Event Flow)

```mermaid
flowchart TD
    Trigger([BMKG Menerbitkan Gempa Baru M 5.5]) --> Ingest[Cron Worker Menyimpan ke Database]
    Ingest --> WS[Supabase Realtime Memicu Event INSERT]
    
    WS --> Client[Klien Menerima Event di Browser]
    Client --> Visual[Hero Card Diperbarui & Peta Menambahkan Marker Denyut]
    
    Client --> CheckAudio{Audio Switch Aktif?}
    CheckAudio -- Ya --> PlaySound[Osilator Web Audio Membunyikan Sirine Peringatan]
    CheckAudio -- Tidak --> VisualOnly[Tampilkan Banner Visual Tanpa Suara]
    
    Client --> CheckNotify{Izin Notifikasi Diberikan?}
    CheckNotify -- Ya --> PushWeb[Tampilkan Web Notification di Desktop/HP]
    CheckNotify -- Tidak --> SkipNotify[Lewati Notifikasi Browser]
```

---

## 3. Alur Demonstrasi Simulasi Administrator (Admin Simulation Demo Flow)

```mermaid
flowchart TD
    Admin([Admin / Evaluator]) --> Login[Login Menggunakan Akun Google]
    Login --> Verify{Email Masuk Allowlist Admin?}
    
    Verify -- Tidak --> Denied[Tampilkan Pesan 403 Akses Ditolak & Redirect ke Beranda]
    
    Verify -- Ya --> AdminPanel[Buka Halaman /admin/simulation]
    AdminPanel --> FillForm[Isi Form: Magnitudo 7.5, Kedalaman 10km, Lokasi Selat Sunda]
    FillForm --> ClickRun[Klik Tombol Jalankan Simulasi]
    
    ClickRun --> API[Kirim POST /api/simulation]
    API --> SaveSim[Simpan ke Tabel simulation_events]
    SaveSim --> EmitSim[Kirim Event WebSocket SIMULATION]
    
    EmitSim --> AllBrowsers[Semua Klien Terbuka Menerima Peringatan Simulasi]
    AllBrowsers --> ShowRedBanner[Tampilkan Banner Merah 'PERINGATAN SIMULASI']
    AllBrowsers --> PlayDemoSound[Bunyikan Sirine Uji Coba Audio]
    
    AdminPanel --> ClickStop[Admin Klik Hentikan Simulasi]
    ClickStop --> APIStop[Kirim DELETE /api/simulation]
    APIStop --> RevertUI[Semua Klien Menghapus Banner Simulasi & Kembali ke Data BMKG Resmi]
```
