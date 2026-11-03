import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const syncInfo = memoryStore.getSyncInfo();
  const activeSim = memoryStore.getActiveSimulation();

  return NextResponse.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    backend: 'Unified Next.js Serverless Route Handlers',
    database: {
      provider: 'Supabase PostgreSQL',
      configured: isSupabaseConfigured,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set',
    },
    sync: {
      lastSyncTime: syncInfo.lastSyncTime,
      lastSyncStatus: syncInfo.lastSyncStatus,
      totalEventsCached: syncInfo.totalEvents,
    },
    simulation: {
      hasActiveSimulation: Boolean(activeSim),
      scenario: activeSim ? activeSim.scenario_name : null,
    },
  });
}
