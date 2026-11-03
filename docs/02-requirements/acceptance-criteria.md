# Kriteria Penerimaan MVP (Acceptance Criteria)

Kumpulan kriteria pengujian untuk menyatakan sistem siap dinilai oleh juri dan dirilis ke lingkungan demonstrasi publik.

---

## Daftar Periksa Kriteria Penerimaan (Checklist)

### 1. Aksesibilitas Publik & Deployment
- [ ] **AC-01**: Aplikasi dapat diakses secara publik melalui URL internet (misal: `https://bmkg-monitor.vercel.app`) tanpa eror 500 saat pertama kali dimuat.
- [ ] **AC-02**: Antarmuka responsif dan dapat dioperasikan dengan baik pada layar smartphone dan laptop/desktop.

### 2. Integrasi Data Asli BMKG
- [ ] **AC-03**: Backend berhasil mengonsumsi data dari endpoint BMKG:
  - `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
  - `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
  - `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
- [ ] **AC-04**: Atribusi sumber informasi dinyatakan secara eksplisit dengan teks: *"Sumber Data Resmi: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)"*.
- [ ] **AC-05**: Informasi gempa menampilkan waktu kejadian dalam WIB, magnitudo, kedalaman, wilayah episenter, dan status potensi tsunami / dirasakan secara benar.
- [ ] **AC-06**: Gambar Shakemap BMKG dapat ditampilkan apabila field `Shakemap` tersedia dalam data BMKG.

### 3. Pencegahan Duplikasi & Penyimpanan Data
- [ ] **AC-07**: Backend tidak menghasilkan duplikasi baris data untuk kejadian gempa yang sama meskipun cron berjalan berulang kali (terverifikasi via `UNIQUE constraint` pada `event_hash`).
- [ ] **AC-08**: Waktu sinkronisasi terakhir diperbarui dan ditampilkan kepada pengguna sebagai indikator kesegaran data (*data freshness*).

### 4. Pembaruan Realtime & Alarm Audio
- [ ] **AC-09**: Saat data baru ditambahkan ke database (atau simulasi dipicu), UI dashboard memperbarui status secara otomatis tanpa reload halaman browser.
- [ ] **AC-10**: Pengguna dapat mengaktifkan audio alert dengan mengklik tombol/toggle di UI.
- [ ] **AC-11**: Ketika sinyal gempa baru diterima dan audio aktif, suara sirine peringatan terdengar jelas dari speaker perangkat.
- [ ] **AC-12**: Pengguna dapat mematikan (mute) alarm suara kapan saja dengan satu klik.

### 5. Peta Spasial Episentrum
- [ ] **AC-13**: Peta Leaflet memuat peta Indonesia dengan penanda (marker) pada koordinat lintang dan bujur gempa.
- [ ] **AC-14**: Marker dapat diklik untuk menampilkan popup berisi ringkasan parameter gempa.
- [ ] **AC-15**: Marker gempa terkini memiliki aksen visual khusus (misal: lingkaran berdenyut atau warna merah kontras).

### 6. Autentikasi & Kontrol Administrator
- [ ] **AC-16**: Pengguna dapat melakukan login menggunakan akun Google via Supabase OAuth.
- [ ] **AC-17**: Pengguna dengan email di luar allowlist tidak dapat membuka halaman `/admin/*` dan dialihkan ke beranda.
- [ ] **AC-18**: Administrator terdaftar dapat membuka halaman form `/admin/simulation`.

### 7. Isolasi Mode Simulasi
- [ ] **AC-19**: Administrator dapat mengisi form simulasi dan menekan tombol "Jalankan Simulasi".
- [ ] **AC-20**: Saat simulasi berjalan, dashboard menampilkan banner peringatan berwarna merah bertuliskan **"PERINGATAN SIMULASI (BUKAN DATA NYATA)"**.
- [ ] **AC-21**: Data simulasi tercatat di tabel `simulation_events` dan TIDAK tercampur ke dalam tabel data asli `earthquake_events`.
- [ ] **AC-22**: Administrator dapat menghentikan simulasi, dan tampilan dashboard kembali normal ke data BMKG resmi.

### 8. Penanganan Gangguan Jaringan (Resilience)
- [ ] **AC-23**: Jika jaringan ke BMKG terputus, sistem tetap menampilkan data terakhir yang ada di database disertai status peringatan koneksi terganggu.
