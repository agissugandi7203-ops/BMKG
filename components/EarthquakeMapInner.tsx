'use client';

import React, { useEffect, useRef } from 'react';
import { NormalizedEarthquake, SimulationEvent } from '@/lib/types';
import L from 'leaflet';

interface EarthquakeMapInnerProps {
  latest: NormalizedEarthquake | null;
  events: NormalizedEarthquake[];
  activeSimulation: SimulationEvent | null;
  selectedEvent: NormalizedEarthquake | null;
}

export function EarthquakeMapInner({
  latest,
  events,
  activeSimulation,
  selectedEvent,
}: EarthquakeMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.5, 118.0], // Center of Indonesia
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: true,
      });

      // Add Dark OpenStreetMap CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Render Secondary Past Earthquakes (Past 15)
    events.forEach((ev) => {
      if (isNaN(ev.latitude) || isNaN(ev.longitude)) return;

      const isCurrentLatest = latest && latest.event_hash === ev.event_hash;
      if (isCurrentLatest && !activeSimulation) return; // Will be rendered with special pulse marker

      const color = ev.magnitude >= 5.0 ? '#f97316' : '#eab308';
      const radius = Math.max(6, Math.min(14, ev.magnitude * 2));

      const circleMarker = L.circleMarker([ev.latitude, ev.longitude], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      circleMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #dc2626;">
            M ${ev.magnitude.toFixed(1)} - BMKG
          </div>
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">
            ${ev.region}
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.4;">
            <strong>Kedalaman:</strong> ${ev.depth_raw}<br/>
            <strong>Waktu:</strong> ${ev.date_str} ${ev.time_str}<br/>
            <strong>Koordinat:</strong> ${ev.coordinates_raw}
          </div>
        </div>
      `);

      markersLayer.addLayer(circleMarker);
    });

    // 2. Render Epicenter of Latest BMKG Earthquake (if not simulation)
    if (latest && !activeSimulation && !isNaN(latest.latitude) && !isNaN(latest.longitude)) {
      const pulseDiv = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #ef4444; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background-color: #dc2626; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(220, 38, 38, 0.8);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const latestMarker = L.marker([latest.latitude, latest.longitude], { icon: pulseDiv });
      latestMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px; color: #0f172a;">
          <div style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; margin-bottom: 4px;">
            GEMPA TERBARU
          </div>
          <div style="font-weight: 800; font-size: 15px; color: #dc2626;">
            M ${latest.magnitude.toFixed(1)}
          </div>
          <div style="font-size: 12px; font-weight: 600; margin: 4px 0;">
            ${latest.region}
          </div>
          <div style="font-size: 11px; color: #475569;">
            Kedalaman: ${latest.depth_raw} • ${latest.potential}
          </div>
        </div>
      `);
      markersLayer.addLayer(latestMarker);
    }

    // 3. Render Simulation Epicenter (if active)
    if (activeSimulation) {
      const simDiv = L.divIcon({
        className: 'custom-sim-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: #dc2626; opacity: 0.6; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 50%; background-color: #991b1b; border: 2.5px solid #facc15; box-shadow: 0 0 15px rgba(250, 204, 21, 0.9);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const simMarker = L.marker([activeSimulation.latitude, activeSimulation.longitude], { icon: simDiv });
      simMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; color: #0f172a;">
          <div style="background: #eab308; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 900; display: inline-block; margin-bottom: 4px;">
            ⚠️ EPISENTRUM SIMULASI
          </div>
          <div style="font-weight: 800; font-size: 15px; color: #dc2626;">
            M ${activeSimulation.magnitude.toFixed(1)} - ${activeSimulation.scenario_name}
          </div>
          <div style="font-size: 12px; font-weight: 600; margin: 4px 0;">
            ${activeSimulation.region}
          </div>
          <div style="font-size: 11px; color: #dc2626; font-weight: bold;">
            ${activeSimulation.potential}
          </div>
        </div>
      `);
      markersLayer.addLayer(simMarker);

      // Pan to simulation location
      map.setView([activeSimulation.latitude, activeSimulation.longitude], 7, { animate: true });
    }

    // 4. Focus on selected event if clicked from list
    if (selectedEvent && !isNaN(selectedEvent.latitude) && !isNaN(selectedEvent.longitude)) {
      map.setView([selectedEvent.latitude, selectedEvent.longitude], 8, { animate: true });
    }
  }, [latest, events, activeSimulation, selectedEvent]);

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400">
        Peta Seismik Indonesia • Sumber: OSM & BMKG
      </div>
    </div>
  );
}
