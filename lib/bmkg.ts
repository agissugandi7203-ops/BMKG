import crypto from 'crypto';
import { RawBMKGAutoResponse, RawBMKGListResponse, RawBMKGEarthquake, NormalizedEarthquake } from './types';

const BMKG_HEADERS = {
  'User-Agent': process.env.BMKG_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BMKG-Realtime-Monitor/1.0',
  'Accept': 'application/json',
};

export function normalizeBMKGRecord(raw: RawBMKGEarthquake, isLatest = false): NormalizedEarthquake {
  const [latStr, lngStr] = (raw.Coordinates || '0,0').split(',');
  const latitude = parseFloat(latStr ? latStr.trim() : '0');
  const longitude = parseFloat(lngStr ? lngStr.trim() : '0');

  const magnitude = parseFloat(raw.Magnitude || '0');

  const depthMatch = (raw.Kedalaman || '').match(/\d+/);
  const depth_km = depthMatch ? parseInt(depthMatch[0], 10) : 0;

  const shakemap_filename = raw.Shakemap || null;
  const shakemap_url = shakemap_filename 
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${shakemap_filename}`
    : null;

  const event_hash = crypto
    .createHash('md5')
    .update(`${raw.DateTime}_${latitude}_${longitude}_${magnitude}`)
    .digest('hex');

  return {
    id: event_hash,
    event_hash,
    date_time: raw.DateTime,
    date_str: raw.Tanggal,
    time_str: raw.Jam,
    latitude,
    longitude,
    coordinates_raw: raw.Coordinates,
    magnitude,
    depth_km,
    depth_raw: raw.Kedalaman,
    region: raw.Wilayah,
    potential: raw.Potensi || (isLatest ? 'Gempa dirasakan untuk diteruskan ke masyarakat' : 'Tidak berpotensi tsunami'),
    felt_mmi: raw.Dirasakan || null,
    shakemap_filename,
    shakemap_url,
    is_latest: isLatest,
    source: 'BMKG',
    created_at: new Date().toISOString(),
  };
}

export async function fetchLatestBMKG(): Promise<NormalizedEarthquake | null> {
  const url = process.env.BMKG_AUTOGEMPA_URL || 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
  try {
    const res = await fetch(url, { headers: BMKG_HEADERS, cache: 'no-store' });
    if (!res.ok) {
      console.error(`[BMKG] autogempa fetch failed HTTP ${res.status}`);
      return null;
    }
    const json: RawBMKGAutoResponse = await res.json();
    if (!json.Infogempa || !json.Infogempa.gempa) {
      return null;
    }
    return normalizeBMKGRecord(json.Infogempa.gempa, true);
  } catch (error: any) {
    console.error('[BMKG] Error fetching latest earthquake:', error.message);
    return null;
  }
}

export async function fetchRecentBMKG(): Promise<NormalizedEarthquake[]> {
  const url = process.env.BMKG_GEMPATERKINI_URL || 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
  try {
    const res = await fetch(url, { headers: BMKG_HEADERS, cache: 'no-store' });
    if (!res.ok) {
      console.error(`[BMKG] gempaterkini fetch failed HTTP ${res.status}`);
      return [];
    }
    const json: RawBMKGListResponse = await res.json();
    if (!json.Infogempa || !Array.isArray(json.Infogempa.gempa)) {
      return [];
    }
    return json.Infogempa.gempa.map((item) => normalizeBMKGRecord(item, false));
  } catch (error: any) {
    console.error('[BMKG] Error fetching recent earthquakes:', error.message);
    return [];
  }
}

export async function fetchFeltBMKG(): Promise<NormalizedEarthquake[]> {
  const url = process.env.BMKG_GEMPADIRASAKAN_URL || 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
  try {
    const res = await fetch(url, { headers: BMKG_HEADERS, cache: 'no-store' });
    if (!res.ok) {
      console.error(`[BMKG] gempadirasakan fetch failed HTTP ${res.status}`);
      return [];
    }
    const json: RawBMKGListResponse = await res.json();
    if (!json.Infogempa || !Array.isArray(json.Infogempa.gempa)) {
      return [];
    }
    return json.Infogempa.gempa.map((item) => normalizeBMKGRecord(item, false));
  } catch (error: any) {
    console.error('[BMKG] Error fetching felt earthquakes:', error.message);
    return [];
  }
}

export async function syncAllBMKG(): Promise<{
  latest: NormalizedEarthquake | null;
  recent: NormalizedEarthquake[];
  felt: NormalizedEarthquake[];
  totalSynced: number;
}> {
  const [latest, recent, felt] = await Promise.all([
    fetchLatestBMKG(),
    fetchRecentBMKG(),
    fetchFeltBMKG(),
  ]);

  const map = new Map<string, NormalizedEarthquake>();

  if (latest) {
    map.set(latest.event_hash, latest);
  }
  for (const item of recent) {
    if (!map.has(item.event_hash)) {
      map.set(item.event_hash, item);
    }
  }
  for (const item of felt) {
    if (map.has(item.event_hash)) {
      const existing = map.get(item.event_hash)!;
      if (item.felt_mmi && !existing.felt_mmi) {
        existing.felt_mmi = item.felt_mmi;
      }
    } else {
      map.set(item.event_hash, item);
    }
  }

  return {
    latest,
    recent,
    felt,
    totalSynced: map.size,
  };
}
