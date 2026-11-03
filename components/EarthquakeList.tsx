'use client';

import React, { useState } from 'react';
import { NormalizedEarthquake } from '@/lib/types';
import { Activity, MapPin, ChevronRight, Filter } from 'lucide-react';

interface EarthquakeListProps {
  events: NormalizedEarthquake[];
  onSelectEvent: (event: NormalizedEarthquake) => void;
  selectedEvent: NormalizedEarthquake | null;
}

export function EarthquakeList({ events, onSelectEvent, selectedEvent }: EarthquakeListProps) {
  const [filterType, setFilterType] = useState<'all' | 'm5' | 'felt'>('all');

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'm5') return ev.magnitude >= 5.0;
    if (filterType === 'felt') return Boolean(ev.felt_mmi);
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-500" />
          <h3 className="font-bold text-base text-slate-100">
            Daftar Gempa Terkini
          </h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-medium">
            {filteredEvents.length} data
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterType === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('m5')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterType === 'm5' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            M 5.0+
          </button>
          <button
            onClick={() => setFilterType('felt')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterType === 'felt' ? 'bg-cyan-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dirasakan
          </button>
        </div>
      </div>

      {/* List Feed */}
      <div className="mt-4 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Tidak ada kejadian gempa pada kategori ini.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isSelected = selectedEvent?.event_hash === ev.event_hash;
            const isM5 = ev.magnitude >= 5.0;

            return (
              <div
                key={ev.event_hash}
                onClick={() => onSelectEvent(ev)}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-500/80 bg-red-950/20 shadow-md'
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Magnitude Pill */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-sm shadow ${
                    isM5
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {ev.magnitude.toFixed(1)}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-red-400 transition-colors">
                      {ev.region}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{ev.date_str} {ev.time_str}</span>
                      <span>•</span>
                      <span>Kedalaman {ev.depth_raw}</span>
                      {ev.felt_mmi && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold truncate max-w-[150px]">
                            MMI: {ev.felt_mmi}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 pl-2 text-slate-500 group-hover:text-slate-300">
                  <MapPin className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
