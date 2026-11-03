# Diagram Sistem (System Architecture Diagrams)

Koleksi diagram visual Mermaid yang memetakan keterhubungan modul, status siklus hidup data, dan model arsitektur sistem.

---

## 1. Diagram Komponen Modular (Component Diagram)

```mermaid
classDiagram
    class BMKGDataFeeds {
        +fetchAutoGempa()
        +fetchGempaTerkini()
        +fetchGempaDirasakan()
    }

    class SyncEngine {
        +syncAllFeeds()
        +validateSchema()
        +computeEventHash()
        +upsertEvents()
        +writeSyncLog()
    }

    class DatabaseLayer {
        +table earthquake_events
        +table simulation_events
        +table profiles
        +table system_logs
        +table user_preferences
    }

    class RealtimeBroadcaster {
        +channel earthquake_alerts
        +channel simulation_alerts
        +emitInsertEvent()
    }

    class PublicClient {
        +renderHeroBanner()
        +renderLeafletMap()
        +triggerAudioChime()
        +displayNotification()
    }

    class AdminConsole {
        +triggerSimulationScenario()
        +stopActiveSimulation()
        +viewSystemHealth()
    }

    BMKGDataFeeds --> SyncEngine : Raw JSON
    SyncEngine --> DatabaseLayer : Normalized Rows
    DatabaseLayer --> RealtimeBroadcaster : Postgres WAL CDC
    RealtimeBroadcaster --> PublicClient : WebSocket Payload
    AdminConsole --> DatabaseLayer : Isolated Simulation Rows
    RealtimeBroadcaster --> AdminConsole : Health Telemetry
```

---

## 2. Diagram Status Kejadian Gempa (State Diagram)

Diagram status siklus hidup kejadian gempa di dalam sistem:

```mermaid
stateDiagram-v2
    [*] --> Ingested: JSON Di-fetch dari BMKG
    Ingested --> Validated: Skema Zod Valid
    Ingested --> Discarded: Skema Corrupt / Field Kosong
    
    Validated --> ExistingEvent: event_hash Ditemukan di DB
    ExistingEvent --> Updated: Update parameter non-kritis (Dirasakan/Wilayah)
    
    Validated --> NewEvent: event_hash Belum Ada
    NewEvent --> Stored: INSERT ke earthquake_events
    Stored --> Broadcasted: Trigger Supabase Realtime CDC
    Broadcasted --> DisplayedOnClient: Tampil di Map & Hero Banner
    Broadcasted --> AudioTriggered: Sirine Berbunyi (Jika Audio Aktif)
    
    Updated --> [*]
    Discarded --> [*]
    AudioTriggered --> [*]
```

---

## 3. Diagram Status Skenario Simulasi (Simulation State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Draft: Admin mengisi Form Simulasi
    Draft --> Active: Admin klik "Jalankan Simulasi"
    Active --> EmittingAlert: Realtime broadcast ke seluruh client
    EmittingAlert --> DisplayingRedBanner: Banner simulasi merah aktif di browser
    DisplayingRedBanner --> Terminated: Admin klik "Hentikan Simulasi"
    Terminated --> RevertedToBMKG: Client menghapus banner simulasi
    RevertedToBMKG --> [*]
```
