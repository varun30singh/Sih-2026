'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DigitalToken } from '@/types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Clock, 
  Users, 
  MapPin, 
  Sparkles, 
  BellRing, 
  MessageSquare, 
  PhoneCall, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface NoWaitArrivalCardProps {
  token: DigitalToken;
  className?: string;
}

export const NoWaitArrivalCard: React.FC<NoWaitArrivalCardProps> = ({ token, className = '' }) => {
  const [showAlertTimeline, setShowAlertTimeline] = useState(true);

  // 8 steps ahead in queue visual
  const queueSnippet = [
    { token: 'M-134', status: 'Now Serving', current: true },
    { token: 'M-135', status: 'Next', current: false },
    { token: 'M-136', status: 'In Yard', current: false },
    { token: 'M-137', status: 'Protected', current: false },
    { token: 'M-138', status: 'Waiting', current: false },
    { token: 'M-139', status: 'Waiting', current: false },
    { token: 'M-140', status: 'Waiting', current: false },
    { token: 'M-141', status: 'Waiting', current: false },
    { token: token.tokenId, status: 'YOU', current: false, isUser: true },
  ];

  return (
    <GlassCard
      variant="light"
      className={`relative overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-xl ${className}`}
    >
      {/* Top Banner with Glow */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Your Turn is Approaching
              </h3>
              <Badge variant="success" dot={true}>
                🟢 You’re On Track
              </Badge>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Smart Just-In-Time Dispatch Active
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Your Token</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {token.tokenId}
          </p>
        </div>
      </div>

      {/* Hero Zero-Wait Reassurance Alert */}
      <div className="my-4 p-3.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            <strong>You do NOT need to wait at the centre.</strong> Relax at home or in your village. Only depart when your travel timer alerts you.
          </p>
        </div>
        <Badge variant="protected" size="sm" className="shrink-0 hidden md:inline-flex">
          Zero Waiting Guarantee
        </Badge>
      </div>

      {/* Grid of Key Arrival Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-5">
        <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farmers ahead</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {token.farmersAhead}
          </p>
          <p className="text-[11px] text-slate-400">Ahead in current queue</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Estimated waiting</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {token.estimatedWaitMinutes} min
          </p>
          <p className="text-[11px] text-slate-400">Based on counter speed</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Procurement Centre</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            Centre #14
          </p>
          <p className="text-[11px] text-slate-400 truncate">Hapur Central Mandi</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">Recommended arrival</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {token.recommendedArrival}
          </p>
          <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/80 font-medium">
            Gate entry window
          </p>
        </div>
      </div>

      {/* Visual Queue Order Snippet */}
      <div className="my-5 p-4 rounded-xl bg-slate-900 text-white shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Live Serving Sequence
          </span>
          <span className="text-xs text-emerald-400 font-mono">
            Currently Processing: <strong>M-134</strong> (Weighbridge #1)
          </span>
        </div>

        <div className="flex items-center overflow-x-auto pb-2 gap-2 scrollbar-none">
          {queueSnippet.map((item, idx) => (
            <React.Fragment key={item.token}>
              <div
                className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl text-center transition-all ${
                  item.current
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300 scale-105'
                    : item.isUser
                    ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 scale-105 animate-soft-pulse'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 font-semibold'
                }`}
              >
                <span className="text-xs font-mono">{item.token}</span>
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {item.status}
                </span>
              </div>
              {idx < queueSnippet.length - 1 && (
                <span className="text-slate-600 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Alert System Timeline Toggle */}
      <div className="pt-2">
        <button
          onClick={() => setShowAlertTimeline(!showAlertTimeline)}
          className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-600" />
            <span>Turn-by-Turn Alert Timeline & Delivery Channels (SMS • Voice/IVR • App)</span>
          </div>
          <span className="text-[11px] text-emerald-600 underline">
            {showAlertTimeline ? 'Hide Alert Flow' : 'View All 5 Alerts'}
          </span>
        </button>

        {showAlertTimeline && (
          <div className="mt-3 space-y-2.5">
            {token.alertsHistory.map((alert, idx) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  alert.stage === 3
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                    : alert.isRead
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      alert.isRead
                        ? 'bg-emerald-600 text-white'
                        : alert.stage === 3
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {alert.stage}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Notification {alert.stage}: {alert.title}
                      </h5>
                      {alert.stage === 3 && (
                        <Badge variant="warning" size="sm">
                          Active Now
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">{alert.timestamp}</span>
                  <div className="flex items-center gap-1">
                    {alert.channels.map((ch) => (
                      <span
                        key={ch}
                        title={`Delivered via ${ch}`}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {ch === 'SMS' && <MessageSquare className="w-2.5 h-2.5 inline mr-0.5" />}
                        {ch === 'IVR' && <PhoneCall className="w-2.5 h-2.5 inline mr-0.5" />}
                        {ch === 'APP' && <Smartphone className="w-2.5 h-2.5 inline mr-0.5" />}
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fairness protection active against centre operational delays</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/farmer/queue">
            <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              Full Live Queue
            </Button>
          </Link>
          <Link href="/farmer/token">
            <Button size="sm" variant="primary">
              View Digital Pass
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};
