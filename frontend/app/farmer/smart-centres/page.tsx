'use client';

import React, { useState } from 'react';
import { MOCK_RECOMMENDATIONS } from '@/lib/mock-data/recommendations';
import { CentreRecommendationCard } from '@/components/farmer/CentreRecommendationCard';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { 
  Compass, 
  Sparkles, 
  SlidersHorizontal, 
  Clock, 
  Wheat, 
  Scale, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function SmartCentresPage() {
  const [preferredTime, setPreferredTime] = useState('10:00 AM – 12:00 PM');
  const [crop, setCrop] = useState('Wheat (Kalyan Sona)');
  const [quantityKg, setQuantityKg] = useState('2500');
  const [selectedId, setSelectedId] = useState('centre-12');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            Core SIH Differentiator
          </Badge>
          <span className="text-xs text-slate-500">Multi-factor Procurement Logistics Matcher</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Find the Best Procurement Centre
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Rather than blindly sending you to the nearest congested mandi, MandiSetu computes total turnaround time by analyzing live queues, weighbridge speeds, yard capacity, and road distance.
        </p>
      </div>

      {/* Preferences Filter Strip */}
      <GlassCard className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          Your Harvest Preferences (Used to compute fastest mandi)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1.5 block mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Preferred Arrival Time
            </span>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM</option>
              <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM (Optimal)</option>
              <option value="12:00 PM – 02:00 PM">12:00 PM – 02:00 PM</option>
              <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1.5 block mb-1">
              <Wheat className="w-3.5 h-3.5 text-emerald-600" />
              Crop Declared
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100 block">
              {crop}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1.5 block mb-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Lot Quantity
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100 block">
              {quantityKg} kg (25 Quintals)
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Algorithm Formula Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md border border-emerald-500/30">
        <div className="space-y-1">
          <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            Algorithmic Objective Function
          </span>
          <p className="text-slate-200 text-xs font-mono">
            Best Mandi = f(Transit Distance + Queue Length × Service Speed + Yard Headroom + Slot Compatibility)
          </p>
        </div>
        <Badge variant="success" size="sm">
          Dynamic Real-Time Weights
        </Badge>
      </div>

      {/* Ranked Recommendations List */}
      <div className="space-y-4">
        {MOCK_RECOMMENDATIONS.map((rec) => (
          <CentreRecommendationCard
            key={rec.centre.id}
            rec={rec}
            isSelected={selectedId === rec.centre.id}
            onSelectCentre={(id) => setSelectedId(id)}
          />
        ))}
      </div>
    </div>
  );
}
