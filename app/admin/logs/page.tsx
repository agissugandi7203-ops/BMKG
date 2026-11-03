'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

interface LogItem {
  id: string;
  timestamp: string;
  endpoint: string;
  status: 'SUCCESS' | 'FAILED';
  duration_ms: number;
  events_count: number;
  message: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerManualSync = async () => {
    setLoading(true);
    try {
      await fetch('/api/cron/sync-bmkg', { method: 'POST' });
      fetchLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Audit Log Sinkronisasi BMKG</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Catatan aktivitas polling otomatis ke server BMKG dan telemetri latensi jaringan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Muat ulang log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
          </button>

          <button
            onClick={triggerManualSync}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-102 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>Picu Sinkronisasi Sekarang</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Endpoint BMKG</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Total Record</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada riwayat audit log.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{log.endpoint}</td>
                    <td className="py-3 px-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.duration_ms} ms</td>
                    <td className="py-3 px-4 font-bold text-white">{log.events_count}</td>
                    <td className="py-3 px-4 text-slate-400">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
