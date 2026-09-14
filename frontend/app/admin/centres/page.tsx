'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_CENTRES } from '@/lib/mock-data/centres';
import { 
  Building2, 
  MapPin, 
  Users, 
  Clock, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

type FilterType = 'all' | 'optimal' | 'congested' | 'critical';

export default function MultiCentresPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredCentres = MOCK_CENTRES.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.district.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-750">
            🟢 Normal / Optimal
          </span>
        );
      case 'congested':
      case 'moderate':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700">
            🟡 Busy / Congested
          </span>
        );
      case 'critical':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse">
            🔴 Critical Congestion
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-blue-400">
              State Agricultural Marketing Board (e-NAM)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Government Multi-Centre Operations Grid
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            State-wide command console monitoring queue densities, weighbridge turnaround speeds, and capacity utilization across all district mandis.
          </p>
        </div>

        <Badge variant="info" size="md">
          District: Hapur & Meerut Division
        </Badge>
      </div>

      {/* Filter & Search Toolbar */}
      <GlassCard variant="dark" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Mandis (5)
          </button>
          <button
            onClick={() => setFilter('optimal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'optimal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🟢 Normal / Optimal (2)
          </button>
          <button
            onClick={() => setFilter('congested')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'congested'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🟡 Busy / Congested (2)
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔴 Critical (1)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mandi or district..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </GlassCard>

      {/* Grid of Centre Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentres.map((c) => {
          return (
            <GlassCard
              key={c.id}
              variant="dark"
              hoverEffect={true}
              className="p-6 flex flex-col justify-between border border-slate-800 bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-slate-400">{c.code}</span>
                  {getStatusBadge(c.status)}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {c.address}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Waiting Queue</span>
                    <span className="text-lg font-black text-white">{c.queueCount} Farmers</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Yard Capacity</span>
                    <span
                      className={`text-lg font-black ${
                        c.capacity.percentage > 85 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {c.capacity.percentage}% Full
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Service Speed</span>
                    <span className="font-mono font-bold text-slate-300">
                      {c.processingMetrics.avgMinutesPerFarmer} min / farmer
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Cleared Today</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {c.processingMetrics.todayClearedCount} Loads
                    </span>
                  </div>
                </div>

                {/* Facilities Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.facilities.slice(0, 2).map((fac) => (
                    <span
                      key={fac}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href="/admin/digital-twin"
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  Inspect Digital Twin <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link href="/admin/queue">
                  <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-white">
                    Counter Desk
                  </Button>
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
