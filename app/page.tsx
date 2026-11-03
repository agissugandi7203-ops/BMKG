'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { NormalizedEarthquake, SimulationEvent } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { SimulationAlertBanner } from '@/components/SimulationAlertBanner';
import { EarthquakeHero } from '@/components/EarthquakeHero';
import { EarthquakeMap } from '@/components/EarthquakeMap';
import { EarthquakeList } from '@/components/EarthquakeList';
import { SimulationModal } from '@/components/SimulationModal';
import { playEmergencySiren, playNotificationChime } from '@/lib/audio';
import { ShieldCheck, Database, Radio } from 'lucide-react';

export default function HomePage() {
  const [latest, setLatest] = useState<NormalizedEarthquake | null>(null);
  const [events, setEvents] = useState<NormalizedEarthquake[]>([]);
  const [activeSimulation, setActiveSimulation] = useState<SimulationEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEarthquake | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStoppingSim, setIsStoppingSim] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const prevEventHashRef = useRef<string | null>(null);
  const prevSimIdRef = useRef<string | null>(null);

  // Fetch all earthquakes from unified internal API
  const fetchEarthquakes = useCallback(async () => {
    try {
      const res = await fetch('/api/earthquakes?limit=25');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
        if (json.data.length > 0) {
          const newLatest = json.data[0];
          setLatest(newLatest);

          // Check if a new earthquake arrived to trigger alert
          if (prevEventHashRef.current && prevEventHashRef.current !== newLatest.event_hash) {
            if (soundEnabled) {
              if (newLatest.magnitude >= 5.0) {
                playEmergencySiren();
              } else {
                playNotificationChime();
              }
            }
          }
          prevEventHashRef.current = newLatest.event_hash;
        }
        if (json.meta?.syncInfo?.lastSyncTime) {
          setLastSyncTime(json.meta.syncInfo.lastSyncTime);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching earthquakes:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [soundEnabled]);

  // Fetch simulation state
  const fetchSimulation = useCallback(async () => {
    try {
      const res = await fetch('/api/simulation');
      const json = await res.json();
      if (json.success) {
        const sim = json.data as SimulationEvent | null;
        setActiveSimulation(sim);

        // Sound trigger on new simulation start
        if (sim && sim.id !== prevSimIdRef.current) {
          if (soundEnabled) {
            playEmergencySiren();
          }
          prevSimIdRef.current = sim.id;
        } else if (!sim) {
          prevSimIdRef.current = null;
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching simulation status:', err);
    }
  }, [soundEnabled]);

  // Initial load & Polling interval
  useEffect(() => {
    fetchEarthquakes();
    fetchSimulation();

    // Auto-poll every 25 seconds for real-time freshness
    const interval = setInterval(() => {
      fetchEarthquakes();
      fetchSimulation();
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchEarthquakes, fetchSimulation]);

  // Manual Trigger Sync from BMKG
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-bmkg', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await fetchEarthquakes();
      }
    } catch (err) {
      console.error('[Dashboard] Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Start Simulation
  const handleStartSimulation = async (formData: any) => {
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveSimulation(json.data);
        if (soundEnabled) {
          playEmergencySiren();
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error starting simulation:', err);
    }
  };

  // Stop Simulation
  const handleStopSimulation = async () => {
    setIsStoppingSim(true);
    try {
      await fetch('/api/simulation', { method: 'DELETE' });
      setActiveSimulation(null);
      prevSimIdRef.current = null;
    } catch (err) {
      console.error('[Dashboard] Error stopping simulation:', err);
    } finally {
      setIsStoppingSim(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* 1. Global Navigation */}
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        activeSimulation={Boolean(activeSimulation)}
      />

      {/* 2. Simulation Banner (Shows when demo scenario is active) */}
      <SimulationAlertBanner
        simulation={activeSimulation}
        onStop={handleStopSimulation}
        isStopping={isStoppingSim}
      />

      {/* 3. Main Dashboard Layout */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-slate-300">Menghubungkan ke Pusat Data BMKG TEWS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Hero Card & Earthquake List (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <EarthquakeHero
                earthquake={latest}
                activeSimulation={activeSimulation}
              />

              <EarthquakeList
                events={events}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                selectedEvent={selectedEvent}
              />
            </div>

            {/* Right Column: Interactive Map (5 cols) */}
            <div className="lg:col-span-5 sticky top-20">
              <EarthquakeMap
                latest={latest}
                events={events}
                activeSimulation={activeSimulation}
                selectedEvent={selectedEvent}
              />

              {/* Status & Legend Card */}
              <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-300 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-400" />
                    Legenda Peta Seismik
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">Real-time Stream</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                    <span>Gempa Terkini / M ≥ 6.5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span>Gempa Sedang (M 5.0 - 6.4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span>Gempa Ringan (M &lt; 5.0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-700 border border-yellow-300 animate-ping" />
                    <span>Skenario Simulasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Platform Terpadu Monorepo • Data Resmi BMKG TEWS</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js App Router (Unified Fullstack)</span>
            <span>•</span>
            <span>Supabase Cloud Integration</span>
          </div>
        </div>
      </footer>

      {/* 5. Simulation Modal Dialog */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onStartSimulation={handleStartSimulation}
        isStarting={false}
      />
    </div>
  );
}
