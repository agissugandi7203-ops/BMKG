-- ==============================================================================
-- SKEMA BASIS DATA SUPABASE POSTGRESQL UNTUK BMKG REAL-TIME MONITOR
-- Project URL: https://uxcrswziszmzpgphyujo.supabase.co
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL EARTHQUAKE_EVENTS (Data Resmi BMKG)
CREATE TABLE IF NOT EXISTS public.earthquake_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_hash TEXT UNIQUE NOT NULL, -- Kunci deterministik md5 pencegah duplikasi
    date_time TIMESTAMPTZ NOT NULL,
    date_str TEXT NOT NULL,
    time_str TEXT NOT NULL,
    latitude NUMERIC(6, 3) NOT NULL,
    longitude NUMERIC(6, 3) NOT NULL,
    coordinates_raw TEXT NOT NULL,
    magnitude NUMERIC(3, 1) NOT NULL,
    depth_km INTEGER NOT NULL,
    depth_raw TEXT NOT NULL,
    region TEXT NOT NULL,
    potential TEXT,
    felt_mmi TEXT,
    shakemap_filename TEXT,
    shakemap_url TEXT,
    is_latest BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL DEFAULT 'BMKG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing untuk kecepatan pencarian
CREATE INDEX IF NOT EXISTS idx_earthquake_date_time ON public.earthquake_events(date_time DESC);
CREATE INDEX IF NOT EXISTS idx_earthquake_magnitude ON public.earthquake_events(magnitude DESC);
CREATE INDEX IF NOT EXISTS idx_earthquake_is_latest ON public.earthquake_events(is_latest) WHERE is_latest = true;

-- 3. TABEL SIMULATION_EVENTS (Data Simulasi Demo Terisolasi)
CREATE TABLE IF NOT EXISTS public.simulation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_name TEXT NOT NULL DEFAULT 'Demo Gempa Hackathon',
    magnitude NUMERIC(3, 1) NOT NULL,
    depth_km INTEGER NOT NULL,
    latitude NUMERIC(6, 3) NOT NULL,
    longitude NUMERIC(6, 3) NOT NULL,
    region TEXT NOT NULL,
    potential TEXT NOT NULL DEFAULT 'Berpotensi Tsunami',
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'STOPPED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    stopped_at TIMESTAMPTZ
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.earthquake_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_events ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Semua orang (anonim & login) dapat membaca data
DROP POLICY IF EXISTS "Public earthquake view" ON public.earthquake_events;
CREATE POLICY "Public earthquake view" ON public.earthquake_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public simulation view" ON public.simulation_events;
CREATE POLICY "Public simulation view" ON public.simulation_events FOR SELECT USING (true);

-- 6. Enable Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.earthquake_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulation_events;
