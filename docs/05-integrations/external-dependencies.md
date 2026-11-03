# Ketergantungan Eksternal (External Dependencies & Credentials)

Dokumen ini memetakan seluruh ketergantungan pihak ketiga, environment variable yang dibutuhkan, dan status kesiapannya sebelum proses development dimulai.

---

## 1. Matriks Variabel Lingkungan (Environment Variables Matrix)

```env
# ==============================================================================
# SUPABASE CONFIGURATION (Wajib untuk DB, Auth, Realtime)
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # RAHASIA - BACKEND ONLY

# ==============================================================================
# CRON & WORKER AUTHENTICATION
# ==============================================================================
CRON_SECRET="generate-a-secure-random-32-char-string"

# ==============================================================================
# ADMINISTRATOR ALLOWLIST
# ==============================================================================
# Daftar email pengguna Google yang diizinkan mengoperasikan panel simulasi
ADMIN_ALLOWLIST_EMAILS="developer@gmail.com,lead.engineer@hackathon.id"

# ==============================================================================
# BMKG ENDPOINTS (Configurable Fallbacks)
# ==============================================================================
BMKG_AUTOGEMPA_URL="https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json"
BMKG_GEMPATERKINI_URL="https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json"
BMKG_GEMPADIRASAKAN_URL="https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json"
```

---

## 2. Ketergantungan Layanan & Status Resolusi

### A. Supabase Project
- **Status**: *Unresolved Dependency* (Harus dibuat sebelum tahap coding backend).
- **Langkah Pemenuhan**:
  1. Buat project baru di `supabase.com`.
  2. Salin URL dan API Keys ke `.env.local`.
  3. Eksekusi script SQL DDL dari `docs/04-technical-design/database-schema.md`.
  4. Aktifkan fitur *Realtime Replication* untuk tabel `earthquake_events` dan `simulation_events`.

### B. Google OAuth Credentials
- **Status**: *Unresolved Dependency* (Diperlukan untuk fitur login).
- **Langkah Pemenuhan**:
  1. Buka Google Cloud Console (`console.cloud.google.com`).
  2. Buat OAuth 2.0 Client ID jenis "Web Application".
  3. Tambahkan Authorized Redirect URI: `https://<supabase-project-id>.supabase.co/auth/v1/callback`.
  4. Masukkan Client ID dan Secret ke dashboard Supabase (Authentication -> Providers -> Google).

### C. OpenStreetMap CDN
- **Status**: ✅ *Resolved*.
- **Keterangan**: Beroperasi tanpa pendaftaran akun atau token, menggunakan URL template standar:
  `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.

---

## 3. Rencana Mitigasi Jika Kredensial Pihak Ketiga Terlambat
Jika pada jam-jam awal hackathon kredensial Google OAuth belum siap:
1. **Fallback Mock Admin Session**:
   Sediakan bypass flag pengujian lokal `ENABLE_DEV_ADMIN_BYPASS=true` di file `.env.local` khusus untuk lingkungan pengembangan lokal offline.
2. **Fallback Supabase Local**:
   Dapat menggunakan Supabase CLI lokal (`supabase start` via Docker) jika koneksi internet ke Supabase Cloud mengalami latensi tinggi.
