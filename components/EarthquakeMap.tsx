'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { NormalizedEarthquake, SimulationEvent } from '@/lib/types';

interface EarthquakeMapProps {
  latest: NormalizedEarthquake | null;
  events: NormalizedEarthquake[];
  activeSimulation: SimulationEvent | null;
  selectedEvent: NormalizedEarthquake | null;
}

const DynamicEarthquakeMapInner = dynamic(
  () => import('./EarthquakeMapInner').then((mod) => mod.EarthquakeMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] sm:h-[520px] rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-red-500/40 animate-ping mb-4" />
        <p className="text-sm font-semibold text-slate-300">Memuat Peta Seismik Indonesia...</p>
        <p className="text-xs text-slate-500 mt-1">Mengunduh layer koordinat BMKG</p>
      </div>
    ),
  }
);

export function EarthquakeMap(props: EarthquakeMapProps) {
  return <DynamicEarthquakeMapInner {...props} />;
}
