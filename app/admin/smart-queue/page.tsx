'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_QUEUE_ENTRIES, MOCK_LIVE_QUEUE_STATE } from '@/lib/mock-data/queue';
import { MOCK_DYNAMIC_SLOT_ALERT } from '@/lib/mock-data/slots';
import { 
  Cpu, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  ShieldCheck, 
  Building2,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export default function SmartQueuePage() {
  const [reallocated, setReallocated] = useState(false);

  const handleReallocate = () => {
    setReallocated(true);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-purple-400">
              Integrated Algorithmic Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Combined Smart Queue & Turn Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizes real-time no-wait arrival, counter latency, fairness rules, and dynamic slot mitigation.
          </p>
        </div>

        <Badge variant="success" size="md">
          Zero-Wait Protocol Engine Active
        </Badge>
      </div>

      {/* Main Intelligent Telemetry Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="dark" className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs uppercase font-bold text-slate-400 block">Current Serving</span>
          <p className="text-3xl font-black font-mono text-emerald-400 mt-1">M-134</p>
          <span className="text-xs text-slate-400 block mt-1">Rajendra Prasad Yadav</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs uppercase font-bold text-slate-400 block">Queue Backlog</span>
          <p className="text-3xl font-black font-mono text-amber-400 mt-1">37 Waiting</p>
          <span className="text-xs text-slate-400 block mt-1">4 Active Counters</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5 border-l-4 border-l-rose-500">
          <span className="text-xs uppercase font-bold text-slate-400 block">Current Service Pace</span>
          <p className="text-3xl font-black font-mono text-rose-400 mt-1">6.2 min</p>
          <span className="text-xs text-rose-300 block mt-1">Benchmark: 4.0 min (+55% Lag)</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5 border-l-4 border-l-purple-500">
          <span className="text-xs uppercase font-bold text-slate-400 block">Predicted Clearance</span>
          <p className="text-3xl font-black font-mono text-purple-400 mt-1">3h 42m</p>
          <span className="text-xs text-slate-400 block mt-1">Staggered Arrival Buffers</span>
        </GlassCard>
      </div>

      {/* Recommended Algorithmic Action Callout */}
      <GlassCard variant="dark" className="p-6 border-2 border-amber-500/60 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                ⚠️ Processing Slower than Expected (Sensor Lag)
              </h3>
              <Badge variant="warning" size="sm">
                Action Required
              </Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Verification desk throughput has dropped. 24 downstream farmers face a +78 min delay. 
              <strong>Recommended Action:</strong> Reallocate 8 tail-end farmers to Centre #12 (Modinagar Agri Hub, 14 km away).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {reallocated ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                8 Farmers Reallocated to Centre #12 ✓
              </span>
            ) : (
              <Button
                size="md"
                variant="primary"
                onClick={handleReallocate}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Execute Reallocation to Centre #12
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Smart Live Queue Table with JIT Departure Timers */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Dynamic Dispatch Sequence & Turn Progression
            </h3>
            <p className="text-xs text-slate-400">
              Real-time departure dispatch timers calculated per farmer.
            </p>
          </div>
          <Badge variant="info" size="sm">
            Audited by Fairness Engine
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Crop / Qty</th>
                <th className="py-2.5 px-3">Scheduled Slot</th>
                <th className="py-2.5 px-3">Recommended JIT Arrival</th>
                <th className="py-2.5 px-3">Turn Status</th>
                <th className="py-2.5 px-3">Fairness Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_QUEUE_ENTRIES.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/60">
                  <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                    {q.tokenId}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">{q.farmerName}</td>
                  <td className="py-3 px-3 text-slate-400">{q.crop} ({q.quantityKg} kg)</td>
                  <td className="py-3 px-3 text-slate-300">{q.slotTime}</td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">{q.estimatedArrival}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === 'serving'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : q.status === 'approaching'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {q.isProtected ? (
                      <Badge variant="protected" size="sm">Shielded ✓</Badge>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
