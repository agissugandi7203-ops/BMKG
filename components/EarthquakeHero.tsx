'use client';

import React, { useState } from 'react';
import { NormalizedEarthquake, SimulationEvent } from '@/lib/types';
import { AlertCircle, Waves, Compass, Clock, MapPin, Share2, Check, Image as ImageIcon, X } from 'lucide-react';

interface EarthquakeHeroProps {
  earthquake: NormalizedEarthquake | null;
  activeSimulation: SimulationEvent | null;
}

export function EarthquakeHero({ earthquake, activeSimulation }: EarthquakeHeroProps) {
  const [copied, setCopied] = useState(false);
  const [showShakemapModal, setShowShakemapModal] = useState(false);

  // If simulation is active, show simulation parameters on hero card!
  const isSim = Boolean(activeSimulation);
  const mag = isSim ? activeSimulation!.magnitude : (earthquake?.magnitude ?? 0);
  const region = isSim ? activeSimulation!.region : (earthquake?.region ?? 'Memuat informasi...');
  const depth = isSim ? `${activeSimulation!.depth_km} km` : (earthquake?.depth_raw ?? '-');
  const coordinates = isSim ? `${activeSimulation!.latitude}, ${activeSimulation!.longitude}` : (earthquake?.coordinates_raw ?? '-');
  const potential = isSim ? activeSimulation!.potential : (earthquake?.potential ?? 'Menunggu data');
  const timeStr = isSim ? 'Baru Saja (Simulasi)' : `${earthquake?.date_str ?? ''} - ${earthquake?.time_str ?? ''}`;
  const felt = isSim ? 'Wilayah terdampak simulasi' : (earthquake?.felt_mmi || null);
  const shakemapUrl = !isSim ? earthquake?.shakemap_url : null;

  const getMagnitudeBadgeColor = (m: number) => {
    if (m >= 6.5) return 'from-red-600 to-rose-700 text-white shadow-red-900/50';
    if (m >= 5.0) return 'from-amber-500 to-orange-600 text-white shadow-orange-900/50';
    return 'from-yellow-400 to-amber-500 text-slate-950 shadow-yellow-900/50';
  };

  const handleCopyShare = () => {
    if (typeof window === 'undefined') return;
    const shareText = `⚠️ INFO GEMPA BMKG\nMagnitudo: M ${mag.toFixed(1)}\nWilayah: ${region}\nKedalaman: ${depth}\nKoordinat: ${coordinates}\nPotensi: ${potential}\nWaktu: ${timeStr}\nSumber: BMKG TEWS`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${
      isSim ? 'border-red-500/70 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950' : 'border-slate-800 bg-slate-900/90'
    } p-6 shadow-2xl backdrop-blur-md`}>
      {/* Top Header Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          {isSim ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/40 animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              SIMULASI AKTIF
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
              <AlertCircle className="h-3.5 w-3.5" />
              GEMPA BUMI TERKINI
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            Sumber Data: <strong className="text-slate-200">BMKG Indonesia</strong>
          </span>
        </div>

        <button
          onClick={handleCopyShare}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Bagikan Info</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Magnitude Block (Left) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Magnitudo
          </span>
          <div className={`flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-tr ${getMagnitudeBadgeColor(mag)} shadow-lg`}>
            <span className="text-4xl sm:text-5xl font-black tracking-tighter">
              {mag > 0 ? mag.toFixed(1) : '-'}
            </span>
          </div>
          <span className="mt-3 text-xs font-medium text-slate-300">
            Skala Richter (SR)
          </span>
        </div>

        {/* Earthquake Details (Right) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start gap-2 text-slate-200">
              <MapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                {region}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 pl-7">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Compass className="h-3.5 w-3.5 text-blue-400" />
                <span>Kedalaman</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">{depth}</p>
            </div>

            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>Koordinat</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white truncate">{coordinates}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-950/40 border border-slate-800 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Waves className="h-3.5 w-3.5 text-amber-400" />
                <span>Potensi Tsunami</span>
              </div>
              <p className={`text-xs sm:text-sm font-bold truncate ${
                potential.toLowerCase().includes('berpotensi') ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {potential}
              </p>
            </div>
          </div>

          {/* Felt MMI & Shakemap Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            {felt ? (
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-amber-400">Dirasakan: </span>
                <span>{felt}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Parameter guncangan dirasakan belum dilaporkan.
              </div>
            )}

            {shakemapUrl && (
              <button
                onClick={() => setShowShakemapModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-800/40"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Lihat Shakemap BMKG</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shakemap Lightbox Modal */}
      {showShakemapModal && shakemapUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200">
                Peta Guncangan (Shakemap) Resmi BMKG
              </h3>
              <button
                onClick={() => setShowShakemapModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shakemapUrl}
                alt="Shakemap BMKG"
                className="max-h-[70vh] rounded-xl object-contain border border-slate-800"
              />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Menampilkan skala intensitas guncangan Modified Mercalli Intensity (MMI).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
