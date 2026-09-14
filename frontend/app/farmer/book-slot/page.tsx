'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_RECOMMENDATIONS } from '@/lib/mock-data/recommendations';
import { MOCK_SLOTS } from '@/lib/mock-data/slots';
import { 
  Wheat, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function BookSlotPage() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState('Wheat (Kalyan Sona)');
  const [quantityKg, setQuantityKg] = useState('2500');
  const [selectedDate, setSelectedDate] = useState('2026-04-12');
  const [selectedCentreId, setSelectedCentreId] = useState('centre-12'); // default to AI recommended Centre #12
  const [selectedSlotId, setSelectedSlotId] = useState('slot-2');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/farmer/token');
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            Step 1 of 2
          </Badge>
          <span className="text-xs text-slate-500">Government MSP Harvest Procurement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Book Procurement Slot & Issue Token
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select crop details, choose from algorithmically ranked mandis, and pick an optimal time window.
        </p>
      </div>

      {/* 1. Select Crop & Quantity */}
      <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Wheat className="w-4 h-4 text-emerald-600" />
          1. Crop Type & Harvest Quantity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="Wheat (Kalyan Sona)">Wheat (FAQ Grade) — MSP ₹2,275 / Qtl</option>
              <option value="Mustard">Mustard — MSP ₹5,650 / Qtl</option>
              <option value="Chana (Gram)">Chana (Gram) — MSP ₹5,440 / Qtl</option>
              <option value="Paddy (Common)">Paddy (Common) — MSP ₹2,183 / Qtl</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Estimated Quantity (kg)
            </label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
            <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
              = {Number(quantityKg) / 100} Quintals (Estimated MSP Value: ₹{(Number(quantityKg) / 100) * 2275})
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Delivery Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
          </div>
        </div>
      </GlassCard>

      {/* 2. Select Procurement Centre with Intelligent Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            2. Choose Procurement Centre (Ranked by AI Recommendation Engine)
          </h3>
          <Link href="/farmer/smart-centres" className="text-xs text-emerald-600 font-bold hover:underline">
            Deep Match Comparison →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_RECOMMENDATIONS.map((rec) => {
            const isSelected = selectedCentreId === rec.centre.id;
            return (
              <div
                key={rec.centre.id}
                onClick={() => setSelectedCentreId(rec.centre.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-600 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Rank #{rec.rank}
                    </span>
                    {rec.isRecommended && (
                      <Badge variant="success" size="sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Fastest Mandi
                      </Badge>
                    )}
                    {rec.badge === 'High Congestion' && (
                      <Badge variant="danger" size="sm">
                        Congested
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-600">
                    Match: {rec.comparisonScores.overallScore}/100
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {rec.centre.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{rec.centre.address}</p>

                <div className="grid grid-cols-3 gap-2 my-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Distance</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {rec.metrics.distanceKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Waiting Queue</span>
                    <span
                      className={`font-bold ${
                        rec.metrics.waitingFarmers > 50 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {rec.metrics.waitingFarmers} farmers
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Wait</span>
                    <span className="font-bold text-amber-600">
                      {rec.metrics.estimatedWaitMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  {rec.recommendationReason}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Select Time Slot */}
      <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          3. Select Arrival Time Window (Zero-Wait Staggered Buffer)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOCK_SLOTS.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isFull = slot.status === 'full';

            return (
              <button
                key={slot.id}
                disabled={isFull}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isFull
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200'
                    : isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                <span className="text-xs block">{slot.startTime}</span>
                <span className="text-[10px] opacity-80 block">to {slot.endTime}</span>
                <span
                  className={`text-[9px] font-bold uppercase mt-1 inline-block px-1.5 py-0.2 rounded ${
                    isFull
                      ? 'bg-slate-300 text-slate-700'
                      : isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {isFull ? 'Filled' : `${slot.available} left`}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Bottom Confirmation Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              Fairness Protection & Just-In-Time Tracking Guaranteed
            </span>
            <span className="text-slate-500">
              You will receive SMS turn alerts so you do not need to wait at the mandi.
            </span>
          </div>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={handleBooking}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Confirm Slot & Generate Token M-142
        </Button>
      </div>
    </div>
  );
}
