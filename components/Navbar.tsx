'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw, Radio, ShieldAlert } from 'lucide-react';
import { unlockAudioContext } from '@/lib/audio';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onOpenSimulation: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  activeSimulation: boolean;
}

export function Navbar({
  soundEnabled,
  onToggleSound,
  onOpenSimulation,
  onManualSync,
  isSyncing,
  lastSyncTime,
  activeSimulation,
}: NavbarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAudioClick = async () => {
    if (!soundEnabled) {
      await unlockAudioContext();
      onToggleSound(true);
    } else {
      onToggleSound(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg sm:text-xl">
                BMKG MONITOR
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE TEWS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Peringatan Dini & Pemantauan Gempa Real-Time
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Alert Toggle */}
          <button
            onClick={handleAudioClick}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
            title={soundEnabled ? 'Sirine aktif saat gempa baru' : 'Klik untuk mengaktifkan sirine suara'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span className="hidden md:inline">Sirine: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden md:inline">Sirine: OFF</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            title="Tarik pembaruan terbaru dari BMKG"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden md:inline">Sinkronkan</span>
          </button>

          {/* Simulation Console Trigger */}
          <button
            onClick={onOpenSimulation}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              activeSimulation
                ? 'bg-red-600 text-white animate-pulse hover:bg-red-700'
                : 'bg-red-950/50 text-red-400 border border-red-800/50 hover:bg-red-900/40'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Simulasi Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
