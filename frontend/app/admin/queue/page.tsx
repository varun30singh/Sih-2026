'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_QUEUE_ENTRIES, MOCK_LIVE_QUEUE_STATE } from '@/lib/mock-data/queue';
import { QueueEntry } from '@/types';
import { 
  Users, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  PauseCircle, 
  SkipForward, 
  Volume2, 
  AlertTriangle,
  Play,
  Sparkles
} from 'lucide-react';

export default function AdminQueuePage() {
  const [entries, setEntries] = useState<QueueEntry[]>(MOCK_QUEUE_ENTRIES);
  const [servingIndex, setServingIndex] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const currentToken = entries[servingIndex] || entries[0];
  const nextTokens = entries.slice(servingIndex + 1, servingIndex + 5);

  const triggerMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCallNext = () => {
    if (servingIndex < entries.length - 1) {
      const next = entries[servingIndex + 1];
      setServingIndex(servingIndex + 1);
      triggerMessage(`Calling Next: Token ${next.tokenId} (${next.farmerName}) to Counter #1`);
    }
  };

  const handleHold = () => {
    triggerMessage(`Token ${currentToken.tokenId} placed on temporary Hold (Weighment Calibration).`);
  };

  const handleSkip = () => {
    triggerMessage(`Token ${currentToken.tokenId} skipped. Buffer slot allocated under fairness policy.`);
    if (servingIndex < entries.length - 1) setServingIndex(servingIndex + 1);
  };

  const handleComplete = () => {
    triggerMessage(`Token ${currentToken.tokenId} procurement complete! Weighment slip generated & DBT triggered.`);
    if (servingIndex < entries.length - 1) setServingIndex(servingIndex + 1);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase font-bold text-emerald-400">
              Live Counter Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Weighbridge & Counter Queue Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centre #14 — Hapur Central Mandi • Electronic Weighbridge Desk #1
          </p>
        </div>

        <Badge variant="info" size="md">
          4 Active Counters Connected
        </Badge>
      </div>

      {/* Action Toast Alert */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">{actionMessage}</span>
          </div>
          <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded font-mono">
            Audio Chime Broadcast
          </span>
        </div>
      )}

      {/* Hero Current Token & Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Serving Hero Card */}
        <GlassCard variant="dark" className="p-6 sm:p-8 lg:col-span-2 border-2 border-emerald-500/50 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">
                Counter Desk #1 • Now Serving
              </span>
              <h2 className="text-5xl font-black font-mono text-white tracking-tight mt-1">
                {currentToken.tokenId}
              </h2>
            </div>
            <div className="text-right">
              <Badge variant="success" size="md" dot={true}>
                At Weighbridge
              </Badge>
              <p className="text-xs text-slate-400 mt-1">Gross Weighment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block">Farmer Name</span>
              <span className="font-bold text-white text-sm block mt-0.5">
                {currentToken.farmerName}
              </span>
              <span className="text-[11px] text-slate-500">{currentToken.mobile}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block">Crop & Quota</span>
              <span className="font-bold text-white text-sm block mt-0.5">
                {currentToken.crop}
              </span>
              <span className="text-[11px] text-emerald-400">{currentToken.quantityKg} kg</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block">Slot Scheduled</span>
              <span className="font-bold text-white text-sm block mt-0.5">
                {currentToken.slotTime}
              </span>
              <span className="text-[11px] text-slate-500">{currentToken.estimatedArrival}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block">Fairness Score</span>
              <span className="font-mono font-bold text-emerald-400 text-sm block mt-0.5">
                {currentToken.fairnessScore}/100
              </span>
              <span className="text-[11px] text-slate-400">
                {currentToken.isProtected ? 'Shielded ✓' : 'Normal'}
              </span>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={handleCallNext}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Call Next Token
            </Button>

            <Button
              size="lg"
              variant="accent"
              onClick={handleComplete}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Procurement
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleHold}
              leftIcon={<PauseCircle className="w-4 h-4" />}
              className="bg-slate-800 border-slate-700 text-slate-200"
            >
              Hold Token
            </Button>

            <Button
              size="lg"
              variant="danger"
              onClick={handleSkip}
              leftIcon={<SkipForward className="w-4 h-4" />}
            >
              Skip Token
            </Button>
          </div>
        </GlassCard>

        {/* Next in Line Staging Window */}
        <GlassCard variant="dark" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Next 4 Tokens in Line
              </h3>
              <Badge variant="warning" size="sm">
                Buffer Staged
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              {nextTokens.map((item, idx) => (
                <div
                  key={item.tokenId}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-[11px] font-bold flex items-center justify-center">
                      +{idx + 1}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-white block">
                        {item.tokenId}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.farmerName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-semibold block">{item.estimatedWaitMinutes} min</span>
                    <span className="text-[10px] text-slate-500">Wait</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Estimated Queue Clearance:</span>
              <span className="font-bold text-white">3h 42m</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Service Time:</span>
              <span className="font-bold text-amber-400">6.2 min / farmer</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Full Queue Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Full Waiting Queue Ledger</h3>
          <span className="text-xs text-slate-400">Showing {entries.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Crop / Quota</th>
                <th className="py-2.5 px-3">Slot Time</th>
                <th className="py-2.5 px-3">Est. Arrival</th>
                <th className="py-2.5 px-3">Fairness Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.map((q, idx) => {
                const isCurrent = idx === servingIndex;
                return (
                  <tr
                    key={q.id}
                    className={`hover:bg-slate-800/60 ${isCurrent ? 'bg-emerald-950/40' : ''}`}
                  >
                    <td className="py-3 px-3 font-bold font-mono text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-white text-sm">
                      {q.tokenId}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{q.farmerName}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{q.mobile}</td>
                    <td className="py-3 px-3 text-slate-300">{q.crop} ({q.quantityKg} kg)</td>
                    <td className="py-3 px-3 text-slate-300">{q.slotTime}</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{q.estimatedArrival}</td>
                    <td className="py-3 px-3">
                      {q.isProtected ? (
                        <Badge variant="protected" size="sm">Shielded ✓</Badge>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
