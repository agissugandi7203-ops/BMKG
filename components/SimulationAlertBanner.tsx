'use client';

import React from 'react';
import { AlertTriangle, StopCircle } from 'lucide-react';
import { SimulationEvent } from '@/lib/types';

interface SimulationAlertBannerProps {
  simulation: SimulationEvent | null;
  onStop: () => void;
  isStopping: boolean;
}

export function SimulationAlertBanner({
  simulation,
  onStop,
  isStopping,
}: SimulationAlertBannerProps) {
  if (!simulation || !simulation.is_active) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white shadow-xl border-b border-red-500/50">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2 rounded-lg bg-black/20 text-yellow-300">
            <AlertTriangle className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold uppercase tracking-wide text-xs bg-yellow-400 text-slate-950 px-2 py-0.5 rounded">
                MODE SIMULASI DEMO
              </span>
              <span className="text-sm font-bold text-white">
                {simulation.scenario_name} (M {simulation.magnitude.toFixed(1)})
              </span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">
              Wilayah: {simulation.region} • Kedalaman: {simulation.depth_km} km • Status: {simulation.potential} (Bukan kejadian nyata)
            </p>
          </div>
        </div>

        <button
          onClick={onStop}
          disabled={isStopping}
          className="flex items-center gap-1.5 bg-slate-950 text-white hover:bg-slate-900 border border-red-300/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50 shrink-0"
        >
          <StopCircle className="h-4 w-4 text-red-400" />
          <span>Hentikan Simulasi</span>
        </button>
      </div>
    </div>
  );
}
