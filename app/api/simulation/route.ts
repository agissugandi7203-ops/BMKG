import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SimulationSchema = z.object({
  scenario_name: z.string().default('Simulasi Gempa Megathrust'),
  magnitude: z.number().min(1.0).max(10.0),
  depth_km: z.number().min(1).max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  region: z.string().min(2),
  potential: z.string().default('BERPOTENSI TSUNAMI'),
});

export async function GET() {
  const activeSim = memoryStore.getActiveSimulation();
  return NextResponse.json({
    success: true,
    data: activeSim,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SimulationSchema.parse(body);

    const created = memoryStore.setSimulation({
      scenario_name: parsed.scenario_name,
      magnitude: parsed.magnitude,
      depth_km: parsed.depth_km,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      region: parsed.region,
      potential: parsed.potential,
    });

    return NextResponse.json({
      success: true,
      message: 'Simulasi gempa berhasil diaktifkan.',
      data: created,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Validasi skenario simulasi gagal.',
        },
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const stopped = memoryStore.stopSimulation();
  return NextResponse.json({
    success: true,
    message: stopped ? 'Simulasi aktif berhasil dihentikan.' : 'Tidak ada simulasi yang sedang berjalan.',
  });
}
