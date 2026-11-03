# Arsitektur Sistem Tingkat Tinggi (High-Level Architecture Overview)

## 1. Filosofi Desain & Pola Arsitektur
Untuk memenuhi batas waktu hackathon **13 jam** dengan keandalan operasional tinggi, sistem mengadopsi pola **Fullstack Monorepo Serverless Event-Driven Architecture**.

Pola ini mengeliminasi kebutuhan orkestrasi server backend mandiri, cluster WebSocket manual, atau konfigurasi container Kubernetes yang rumit, sembari mempertahankan standar pemisahan tanggung jawab (*separation of concerns*) yang bersih.

---

## 2. Diagram Blok Komponen Sistem

```mermaid
graph TB
    subgraph DataProvider["1. External Data Layer"]
        BMKG_API["BMKG Open Data Server<br/>• autogempa.json<br/>• gempaterkini.json<br/>• gempadirasakan.json"]
        OSM_Tiles["OpenStreetMap CDN<br/>• Map Tiles Layer"]
    end

    subgraph HostingVercel["2. Vercel Cloud Platform (Next.js App Router)"]
        subgraph FrontendLayer["Frontend Client Application"]
            UI_Home["Public Monitoring Dashboard (/)"]
            UI_Map["Leaflet GIS Map Component"]
            UI_Sound["Web Audio Alert Engine"]
            UI_Admin["Admin Simulation Console (/admin)"]
        end

        subgraph BackendLayer["Serverless Backend Handlers"]
            API_Cron["GET /api/cron/sync-bmkg<br/>(Scheduled Poller)"]
            API_Sim["POST /api/simulation<br/>(Admin Action)"]
            API_Public["GET /api/earthquakes<br/>(Public REST Query)"]
            AdminAuthGuard["Server Auth Middleware<br/>(RBAC & Allowlist Check)"]
        end
    end

    subgraph SupabasePlatform["3. Supabase Cloud Infrastructure"]
        SupaCron["pg_cron / HTTP Hook<br/>(Triggers sync every 60s)"]
        SupaAuth["Supabase Auth<br/>(Google OAuth 2.0)"]
        
        subgraph PostgresEngine["PostgreSQL Database & RLS"]
            T_Earthquake[("earthquake_events<br/>[Official BMKG Data]")]
            T_Simulation[("simulation_events<br/>[Demo Scenarios]")]
            T_Profiles[("profiles & roles")]
            T_Logs[("system_logs")]
        end

        SupaRealtime["Supabase Realtime Hub<br/>(Postgres WAL CDC & Broadcast)"]
    end

    %% External polling
    SupaCron -->|HTTP POST Request| API_Cron
    API_Cron -->|Fetch JSON (60s)| BMKG_API
    API_Cron -->|Upsert Validated Events| T_Earthquake
    API_Cron -->|Write Sync Logs| T_Logs

    %% Admin & Auth
    UI_Admin --> AdminAuthGuard
    AdminAuthGuard -->|Verify Session & Role| SupaAuth
    UI_Admin -->|Trigger Simulation Scenario| API_Sim
    API_Sim -->|Insert Isolated Scenario| T_Simulation

    %% Realtime Data Flow
    T_Earthquake -.->|WAL CDC Trigger| SupaRealtime
    T_Simulation -.->|WAL CDC Trigger| SupaRealtime
    SupaRealtime ==>|WebSocket Push Channels| UI_Home
    SupaRealtime ==>|WebSocket Push Channels| UI_Admin

    %% Client Interactions
    UI_Home -->|Render Map Markers| UI_Map
    OSM_Tiles -.->|Tile Images| UI_Map
    UI_Home -->|Trigger Chime on Event| UI_Sound
    UI_Home -->|Initial SSR / REST Fallback| API_Public
```

---

## 3. Tanggung Jawab Komponen Utama

### A. Lapisan Klien (Frontend Layer)
- Dibangun dengan **Next.js App Router (React 18/19, TypeScript, Tailwind CSS, shadcn/ui)**.
- Bertanggung jawab merender antarmuka monitoring, peta spasial Leaflet, modal peringatan bahaya, dan antarmuka kontrol simulasi.
- Mengelola state realtime via **Supabase Realtime Client** (WebSocket) dan state audio via browser Web Audio API.

### B. Lapisan Backend (Serverless Route Handlers)
- Dijalankan sebagai Next.js Route Handlers di Vercel Serverless Functions.
- **`/api/cron/sync-bmkg`**: Mengonsumsi data BMKG, memvalidasi skema dengan Zod, menghitung hash unik kejadian, dan menyimpan ke PostgreSQL.
- **`/api/simulation`**: Memvalidasi identitas admin via cookie sesi Supabase, memverifikasi email terhadap allowlist, dan menyimpan record simulasi.

### C. Lapisan Basis Data & Realtime (Supabase Platform)
- **PostgreSQL**: Penyimpanan relasional transaksional dengan constraint integritas data dan Row Level Security (RLS).
- **Supabase Realtime**: Memanfaatkan Logical Replication / WAL (*Write-Ahead Logging*) PostgreSQL untuk menyiarkan perubahan data ke seluruh browser terhubung secara instan.
- **Supabase Auth**: Mengelola identitas pengguna, token JWT, dan pertukaran kode Google OAuth secara aman.
