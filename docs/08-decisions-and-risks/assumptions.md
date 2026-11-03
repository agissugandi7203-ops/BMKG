# Asumsi Produk & Teknis (Assumptions)

Dokumen ini mendokumentasikan seluruh asumsi yang digunakan dalam perencanaan arsitektur, desain sistem, dan estimasi pengerjaan MVP hackathon.

---

## 1. Asumsi Teknis (Technical Assumptions)

1. **Ketersediaan Layanan BMKG**:
   - Diasumsikan domain `data.bmkg.go.id` tetap aktif dan dapat diakses melalui internet publik selama hackathon berlangsung.
   - Format respons JSON pada `autogempa.json`, `gempaterkini.json`, dan `gempadirasakan.json` tidak mengalami perubahan skema mendadak dari BMKG.
2. **Konektivitas Supabase & Realtime**:
   - Proyek Supabase Cloud diasumsikan berada pada region terdekat (misal: Singapore `ap-southeast-1`) untuk meminimalkan latensi jaringan menuju klien Indonesia (< 100 ms).
   - Fitur PostgreSQL Replication / Realtime Publication dapat diaktifkan pada tabel target tanpa kendala kuota paket gratis Supabase (*Free Tier*).
3. **Dukungan Browser Pengguna**:
   - Diasumsikan mayoritas pengguna membuka aplikasi menggunakan browser modern berbasis Chromium (Chrome, Edge), Safari (iOS/macOS), atau Firefox yang mendukung Web Audio API dan ES6+.
   - Pengguna bersedia melakukan satu kali klik/tap untuk mengizinkan pemutaran audio alarm (*browser autoplay permission*).

---

## 2. Asumsi Operasional & Demonstrasi (Operational & Demo Assumptions)

1. **Akses Akun Administrator**:
   - Penguji atau juri hackathon yang ingin menguji mode simulasi memiliki akun Google dan alamat email-nya telah dicantumkan di variabel lingkungan `ADMIN_ALLOWLIST_EMAILS`.
2. **Lingkungan Demonstrasi**:
   - Juri/penonton diasumsikan memiliki koneksi internet yang cukup stabil saat membuka URL demo di laptop atau smartphone.
   - Skenario simulasi yang dijalankan administrator tidak dimaksudkan untuk menyebarkan kepanikan publik, melainkan terisolasi penuh dengan penanda **"SIMULASI"** merah yang jelas di seluruh tampilan klien.
