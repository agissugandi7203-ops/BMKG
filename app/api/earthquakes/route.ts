import { NextRequest, NextResponse } from 'next/server';
import { syncAllBMKG } from '@/lib/bmkg';
import { memoryStore } from '@/lib/memoryStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const minMagnitudeParam = searchParams.get('min_magnitude');
    const typeParam = searchParams.get('type') || 'all';

    let events = memoryStore.getAllEvents();

    // If store is empty, perform initial sync on demand
    if (events.length === 0) {
      const syncResult = await syncAllBMKG();
      const combined = [
        ...(syncResult.latest ? [syncResult.latest] : []),
        ...syncResult.recent,
      ];
      const uniqueMap = new Map();
      combined.forEach((e) => uniqueMap.set(e.event_hash, e));
      events = Array.from(uniqueMap.values());
      memoryStore.setEvents(events, syncResult.latest);
    }

    // Filter by type
    if (typeParam === 'felt') {
      events = events.filter((e) => Boolean(e.felt_mmi));
    }

    // Filter by minimum magnitude
    if (minMagnitudeParam) {
      const minMag = parseFloat(minMagnitudeParam);
      if (!isNaN(minMag)) {
        events = events.filter((e) => e.magnitude >= minMag);
      }
    }

    // Apply limit
    const limit = limitParam ? parseInt(limitParam, 10) : 15;
    const paginatedEvents = events.slice(0, isNaN(limit) ? 15 : limit);

    return NextResponse.json({
      success: true,
      data: paginatedEvents,
      meta: {
        total: paginatedEvents.length,
        syncInfo: memoryStore.getSyncInfo(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Gagal memuat data gempa bumi.',
        },
      },
      { status: 500 }
    );
  }
}
