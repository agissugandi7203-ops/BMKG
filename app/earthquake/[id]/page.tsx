'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Layers,
  Waves,
  Share2,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  LifeBuoy,
  Radio,
} from 'lucide-react';
import { NormalizedEarthquake } from '@/lib/types';
import { EarthquakeMap } from '@/components/EarthquakeMap';

export default function EarthquakeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [earthquake, setEarthquake] = useState<NormalizedEarthquake | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShakemapModal, setShowShakemapModal] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch('/api/earthquakes?limit=50');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const list: NormalizedEarthquake[] = json.data;
          const found = list.find((item) => item.id === id || item.event_hash === id);
          if (found) {
            setEarthquake(found);
          } else if (list.length > 0) {
            setEarthquake(list[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Memuat detail seismik BMKG...</span>
        </div>
      </div>
    );
  }

  if (!earthquake) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Data Gempa Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mb-4">Kejadian gempa mungkin telah diarsipkan atau ID salah.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Dashboard Utama
        </Link>
      </div>
    );
  }

  const isTsunami = earthquake.potential.toLowerCase().includes('berpotensi tsunami');

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = `🚨 *Peringatan Gempa BMKG*\nMagnitudo: M ${earthquake.magnitude.toFixed(1)}\nWilayah: ${earthquake.region}\nKedalaman: ${earthquake.depth_raw}\nWaktu: ${earthquake.time_str} (${earthquake.date_str})\nPotensi: ${earthquake.potential}\n\nInfo selengkapnya: ${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verifikasi Resmi BMKG TEWS</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title Banner */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full border bg-red-500/20 text-red-400 border-red-500/40">
              Magnitudo M {earthquake.magnitude.toFixed(1)}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{earthquake.date_str} • {earthquake.time_str}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
            {earthquake.region}
          </h1>

          <p className="text-xs text-slate-400">
            Pusat gempa berada di koordinat lintang {earthquake.latitude}° dan bujur {earthquake.longitude}°.
          </p>
        </div>

        {/* Focused Leaflet Map */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <EarthquakeMap
            latest={earthquake}
            events={[earthquake]}
            activeSimulation={null}
            selectedEvent={earthquake}
          />
        </div>

        {/* Parameter Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Kedalaman Episentrum</span>
            <p className="text-xl font-bold text-white">{earthquake.depth_raw}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Status Potensi Tsunami</span>
            <p className={`text-base font-bold ${isTsunami ? 'text-red-400' : 'text-emerald-400'}`}>
              {earthquake.potential}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Guncangan Dirasakan (MMI)</span>
            <p className="text-sm font-semibold text-amber-400">
              {earthquake.felt_mmi || 'Belum ada laporan dirasakan'}
            </p>
          </div>
        </div>

        {/* Shakemap Preview if Available */}
        {earthquake.shakemap_url && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Peta Guncangan (Shakemap BMKG)</h3>
                <p className="text-xs text-slate-400">Peta distribusi intensitas guncangan resmi</p>
              </div>
              <button
                onClick={() => setShowShakemapModal(true)}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-semibold border border-red-500/30 transition-colors"
              >
                Perbesar Shakemap
              </button>
            </div>

            <div
              onClick={() => setShowShakemapModal(true)}
              className="cursor-pointer bg-slate-950 p-4 rounded-xl flex items-center justify-center hover:opacity-95 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={earthquake.shakemap_url}
                alt={`Shakemap ${earthquake.region}`}
                className="max-h-80 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Share & Actions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Lihat Semua Gempa Terkini</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tautan Disalin' : 'Salin Tautan'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan ke WhatsApp</span>
            </button>
          </div>
        </div>
      </main>

      {/* Shakemap Lightbox Modal */}
      {showShakemapModal && earthquake.shakemap_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-white text-sm">Shakemap BMKG - {earthquake.region}</h3>
              <button
                onClick={() => setShowShakemapModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Tutup [ESC]
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={earthquake.shakemap_url}
                alt="Shakemap"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
