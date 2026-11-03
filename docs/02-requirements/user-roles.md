# Peran Pengguna & Matriks Hak Akses (User Roles & Permissions)

Sistem membedakan tiga tingkat entitas pengguna untuk menjaga keseimbangan antara aksesibilitas informasi darurat bagi publik dan keamanan kontrol skenario simulasi bagi administrator.

---

## 1. Definisi Peran (Role Definitions)

### 1. Anonymous Public Visitor (Pengguna Publik Tanpa Login)
- **Karakteristik**: Warga umum yang membuka tautan situs tanpa melalui proses login.
- **Filosofi Akses**: Informasi kebencanaan adalah hak publik; tidak boleh ada *paywall* atau kewajiban login untuk melihat status gempa darurat.
- **Kemampuan Akses**:
  - Melihat ringkasan gempa bumi terkini (*Hero Banner*).
  - Menjelajahi peta interaktif episentrum gempa.
  - Membaca daftar 15 gempa terakhir ($M \ge 5.0$ dan gempa dirasakan).
  - Mengaktifkan/menonaktifkan alarm suara (*Sound Alert*) di browser lokal.
  - Mengizinkan notifikasi browser (*Web Notification API*).
  - Membuka halaman detail kejadian gempa melalui URL langsung.
  - Melihat status simulasi jika administrator sedang menyiarkan demo.

### 2. Authenticated Public User (Pengguna Publik Terdaftar)
- **Karakteristik**: Pengguna umum yang login menggunakan akun Google.
- **Kemampuan Akses**:
  - Semua hak akses Anonymous Public Visitor.
  - Menyimpan preferensi notifikasi secara tersinkronisasi di server (misal: hanya ingin alarm jika $M \ge 5.0$).
  - Mengakses riwayat personal notifikasi gempa.

### 3. System Administrator (Operator Sistem / Juri Demo)
- **Karakteristik**: Pengguna terautentikasi Google yang email-nya tercantum dalam variabel lingkungan `ADMIN_ALLOWLIST_EMAILS` atau berstatus `role = 'admin'` di tabel `profiles`.
- **Kemampuan Akses**:
  - Semua hak akses pengguna publik.
  - Akses eksklusif ke rute `/admin/*` (dilindungi middleware dan server handler).
  - **Kontrol Simulasi**: Membuat skenario gempa tiruan (magnitudo, kedalaman, titik koordinat peta, potensi tsunami).
  - **Eksekusi & Terminasi Simulasi**: Menyiarkan event simulasi ke seluruh klien aktif dan menghentikannya seketika.
  - **Monitoring Sistem**: Memeriksa *health status* sinkronisasi cron BMKG, durasi respon BMKG, dan log kegagalan parsing.

---

## 2. Matriks Hak Akses (Permission Matrix)

| Modul / Rute / Aksi | Anonymous Visitor | Authenticated User | System Administrator |
| :--- | :---: | :---: | :---: |
| Akses Dashboard Publik (`/`) | ✅ Ya | ✅ Ya | ✅ Ya |
| Interaksi Peta & Detail Gempa | ✅ Ya | ✅ Ya | ✅ Ya |
| Toggle Sound Alert (Lokal) | ✅ Ya | ✅ Ya | ✅ Ya |
| Login Google OAuth | ✅ Ya | ✅ (Sudah Login) | ✅ (Sudah Login) |
| Simpan Preferensi ke Cloud | ❌ Tidak | ✅ Ya | ✅ Ya |
| Akses Halaman Admin (`/admin`) | ❌ Ditolak (403) | ❌ Ditolak (403) | ✅ Ya |
| Eksekusi Simulasi Gempa | ❌ Ditolak (403) | ❌ Ditolak (403) | ✅ Ya |
| Reset / Stop Simulasi | ❌ Ditolak (403) | ❌ Ditolak (403) | ✅ Ya |
| Lihat Log Sinkronisasi BMKG | ❌ Tidak | ❌ Tidak | ✅ Ya |
| Mutasi Data Resmi BMKG | ❌ Ditolak (RLS) | ❌ Ditolak (RLS) | ❌ Ditolak (Hanya Cron Worker) |

> [!CAUTION]
> **Pencegahan Ekskalasi Akses**:
> Admin HANYA dapat memanipulasi data di tabel `simulation_events`. Tidak ada antarmuka maupun API bagi siapapun (termasuk admin) untuk mengedit atau menghapus data resmi di tabel `earthquake_events` BMKG.
