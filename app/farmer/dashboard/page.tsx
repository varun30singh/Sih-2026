'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { NoWaitArrivalCard } from '@/components/farmer/NoWaitArrivalCard';
import { MOCK_ACTIVE_TOKEN_M142 } from '@/lib/mock-data/tokens';
import { 
  CalendarPlus, 
  QrCode, 
  Users, 
  CreditCard, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Bell, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';

export default function FarmerDashboard() {
  const { t } = useLanguage();
  const token = MOCK_ACTIVE_TOKEN_M142;

  const procurementStages = [
    { label: 'Registered', done: true },
    { label: 'Slot Booked', done: true },
    { label: 'Arrived', done: true },
    { label: 'Weighing', current: true },
    { label: 'Procurement Complete', pending: true },
    { label: 'Payment (DBT)', pending: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Namaste Card */}
      <GlassCard className="p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl shadow-xl relative overflow-hidden border-0">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-200">
              Kisan Portal • Welcome Back
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t.farmer.welcome}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 opacity-90 max-w-xl">
              Your digital procurement pass is active for today. You do not need to wait at the mandi;
              depart only when your turn alert indicates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/farmer/book-slot">
              <Button size="md" variant="secondary" className="bg-white text-slate-950 hover:bg-emerald-50 border-0 font-bold">
                + Book New Slot
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* CORE FEATURE #2 Farmer Delay Warning & Dynamic Alternative Notification */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                ⚠️ Centre #14 is Processing Slower than Expected (+55% Lag)
              </h4>
              <Badge variant="protected" size="sm">
                Slot Protected
              </Badge>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Target mandi has a 45 min delay. Faster Alternative: <strong>Centre #12 (Modinagar Agri Hub)</strong> is 14 km away with only 12 waiting farmers.
            </p>
          </div>
        </div>

        <Link href="/farmer/smart-centres" className="shrink-0 w-full sm:w-auto">
          <Button size="sm" variant="accent" className="w-full">
            View Faster Alternative
          </Button>
        </Link>
      </div>

      {/* CORE FEATURE #1: Smart "No-Wait Arrival" Hero Card */}
      <NoWaitArrivalCard token={token} />

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
          Quick Farmer Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/farmer/book-slot">
            <GlassCard hoverEffect={true} className="p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CalendarPlus className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                Book New Slot
              </span>
              <span className="text-[10px] text-slate-400">Choose crop & mandi</span>
            </GlassCard>
          </Link>

          <Link href="/farmer/smart-centres">
            <GlassCard hoverEffect={true} className="p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Compass className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                Find Best Mandi
              </span>
              <span className="text-[10px] text-slate-400">AI congestion scores</span>
            </GlassCard>
          </Link>

          <Link href="/farmer/token">
            <GlassCard hoverEffect={true} className="p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <QrCode className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                View Digital Pass
              </span>
              <span className="text-[10px] text-slate-400">Pass Token M-142</span>
            </GlassCard>
          </Link>

          <Link href="/farmer/payment">
            <GlassCard hoverEffect={true} className="p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CreditCard className="w-6 h-6 mx-auto text-teal-600 mb-2" />
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                Check Payment
              </span>
              <span className="text-[10px] text-slate-400">₹56,875 (Processing)</span>
            </GlassCard>
          </Link>
        </div>
      </div>

      {/* Procurement Lifecycle Progress Bar */}
      <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today’s Procurement Stage: Token M-142
            </h3>
            <p className="text-xs text-slate-500">Wheat (25 Quintals) at Centre #14</p>
          </div>
          <Link href="/farmer/procurement" className="text-xs text-emerald-600 font-bold hover:underline">
            View Full Timeline →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
          {procurementStages.map((stage, idx) => (
            <div
              key={stage.label}
              className={`p-2.5 rounded-xl text-center border text-xs font-semibold ${
                stage.done
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : stage.current
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-400 dark:border-amber-700 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <span className="text-[10px] block opacity-75">Step {idx + 1}</span>
              <span className="truncate block mt-0.5">{stage.label}</span>
              {stage.done && <span className="text-[10px] text-emerald-600 block">Done ✓</span>}
              {stage.current && <span className="text-[10px] text-amber-700 font-bold block">In Progress</span>}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Alerts Feed */}
      <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            Recent Queue & Arrival Notifications
          </h3>
          <span className="text-xs text-slate-400">Synced 1 min ago</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                “Only 8 farmers are ahead of you. Estimated arrival: 10:45 AM.”
              </p>
              <p className="text-[11px] text-slate-500">10:00 AM • Dispatched via SMS & App</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                “Your procurement slot is confirmed for Centre #14 (Hapur Central Mandi).”
              </p>
              <p className="text-[11px] text-slate-500">08:15 AM • Automated Booking</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
