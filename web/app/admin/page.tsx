'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { apiClient } from '../../lib/api';
import { SystemDataSourceStatus, ModelVersionStatus } from '../../../shared/types';
import {
  ServerCog,
  Database,
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function AdminPage() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [dataStatus, setDataStatus] = useState<{
    dataSources: SystemDataSourceStatus[];
    modelVersions: ModelVersionStatus[];
    systemHealth: { status: string; uptimeHours: number; activeRequests: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getDataStatus();
      setDataStatus(data);
    } catch (e) {
      console.error('Failed to load system status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ServerCog className="w-6 h-6 text-rose-400" />
            <span>{t.systemAdmin} & Data Pipeline Surveillance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational status of meteorological ingestion feeds, machine learning inference jobs, and spatial registry.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-monsoon-surface hover:bg-monsoon-pine border border-monsoon-border text-xs text-emerald-400 font-medium transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Providers</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} heightClass="h-16" />
      ) : !dataStatus ? (
        <EmptyState
          title="Data Pipeline Status Unavailable"
          message="Unable to communicate with the MONSOON-SENSE system diagnostic endpoint."
          actionText="Retry System Ping"
          onAction={loadStatus}
        />
      ) : (
        <div className="space-y-6">
          {/* System Health KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
              <div className="text-[11px] text-slate-400 font-mono">Pipeline Core</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{dataStatus.systemHealth.status}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">All worker threads active</div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
              <div className="text-[11px] text-slate-400 font-mono">Service Uptime</div>
              <div className="text-lg font-bold text-white mt-1 font-mono">
                {dataStatus.systemHealth.uptimeHours} hrs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">High-availability cluster</div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
              <div className="text-[11px] text-slate-400 font-mono">Active Queries / Min</div>
              <div className="text-lg font-bold text-teal-400 mt-1 font-mono">
                {dataStatus.systemHealth.activeRequests}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Inference API load</div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
              <div className="text-[11px] text-slate-400 font-mono">PostGIS Index Status</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">Spatial Index</div>
              <div className="text-[10px] text-slate-400 mt-0.5">PostGIS geometry adapter ready</div>
            </div>
          </div>

          {/* Meteorological Data Ingestion Feeds */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-monsoon-border/60">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                External Meteorological Data Sources Status
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-monsoon-border/60 text-slate-400">
                    <th className="py-2.5 px-3">Data Source</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Last Sync</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Records Today</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monsoon-border/40">
                  {dataStatus.dataSources.map((ds, idx) => (
                    <tr key={idx} className="hover:bg-monsoon-forest/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white font-sans">{ds.sourceName}</td>
                      <td className="py-3 px-3 text-slate-300 font-sans">{ds.provider}</td>
                      <td className="py-3 px-3 text-slate-400">{ds.category}</td>
                      <td className="py-3 px-3 text-slate-400">{ds.lastSuccessfulUpdate || 'Not Synced'}</td>
                      <td className="py-3 px-3 text-slate-400">{ds.pingLatencyMs !== null ? `${ds.pingLatencyMs} ms` : '--'}</td>
                      <td className="py-3 px-3 text-slate-200">{ds.recordsProcessedToday.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                            ds.status === 'Operational'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>{ds.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Registry & Inference Versions */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-monsoon-border/60">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Machine Learning & Downscaling Model Registry
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {dataStatus.modelVersions.map((m) => (
                <div
                  key={m.modelId}
                  className="p-4 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/70 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {m.modelId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        {m.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">{m.name}</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Target: {m.targetTask}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono mt-2 bg-monsoon-forest/40 p-2 rounded border border-monsoon-border/40">
                      Score: {m.crossValidatedScore}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-monsoon-border/40 text-[10px] text-slate-400 font-mono">
                    Last Run: {m.lastPredictionRun}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
