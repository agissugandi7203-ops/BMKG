'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Play, CheckCircle } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSimulation: (data: any) => Promise<void>;
  isStarting: boolean;
}

const PRESETS = [
  {
    name: 'Megathrust Selat Sunda',
    magnitude: 7.4,
    depth_km: 10,
    latitude: -6.45,
    longitude: 105.12,
    region: 'Selat Sunda, 85 km Barat Daya Banten',
    potential: 'BERPOTENSI TSUNAMI',
  },
  {
    name: 'Sesar Lembang Aktif',
    magnitude: 6.5,
    depth_km: 8,
    latitude: -6.82,
    longitude: 107.61,
    region: 'Pusat gempa berada di darat 12 km Utara Kota Bandung',
    potential: 'Tidak berpotensi tsunami',
  },
  {
    name: 'Sesar Palu-Koro',
    magnitude: 7.5,
    depth_km: 10,
    latitude: -0.89,
    longitude: 119.87,
    region: 'Pusat gempa berada di laut 27 km Timur Laut Donggala-Sulteng',
    potential: 'BERPOTENSI TSUNAMI',
  },
];

export function SimulationModal({
  isOpen,
  onClose,
  onStartSimulation,
  isStarting,
}: SimulationModalProps) {
  const [formData, setFormData] = useState({
    scenario_name: PRESETS[0].name,
    magnitude: PRESETS[0].magnitude,
    depth_km: PRESETS[0].depth_km,
    latitude: PRESETS[0].latitude,
    longitude: PRESETS[0].longitude,
    region: PRESETS[0].region,
    potential: PRESETS[0].potential,
  });

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setFormData({
      scenario_name: preset.name,
      magnitude: preset.magnitude,
      depth_km: preset.depth_km,
      latitude: preset.latitude,
      longitude: preset.longitude,
      region: preset.region,
      potential: preset.potential,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onStartSimulation(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
            <ShieldAlert className="h-5 w-5" />
            <h3>Konsol Simulasi Gempa Demo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-200">
          <strong>Perhatian:</strong> Mode ini menyimulasikan penerimaan gempa bumi darurat secara realtime untuk keperluan presentasi dan pengujian sistem. Data simulasi terisolasi dari basis data BMKG resmi.
        </div>

        {/* Preset Buttons */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Pilih Skenario Cepat (Preset):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const active = formData.scenario_name === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl text-xs font-medium text-left border transition-all ${
                    active
                      ? 'bg-red-600/30 border-red-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="truncate">{p.name}</p>
                  <p className="text-[10px] text-amber-400 mt-0.5">M {p.magnitude}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Magnitudo (SR)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="9.9"
                value={formData.magnitude}
                onChange={(e) => setFormData({ ...formData, magnitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Kedalaman (km)
              </label>
              <input
                type="number"
                min="1"
                max="700"
                value={formData.depth_km}
                onChange={(e) => setFormData({ ...formData, depth_km: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Wilayah / Episentrum
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Latitude (Lintang)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Longitude (Bujur)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Status Peringatan Tsunami
            </label>
            <select
              value={formData.potential}
              onChange={(e) => setFormData({ ...formData, potential: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="BERPOTENSI TSUNAMI">BERPOTENSI TSUNAMI</option>
              <option value="Tidak berpotensi tsunami">Tidak berpotensi tsunami</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isStarting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-950 transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{isStarting ? 'Memproses...' : 'Jalankan Skenario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
