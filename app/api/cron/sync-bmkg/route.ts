import { NextRequest, NextResponse } from 'next/server';
import { syncAllBMKG } from '@/lib/bmkg';
import { memoryStore } from '@/lib/memoryStore';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('Authorization');
    const secretQuery = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'bmkg-secret-cron-key-2026';

    const isAuthorized = 
      authHeader === `Bearer ${expectedSecret}` || 
      secretQuery === expectedSecret ||
      process.env.NODE_ENV !== 'production';

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      );
    }

    const result = await syncAllBMKG();

    const allEvents = [
      ...(result.latest ? [result.latest] : []),
      ...result.recent,
    ];

    const uniqueMap = new Map();
    allEvents.forEach((e) => uniqueMap.set(e.event_hash, e));
    const uniqueEvents = Array.from(uniqueMap.values());

    memoryStore.setEvents(uniqueEvents, result.latest);

    if (supabase) {
      try {
        await supabase.from('earthquake_events').upsert(
          uniqueEvents.map((e) => ({
            event_hash: e.event_hash,
            date_time: e.date_time,
            date_str: e.date_str,
            time_str: e.time_str,
            latitude: e.latitude,
            longitude: e.longitude,
            coordinates_raw: e.coordinates_raw,
            magnitude: e.magnitude,
            depth_km: e.depth_km,
            depth_raw: e.depth_raw,
            region: e.region,
            potential: e.potential,
            felt_mmi: e.felt_mmi,
            shakemap_filename: e.shakemap_filename,
            shakemap_url: e.shakemap_url,
            is_latest: e.is_latest,
            source: 'BMKG',
          })),
          { onConflict: 'event_hash' }
        );
      } catch (dbErr: any) {
        console.warn('[Supabase Sync] Warning writing to database:', dbErr.message);
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Sinkronisasi data BMKG berhasil diselesaikan.',
      data: {
        totalSynced: uniqueEvents.length,
        hasLatest: Boolean(result.latest),
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    memoryStore.recordSyncFailure(error.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Sinkronisasi BMKG gagal.',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
