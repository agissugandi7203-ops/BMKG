import { NextResponse } from 'next/server';
import { fetchLatestBMKG } from '@/lib/bmkg';
import { memoryStore } from '@/lib/memoryStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let latest = memoryStore.getLatest();

    if (!latest) {
      latest = await fetchLatestBMKG();
      if (latest) {
        memoryStore.setEvents([latest], latest);
      }
    }

    if (!latest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Data gempa bumi terbaru saat ini belum tersedia dari BMKG.',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: latest,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'BMKG TEWS',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Gagal mengambil gempa terbaru.',
        },
      },
      { status: 500 }
    );
  }
}
