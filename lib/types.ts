export interface RawBMKGEarthquake {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi?: string;
  Dirasakan?: string;
  Shakemap?: string;
}

export interface RawBMKGAutoResponse {
  Infogempa: {
    gempa: RawBMKGEarthquake;
  };
}

export interface RawBMKGListResponse {
  Infogempa: {
    gempa: RawBMKGEarthquake[];
  };
}

export interface NormalizedEarthquake {
  id: string;
  event_hash: string;
  date_time: string; // ISO 8601 UTC
  date_str: string;
  time_str: string;
  latitude: number;
  longitude: number;
  coordinates_raw: string;
  magnitude: number;
  depth_km: number;
  depth_raw: string;
  region: string;
  potential: string;
  felt_mmi: string | null;
  shakemap_filename: string | null;
  shakemap_url: string | null;
  is_latest: boolean;
  source: 'BMKG';
  created_at: string;
}

export interface SimulationEvent {
  id: string;
  scenario_name: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  region: string;
  potential: string;
  is_active: boolean;
  status: 'ACTIVE' | 'STOPPED';
  started_at: string;
  stopped_at?: string | null;
}
