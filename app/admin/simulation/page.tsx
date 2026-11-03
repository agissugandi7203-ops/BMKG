'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  StopCircle,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Waves,
  ShieldAlert,
} from 'lucide-react';
import { SimulationEvent } from '@/lib/types';
import { playEmergencySiren } from '@/lib/audio';

const PRESETS = [
  {
    name: 'Megathrust Selat Sunda',
    magnitude: 8.2,
    depth_km: 10,
    latitude: -6.45,
    longitude: 105.12,
    region: 'Selat Sunda, 85 km Barat Daya Banten',
    potential: 'BERPOTENSI TSUNAMI',
  },
  {
    name: 'Aktivitas Sesar Lembang',
    magnitude: 6.8,
    depth_km: 10,
    latitude: -6.81,
    longitude: 107.61,
    region: 'Sesar Lembang, 12 km Utara Kota Bandung',
    potential: 'Tidak berpotensi tsunami',
  },
  {
    name: 'Subduksi Selatan Jawa',
    magnitude: 7.4,
    depth_km: 25,
    latitude: -8.32,
    longitude: 107.89,
    region: 'Samudera Hindia, 115 km Barat Daya Cilacap',
    potential: 'BERPOTENSI TSUNAMI',
  },
  {
    name: 'Sesar Aktif Palu Koro',
    magnitude: 7.5,
    depth_km: 10,
    latitude: -0.89,
    longitude: 119.85,
    region: 'Teluk Palu, 22 km Barat Laut Kota Palu',
    potential: 'BERPOTENSI TSUNAMI',
  },
];

export default function AdminSimulationPage() {
  const [scenarioName, setScenarioName] = useState('Megathrust Selat Sunda');
  const [magnitude, setMagnitude] = useState<number>(8.2);
  const [depthKm, setDepthKm] = useState<number>(10);
  const [latitude, setLatitude] = useState<number>(-6.45);
  const [longitude, setLongitude] = useState<number>(105.12);
  const [region, setRegion] = useState('Selat Sunda, 85 km Barat Daya Banten');
  const [potential, setPotential] = useState('BERPOTENSI TSUNAMI');

  const [activeSimulation, setActiveSimulation] = useState<SimulationEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSimulationState = async () => {
    try {
      const res = await fetch('/api/simulation');
      const json = await res.json();
      if (json.success) {
        setActiveSimulation(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSimulationState();
  }, []);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setScenarioName(preset.name);
    setMagnitude(preset.magnitude);
    setDepthKm(preset.depth_km);
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setRegion(preset.region);
    setPotential(preset.potential);
  };

  const handleStartSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_name: scenarioName,
          magnitude,
          depth_km: depthKm,
          latitude,
          longitude,
          region,
          potential,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActiveSimulation(json.data);
        setMessage({
          text: `Skenario simulasi "${scenarioName}" berhasil diaktifkan! Buka halaman utama untuk melihat banner peringatan.`,
          type: 'success',
        });
        playEmergencySiren();
        fetchSimulationState();
      } else {
        setMessage({ text: json.error?.message || 'Gagal memulai simulasi', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Terjadi kesalahan sistem', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setActiveSimulation(null);
        setMessage({ text: 'Simulasi telah dihentikan. Sistem kembali ke data resmi BMKG.', type: 'success' });
        fetchSimulationState();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Gagal menghentikan simulasi', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Active Simulation */}
      {activeSimulation && activeSimulation.is_active && (
        <div className="p-4 rounded-2xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-yellow-300 shrink-0" />
            <div>
              <span className="font-extrabold uppercase text-xs tracking-wider bg-black/40 px-2.5 py-0.5 rounded text-yellow-300">
                Simulasi Sedang Berjalan
              </span>
              <p className="text-sm font-bold mt-1">
                {activeSimulation.scenario_name}: M {activeSimulation.magnitude} ({activeSimulation.region})
              </p>
            </div>
          </div>
          <button
            onClick={handleStopSimulation}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-black/70 hover:bg-black text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <StopCircle className="w-4 h-4 text-red-400" />
            <span>Hentikan Simulasi Sekarang</span>
          </button>
        </div>
      )}

      {/* Preset Buttons for Easy Demo */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Skenario Uji Cepat (Hackathon Presets)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 text-left rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {preset.name}
                </span>
                <span className="font-black text-orange-400">M {preset.magnitude}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{preset.region}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Parameter Skenario Gempa</h2>
            <p className="text-xs text-slate-400">
              Data simulasi disiarkan secara terisolasi tanpa mencampuri basis data rekaman asli BMKG.
            </p>
          </div>
          {activeSimulation && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              Aktif
            </span>
          )}
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium mb-5 flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleStartSimulation} className="space-y-4 text-xs">
          {/* Scenario Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Skenario</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Magnitude Slider & Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Magnitudo (SR)</label>
                <span className="font-extrabold text-red-400 text-sm">M {magnitude.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="9.5"
                step="0.1"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kedalaman (km)</label>
              <input
                type="number"
                min="1"
                max="700"
                value={depthKm}
                onChange={(e) => setDepthKm(parseInt(e.target.value, 10))}
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lintang (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bujur (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi Wilayah Episentrum</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Tsunami Status */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Potensi Tsunami</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="potential"
                  value="BERPOTENSI TSUNAMI"
                  checked={potential === 'BERPOTENSI TSUNAMI'}
                  onChange={(e) => setPotential(e.target.value)}
                  className="accent-red-500"
                />
                <span className="text-red-400 font-bold">BERPOTENSI TSUNAMI</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="potential"
                  value="Tidak berpotensi tsunami"
                  checked={potential === 'Tidak berpotensi tsunami'}
                  onChange={(e) => setPotential(e.target.value)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-300">Tidak Berpotensi Tsunami</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-102 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Jalankan Simulasi Gempa'}</span>
            </button>

            {activeSimulation && (
              <button
                type="button"
                onClick={handleStopSimulation}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <StopCircle className="w-4 h-4 text-red-400" />
                <span>Hentikan Simulasi</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
