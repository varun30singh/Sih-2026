'use client';

import React, { useState } from 'react';
import { QueueEntry, LiveQueueState } from '@/types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Users, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';

interface QueueTrackerProps {
  entries: QueueEntry[];
  queueState: LiveQueueState;
  userTokenId?: string;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({
  entries,
  queueState,
  userTokenId = 'M-142',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const userEntry = entries.find((e) => e.tokenId === userTokenId);
  const farmersAhead = userEntry ? userEntry.farmersAhead : 8;
  const estimatedWait = userEntry ? userEntry.estimatedWaitMinutes : 45;

  return (
    <div className="space-y-6">
      {/* Live Counter Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Currently Serving */}
        <GlassCard className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold uppercase tracking-wider">
            <span>Currently Serving</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              Live Counter #1
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mt-2 font-mono">
            {queueState.currentServingToken}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 truncate">
            {queueState.currentServingFarmer}
          </p>
        </GlassCard>

        {/* Your Token & Position */}
        <GlassCard className="border-2 border-emerald-500/40 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Your Position</span>
            <Badge variant="success" dot={true}>
              On Track
            </Badge>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {userTokenId}
            </h3>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              #{farmersAhead + 1} in queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {farmersAhead} farmers ahead of you
          </p>
        </GlassCard>

        {/* Dynamic Estimated Wait */}
        <GlassCard className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Estimated Wait</span>
            <button
              onClick={handleRefresh}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {estimatedWait} min
            </h3>
            <span className="text-xs text-slate-400">approx.</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recommended arrival: <strong>10:45 AM</strong>
          </p>
        </GlassCard>
      </div>

      {/* Progress Bar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
          <span>Overall Batch Clearance Progress</span>
          <span>78% complete today</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: '78%' }}
          />
        </div>
      </GlassCard>

      {/* Live Interactive Queue List */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Live Queue Sequence (Centre #14 — Hapur Central)
            </h3>
            <p className="text-xs text-slate-500">
              Real-time token advancement. Transparent and protected by MandiSetu Queue Fairness Engine.
            </p>
          </div>
          <Badge variant="info" size="sm">
            4 Active Counters Operating
          </Badge>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => {
            const isServing = entry.tokenId === queueState.currentServingToken;
            const isUser = entry.tokenId === userTokenId;

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isServing
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : isUser
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700/80 shadow-md'
                    : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Position & Token */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        isServing
                          ? 'bg-emerald-600 text-white'
                          : isUser
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base sm:text-lg text-slate-900 dark:text-white">
                          {entry.tokenId}
                        </span>
                        {isServing && (
                          <Badge variant="success" size="sm">
                            Now Serving
                          </Badge>
                        )}
                        {isUser && (
                          <Badge variant="warning" size="sm">
                            Your Token
                          </Badge>
                        )}
                        {entry.isProtected && (
                          <Badge variant="protected" size="sm">
                            Fairness Protected ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {entry.farmerName} • <span className="text-slate-400">{entry.crop} ({entry.quantityKg} kg)</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Slot & Wait */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Slot: {entry.slotTime}
                    </span>
                    <span className="text-xs text-slate-500">
                      Est. Arrival: <strong>{entry.estimatedArrival}</strong>
                    </span>
                  </div>
                </div>

                {/* Expandable Explanation Details */}
                {(selectedEntry?.id === entry.id || entry.delayReason) && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1 animate-in fade-in">
                    {entry.delayReason && (
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span><strong>Fairness Engine Note:</strong> {entry.delayReason}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Counter: {entry.counterNumber ? `Counter #${entry.counterNumber}` : 'Pending assignment'}</span>
                      <span>Fairness Index: {entry.fairnessScore}/100</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
