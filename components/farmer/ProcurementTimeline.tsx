import React from 'react';
import { ProcurementRecord } from '@/types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  FileText, 
  Scale, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  IndianRupee,
  Layers
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProcurementTimelineProps {
  record: ProcurementRecord;
}

export const ProcurementTimeline: React.FC<ProcurementTimelineProps> = ({ record }) => {
  return (
    <div className="space-y-6">
      {/* Top Meta Summary */}
      <GlassCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Procurement ID
              </span>
              <Badge variant="info" size="sm">
                Active Batch
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {record.procurementId}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Net Payable (MSP)
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(record.netPayableAmount)}
            </p>
          </div>
        </div>

        {/* Quick parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Crop & Quality</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {record.crop}
            </span>
            <p className="text-[11px] text-emerald-600">Moisture: {record.moisturePercent}% (FAQ Pass)</p>
          </div>

          <div>
            <span className="text-slate-400 block">Quantity Weighment</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {record.quantityQuintals} Quintals
            </span>
            <p className="text-[11px] text-slate-400">Slip #{record.weighmentSlipNumber}</p>
          </div>

          <div>
            <span className="text-slate-400 block">Procurement Centre</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate block">
              {record.centreName}
            </span>
            <p className="text-[11px] text-slate-400">Hapur District</p>
          </div>

          <div>
            <span className="text-slate-400 block">Current Status</span>
            <Badge variant="warning" size="sm" dot={true}>
              Stage 5: Weighing in Progress
            </Badge>
          </div>
        </div>
      </GlassCard>

      {/* 8-Stage Lifecycle Timeline */}
      <GlassCard className="p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Mandi Procurement Lifecycle Progress
        </h3>

        <div className="relative">
          {/* Vertical tracking line */}
          <div className="absolute top-4 left-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700 -ml-[1px]" />

          <div className="space-y-6">
            {record.stages.map((stage, idx) => {
              const isCompleted = stage.completed;
              const isActive = stage.active;

              return (
                <div key={stage.stage} className="relative flex items-start gap-4 sm:gap-6 group">
                  {/* Step Icon Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100 dark:ring-emerald-950'
                        : isActive
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Card */}
                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-md ring-1 ring-amber-400/30'
                        : isCompleted
                        ? 'bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {stage.label}
                      </h4>
                      {isActive && (
                        <Badge variant="warning" size="sm">
                          Active Now
                        </Badge>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {stage.timestamp || 'Completed ✓'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {stage.description}
                    </p>

                    {stage.officerName && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        Authorized by: <strong>{stage.officerName}</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
