'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_TOKENS } from '@/lib/mock-data/tokens';
import { 
  QrCode, 
  Search, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Wheat 
} from 'lucide-react';

export default function AdminTokensPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTokens = MOCK_TOKENS.filter((t) => {
    const matchesSearch =
      t.tokenId.toLowerCase().includes(search.toLowerCase()) ||
      t.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      t.crop.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <QrCode className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-purple-400">
              Token Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Digital Token & Pass Master Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically signed digital tokens issued across all procurement time slots.
          </p>
        </div>

        <Badge variant="info" size="md">
          {MOCK_TOKENS.length} Active Today
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard variant="dark" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'ON_TRACK', 'NOW_SERVING', 'DELAYED', 'PROTECTED_DELAY'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by token ID, farmer..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </GlassCard>

      {/* Tokens Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer Name</th>
                <th className="py-2.5 px-3">Slot Time</th>
                <th className="py-2.5 px-3">Crop / Qty</th>
                <th className="py-2.5 px-3">Est. Arrival</th>
                <th className="py-2.5 px-3">Ahead</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Fairness Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTokens.map((t) => (
                <tr key={t.tokenId} className="hover:bg-slate-800/60">
                  <td className="py-3 px-3 font-mono font-black text-white text-sm">
                    {t.tokenId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-200 block">{t.farmerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{t.mobile}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{t.slotTime}</td>
                  <td className="py-3 px-3 text-slate-300">
                    {t.crop} ({t.quantityKg} kg)
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">
                    {t.recommendedArrival}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {t.farmersAhead} Farmers
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        t.status === 'NOW_SERVING'
                          ? 'success'
                          : t.status === 'DELAYED'
                          ? 'warning'
                          : t.status === 'PROTECTED_DELAY'
                          ? 'protected'
                          : 'info'
                      }
                      size="sm"
                    >
                      {t.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    {t.fairnessProtected ? (
                      <span className="text-teal-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Shielded ✓
                      </span>
                    ) : (
                      <span className="text-slate-500">Standard</span>
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
