'use client';

import React from 'react';
import { GlassCard, Badge } from '@/components/ui';
import { MOCK_ANALYTICS } from '@/lib/mock-data/analytics';
import { 
  HourlyArrivalsChart, 
  WaitTimeTrendChart, 
  MultiCentreThroughputTable 
} from '@/components/dashboard';
import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  PieChart, 
  Layers, 
  Building2 
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const analytics = MOCK_ANALYTICS;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-emerald-400">
              Operations Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Mandi Throughput & Queue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical and real-time performance indicators to evaluate queue reduction, peak hour stress, and regional mandi capacity.
          </p>
        </div>

        <Badge variant="info" size="md">
          Season: Rabi 2026 (Wheat / Mustard)
        </Badge>
      </div>

      {/* Top 4 Impact KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard variant="dark" className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block">Waiting Time Reduced</span>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">74%</p>
          <span className="text-[11px] text-slate-400">Compared to manual lines</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block">Peak Congestion Hour</span>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">10:00 AM</p>
          <span className="text-[11px] text-slate-400">42 arrivals / hour</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block">Weighbridge Turnaround</span>
          <p className="text-3xl font-black text-white font-mono mt-1">6.2 min</p>
          <span className="text-[11px] text-rose-400">Lag target: &lt;4.0 min</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block">DBT Clearance Rate</span>
          <p className="text-3xl font-black text-blue-400 font-mono mt-1">98.2%</p>
          <span className="text-[11px] text-slate-400">Disbursed within 48h</span>
        </GlassCard>
      </div>

      {/* 2 Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="dark" className="p-6">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Daily Farmer Arrival vs. Clearance Throughput
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Measures hourly intake pacing through staggered slot buffering.
          </p>
          <HourlyArrivalsChart data={analytics.hourlyTrends} />
        </GlassCard>

        <GlassCard variant="dark" className="p-6">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Average Waiting Time Distribution by Hour
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Highlights the 10:00 AM – 11:30 AM verification bottleneck.
          </p>
          <WaitTimeTrendChart data={analytics.hourlyTrends} />
        </GlassCard>
      </div>

      {/* Multi-Centre Comparison Table & Crop Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard variant="dark" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Regional Mandi Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">Throughput, tonnage, and delay index</p>
            </div>
          </div>
          <MultiCentreThroughputTable data={analytics.multiCentreComparison} />
        </GlassCard>

        {/* Crop Breakdown */}
        <GlassCard variant="dark" className="p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Crop Procurement Share
          </h3>
          <div className="space-y-4 text-xs">
            {analytics.cropBreakdown.map((item) => (
              <div key={item.crop} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-200">{item.crop}</span>
                  <span className="font-bold text-emerald-400">{item.percentage}% ({item.totalTonnes} T)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
