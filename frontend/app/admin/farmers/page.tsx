'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_FARMERS } from '@/lib/mock-data/farmers';
import { 
  UserCheck, 
  Search, 
  MapPin, 
  Wheat, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function AdminFarmersPage() {
  const [search, setSearch] = useState('');

  const filteredFarmers = MOCK_FARMERS.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase()) ||
      f.mobile.includes(search) ||
      f.farmerIdNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-emerald-400">
              Kisan Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Registered Farmers Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official government registry synchronized with PM-Kisan & State Land Records.
          </p>
        </div>

        <Badge variant="info" size="md">
          {MOCK_FARMERS.length} Enrolled Farmers
        </Badge>
      </div>

      {/* Search Filter Bar */}
      <GlassCard variant="dark" className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer name, mobile number, village, or Farmer ID..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </GlassCard>

      {/* Farmers Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Farmer ID</th>
                <th className="py-2.5 px-3">Name & Mobile</th>
                <th className="py-2.5 px-3">Village / District</th>
                <th className="py-2.5 px-3">Land Holding</th>
                <th className="py-2.5 px-3">Primary Crops</th>
                <th className="py-2.5 px-3">Aadhaar Status</th>
                <th className="py-2.5 px-3">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/60">
                  <td className="py-3 px-3 font-mono font-bold text-white text-xs">
                    {f.farmerIdNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-200 block">{f.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{f.mobile}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {f.village}, {f.district} ({f.state})
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                    {f.totalLandAcres} Acres
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {f.primaryCrops.join(', ')}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{f.aadhaarHash}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {f.registeredDate}
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
