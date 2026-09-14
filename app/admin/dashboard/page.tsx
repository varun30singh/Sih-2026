'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/common/GlassCard';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_ANALYTICS } from '@/lib/mock-data/analytics';
import { MOCK_QUEUE_ENTRIES, MOCK_LIVE_QUEUE_STATE } from '@/lib/mock-data/queue';
import { HourlyArrivalsChart } from '@/components/charts/Charts';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  AlertTriangle, 
  Boxes, 
  Scale, 
  ArrowRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = MOCK_ANALYTICS.centre14Overview;

  return (
    <div className="space-y-6">
      {/* Top Banner with Centre Status & Core Alerts */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Live Mandi Telemetry
            </span>
            <Badge variant="warning" size="sm">
              Bottleneck Warning
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Centre #14 — Hapur Central Mandi Operations Desk
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time monitoring of gate arrivals, electronic weighbridge throughput, queue fairness, and dynamic delay mitigation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/digital-twin">
            <Button size="md" variant="primary" leftIcon={<Boxes className="w-4 h-4" />}>
              Open Digital Twin
            </Button>
          </Link>
          <Link href="/admin/dynamic-slots">
            <Button size="md" variant="outline" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Inspect Bottleneck
            </Button>
          </Link>
        </div>
      </div>

      {/* Dynamic Slot Bottleneck Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/60 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">
              Dynamic Delay Alert: Mandi Operating 55% Slower than Standard
            </span>
            <span className="text-slate-300">
              Verification desk sensor calibration lag has affected 24 farmers (+78 min wait). Mitigation recommended.
            </span>
          </div>
        </div>

        <Link href="/admin/dynamic-slots" className="shrink-0">
          <Button size="sm" variant="accent">
            Apply Reallocation (Move 8 to Centre #12) →
          </Button>
        </Link>
      </div>

      {/* 6 Requested KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          variant="dark"
          title="Total Farmers"
          value={stats.totalFarmersToday}
          subtitle="Registered today"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '+14%', isPositive: true }}
        />

        <StatCard
          variant="dark"
          title="Active Tokens"
          value={stats.activeTokens}
          subtitle="In pipeline"
          icon={<Activity className="w-5 h-5" />}
        />

        <StatCard
          variant="dark"
          title="Farmers Waiting"
          value={stats.farmersWaiting}
          subtitle="Queue line"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          highlight={true}
        />

        <StatCard
          variant="dark"
          title="Avg. Wait Time"
          value={`${stats.averageWaitingTimeMinutes} min`}
          subtitle="Lag: +55%"
          icon={<Clock className="w-5 h-5 text-rose-400" />}
        />

        <StatCard
          variant="dark"
          title="Procurement Done"
          value={stats.procurementCompletedCount}
          subtitle="485.4 Tonnes"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          variant="dark"
          title="Pending Payments"
          value={stats.pendingPaymentsCount}
          subtitle="PFMS queue"
          icon={<CreditCard className="w-5 h-5 text-blue-400" />}
        />
      </div>

      {/* Operational Charts & Live Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart */}
        <GlassCard variant="dark" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Hourly Farmer Influx & Throughput Dynamics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clearance rates per hour vs. peak arrival windows.
              </p>
            </div>
            <Badge variant="info" size="sm">
              Live Sensor Feed
            </Badge>
          </div>

          <HourlyArrivalsChart data={MOCK_ANALYTICS.hourlyTrends} />
        </GlassCard>

        {/* Fairness & Telemetry Mini Summary */}
        <GlassCard variant="dark" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Queue Fairness Health
              </h4>
              <Badge variant="success" size="sm">
                91/100
              </Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All 14 delay-affected farmers today have been shielded from missed-slot penalties via automated fairness rules.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Currently Serving:</span>
                <span className="font-mono font-bold text-emerald-400">Token M-134</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hero Farmer Token:</span>
                <span className="font-mono font-bold text-amber-400">Token M-142 (YOU)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Counters:</span>
                <span className="font-bold text-white">4 Operating</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link href="/admin/fairness" className="block">
              <Button size="sm" variant="outline" className="w-full bg-slate-800 text-white border-slate-700">
                View Fairness Ledger →
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Live Queue Table Preview */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Current Serving Queue (Centre #14)
            </h3>
            <p className="text-xs text-slate-400">First 6 tokens in line</p>
          </div>
          <Link href="/admin/queue">
            <Button size="sm" variant="primary">
              Full Queue Management Screen →
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer Name</th>
                <th className="py-2.5 px-3">Crop / Qty</th>
                <th className="py-2.5 px-3">Slot Time</th>
                <th className="py-2.5 px-3">Est. Arrival</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Fairness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_QUEUE_ENTRIES.slice(0, 6).map((q) => (
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
                          ? 'bg-emerald-900 text-emerald-300'
                          : q.status === 'approaching'
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {q.isProtected ? (
                      <Badge variant="protected" size="sm">Protected ✓</Badge>
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
