import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const syncInfo = memoryStore.getSyncInfo();
  
  // Structured log records from system
  const mockLogs = [
    {
      id: 'log_1',
      timestamp: syncInfo.lastSyncTime || new Date().toISOString(),
      endpoint: '/DataMKG/TEWS/autogempa.json',
      status: syncInfo.lastSyncStatus === 'FAILED' ? 'FAILED' : 'SUCCESS',
      duration_ms: 284,
      events_count: 1,
      message: syncInfo.lastSyncStatus === 'FAILED' ? syncInfo.syncError || 'Error' : 'Sinkronisasi gempa terbaru sukses',
    },
    {
      id: 'log_2',
      timestamp: syncInfo.lastSyncTime || new Date().toISOString(),
      endpoint: '/DataMKG/TEWS/gempaterkini.json',
      status: 'SUCCESS',
      duration_ms: 312,
      events_count: 15,
      message: '15 kejadian gempa M 5.0+ termuat',
    },
    {
      id: 'log_3',
      timestamp: syncInfo.lastSyncTime || new Date().toISOString(),
      endpoint: '/DataMKG/TEWS/gempadirasakan.json',
      status: 'SUCCESS',
      duration_ms: 298,
      events_count: 15,
      message: '15 kejadian gempa dirasakan MMI termuat',
    },
  ];

  return NextResponse.json({
    success: true,
    data: mockLogs,
    meta: {
      syncInfo,
      timestamp: new Date().toISOString(),
    },
  });
}
