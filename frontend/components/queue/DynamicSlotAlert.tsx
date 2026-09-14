'use client';

import React, { useState } from 'react';
import { DynamicSlotAlert as DynamicSlotAlertType } from '@/types';
import { GlassCard, Badge, Button } from '@/components/ui';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  ArrowRightLeft, 
  CalendarClock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building2
} from 'lucide-react';

interface DynamicSlotAlertProps {
  alertData: DynamicSlotAlertType;
  onApplyAction?: (actionId: string) => void;
}

export const DynamicSlotAlert: React.FC<DynamicSlotAlertProps> = ({
  alertData,
  onApplyAction,
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleExecute = (actionId: string, actionLabel: string) => {
    setSelectedAction(actionId);
    if (onApplyAction) onApplyAction(actionId);
    setActionSuccess(`Action Applied: ${actionLabel}. Farmers automatically alerted via SMS/IVR.`);
    setTimeout(() => {
      setActionSuccess(null);
      setSelectedAction(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* High-visibility Warning Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-500/80 shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  Real-time Operational Anomaly
                </span>
                <Badge variant="danger" size="sm">
                  Lag Detected
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                ⚠️ Centre #14 is Operating {alertData.delayPercentage}% Slower than Expected
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Document verification & moisture sensor assay calibration lag has reduced throughput. 
                Downstream wait queues are backing up by <strong>+{alertData.additionalWaitMinutes} minutes</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Affected Queue</span>
              <span className="text-2xl font-black text-amber-400">
                {alertData.affectedFarmersCount} Farmers
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">Benchmark Rate</span>
            <span className="text-lg font-black text-slate-200">
              {alertData.expectedMinutesPerFarmer} min / farmer
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Official Standard</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">Current Operating Speed</span>
            <span className="text-lg font-black text-rose-400">
              {alertData.currentMinutesPerFarmer} min / farmer
            </span>
            <span className="text-[10px] text-rose-300 block mt-0.5">+{alertData.delayPercentage}% slowdown</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">Cumulative Delay</span>
            <span className="text-lg font-black text-amber-400">
              +{alertData.additionalWaitMinutes} min (1h 18m)
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Per downstream token</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">Nearby Relief Mandi</span>
            <span className="text-sm font-bold text-emerald-400 truncate block">
              {alertData.recommendedAlternativeCentreName.split('—')[0]}
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              14 km away • 12 in queue
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert Toast */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">{actionSuccess}</span>
          </div>
          <span className="text-xs bg-emerald-700 px-2 py-1 rounded-md font-mono">
            Dispatched via SMS / IVR
          </span>
        </div>
      )}

      {/* 4 Recommended Mitigation Actions */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-emerald-400" />
              Algorithmic Mitigation Options
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an intervention to dynamically realign the queue without farmer distress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertData.options.map((opt) => {
            const isTargeted = opt.id === 'move_farmers';
            return (
              <div
                key={opt.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isTargeted
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                    {isTargeted && (
                      <Badge variant="success" size="sm">
                        Recommended (Fastest)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {opt.id === 'move_farmers' ? 'Zero-waiting load balancing' : 'Policy compliant'}
                  </span>
                  <Button
                    size="sm"
                    variant={isTargeted ? 'primary' : 'outline'}
                    onClick={() => handleExecute(opt.id, opt.actionLabel)}
                    isLoading={selectedAction === opt.id}
                  >
                    {opt.actionLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Preview of Farmer-Facing Alert Experience */}
      <GlassCard variant="light" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          Preview: What the Affected Farmer Sees on their Phone
        </h4>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>⚠️ Your slot may be delayed</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              “Centre #14 is currently processing slower than expected. To avoid waiting, you can switch to <strong>Centre #12 (Modinagar)</strong>.”
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Distance: 14 km</span>
              <span>Queue: 12 farmers</span>
              <span>Total Est. Time: 48 min</span>
            </div>
          </div>

          <Button size="sm" variant="primary" className="shrink-0">
            View Alternative Mandi
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
