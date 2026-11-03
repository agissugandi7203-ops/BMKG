# Dokumentasi Arsitektur & Spesifikasi Teknis Platform BMKG

Dokumentasi komprehensif untuk **Real-time Earthquake Monitoring & Alert Platform** terintegrasi data resmi BMKG (*Badan Meteorologi, Klimatologi, dan Geofisika*).

Dokumen ini disusun sebagai panduan teknis utama (*Single Source of Truth*) sebelum fase pengembangan dimulai pada hackathon 13 jam.

---

## 📑 Struktur Indeks Dokumentasi

```text
docs/
├── README.md                                         # Dokumen panduan & indeks utama (Anda sedang di sini)
├── 01-project-overview/                              # Gambaran Umum & Sasaran Produk
│   ├── project-context.md                            # Latar belakang masalah, visi produk, & target pengguna
│   ├── product-objectives.md                         # Sasaran inti, batasan non-goals, & definisi sukses MVP
│   └── scope-and-constraints.md                      # Batasan waktu 13 jam, pemetaan P0/P1/P2, & kendala teknis
│
├── 02-requirements/                                  # Spesifikasi Kebutuhan Sistem
│   ├── functional-requirements.md                    # Detail kebutuhan fungsional (FR-01 s/d FR-12)
│   ├── non-functional-requirements.md                # Standar performa (Proposed Targets), security, & reliability
│   ├── user-roles.md                                 # Matriks hak akses: Public, User, & Administrator
│   └── acceptance-criteria.md                        # Kriteria penerimaan MVP (AC-01 s/d AC-23)
│
├── 03-system-architecture/                           # Arsitektur Sistem & Diagram Alur
│   ├── architecture-overview.md                      # Diagram blok sistem & pola Fullstack Serverless Event-Driven
│   ├── frontend-architecture.md                      # Komponen React/Next.js, state realtime, & integrasi Leaflet
│   ├── backend-architecture.md                       # Serverless Route Handlers & worker sinkronisasi BMKG
│   ├── data-flow.md                                  # Alur data: Ingestion, Realtime Broadcast, & Simulasi
│   └── system-diagrams.md                            # Diagram visual Mermaid: Komponen, State Machine, & Alur
│
├── 04-technical-design/                              # Desain Teknis Terperinci
│   ├── technology-stack.md                           # Evaluasi & justifikasi stack (Next.js, Supabase, Leaflet, dll.)
│   ├── database-schema.md                            # Skema PostgreSQL DDL, Indexing, RLS, & Mermaid ERD
│   ├── api-design.md                                 # Spesifikasi Next.js Route Handlers internal (/api/*)
│   ├── authentication-and-authorization.md           # Google OAuth, sinkronisasi profil, & allowlist admin
│   └── notification-system.md                        # Arsitektur notifikasi: In-App, Web Audio Siren, & Web Notification
│
├── 05-integrations/                                  # Integrasi Layanan Eksternal
│   ├── integration-overview.md                       # Daftar layanan eksternal & pola penanganan error
│   ├── bmkg-integration.md                           # Analisis TEWS BMKG, skema JSON aktual, & normalizer
│   └── external-dependencies.md                      # Matriks variabel lingkungan (.env) & status kredensial
│
├── 06-application-design/                            # Desain Aplikasi & Pengalaman Pengguna
│   ├── sitemap.md                                    # Struktur rute URL aplikasi & perilaku responsif
│   ├── page-specifications.md                        # Rincian hierarki informasi & interaksi pada setiap halaman
│   └── user-flows.md                                 # Diagram alur interaksi pengguna (User Flows)
│
├── 07-development/                                   # Rencana Kerja & Strategi Pengujian
│   ├── implementation-roadmap.md                     # Rencana kerja hackathon 13 jam & strategi mitigasi risiko
│   ├── task-breakdown.md                             # Tiket tugas teknis (TASK-01 s/d TASK-13) terukur
│   └── testing-strategy.md                           # Kasus uji fungsional, uji edge-case, & runbook demo juri
│
└── 08-decisions-and-risks/                           # Keputusan Desain & Mitigasi Risiko
    ├── technical-decisions.md                        # Catatan Keputusan Arsitektur (ADR-01 s/d ADR-05)
    ├── assumptions.md                                # Asumsi teknis & operasional yang digunakan
    └── risks-and-limitations.md                      # Matriks risiko, keterbatasan sistem, & pertanyaan terbuka
```

---

## 🧭 Urutan Membaca yang Direkomendasikan (Reading Order)

Bagi pengembang (*developer*), analis produk (*product analyst*), dan penguji (*tester*), ikuti urutan membaca berikut untuk memperoleh pemahaman terstruktur:

1. **Memahami Konteks & Sasaran Produk**:
   - Mulai dari [`docs/01-project-overview/project-context.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/01-project-overview/project-context.md)
   - Lanjutkan ke [`docs/01-project-overview/product-objectives.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/01-project-overview/product-objectives.md) dan [`docs/01-project-overview/scope-and-constraints.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/01-project-overview/scope-and-constraints.md).
2. **Memahami Batasan Kebutuhan**:
   - Baca [`docs/02-requirements/functional-requirements.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/02-requirements/functional-requirements.md) dan [`docs/02-requirements/acceptance-criteria.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/02-requirements/acceptance-criteria.md).
3. **Memahami Arsitektur & Desain Data**:
   - Baca [`docs/03-system-architecture/architecture-overview.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/03-system-architecture/architecture-overview.md)
   - Pelajari skema database di [`docs/04-technical-design/database-schema.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/04-technical-design/database-schema.md)
   - Pelajari integrasi data riil BMKG di [`docs/05-integrations/bmkg-integration.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/05-integrations/bmkg-integration.md).
4. **Mempersiapkan Eksekusi Pengembangan**:
   - Pelajari pembagian fase di [`docs/07-development/implementation-roadmap.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/07-development/implementation-roadmap.md)
   - Ambil tiket pengerjaan di [`docs/07-development/task-breakdown.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/07-development/task-breakdown.md).
5. **Memahami Risiko & Protokol Demo**:
   - Tinjau mitigasi di [`docs/08-decisions-and-risks/risks-and-limitations.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/08-decisions-and-risks/risks-and-limitations.md)
   - Tinjau skenario demo 2 menit di [`docs/07-development/testing-strategy.md`](file:///c:/Users/arief/Downloads/Gaskan/BMKG/docs/07-development/testing-strategy.md).

---

## 📊 Status Kelengkapan Dokumentasi (Documentation Status)

| Bagian Dokumen | Jumlah Berkas | Status Validasi |
| :--- | :---: | :---: |
| `01-project-overview` | 3 dokumen | ✅ Lengkap & Terverifikasi |
| `02-requirements` | 4 dokumen | ✅ Lengkap & Terverifikasi |
| `03-system-architecture` | 5 dokumen | ✅ Lengkap & Terverifikasi |
| `04-technical-design` | 5 dokumen | ✅ Lengkap & Terverifikasi |
| `05-integrations` | 3 dokumen | ✅ Lengkap (Termasuk Uji Jaringan Aktual BMKG) |
| `06-application-design` | 3 dokumen | ✅ Lengkap & Terverifikasi |
| `07-development` | 3 dokumen | ✅ Lengkap (Estimasi Realistis 13 Jam) |
| `08-decisions-and-risks` | 3 dokumen | ✅ Lengkap (5 ADR + Analisis Risiko) |
| **Total Dokumentasi** | **29 dokumen** | **Siap Menjadi Sumber Kebenaran Tim Engineering** |
