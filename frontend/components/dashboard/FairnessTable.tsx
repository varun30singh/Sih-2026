'use client';

import React, { useState } from 'react';
import { FairnessScore, FairnessAdjustment } from '@/types';
import { GlassCard, Badge, Button } from '@/components/ui';
import { 
  Scale, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Settings2,
  Sliders
} from 'lucide-react';

interface FairnessTableProps {
  scoreData: FairnessScore;
  adjustments: FairnessAdjustment[];
}

export const FairnessTable: React.FC<FairnessTableProps> = ({
  scoreData,
  adjustments,
}) => {
  const [selectedAdjustment, setSelectedAdjustment] = useState<FairnessAdjustment | null>(adjustments[2]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Centre Delay Protection Showcase */}
      <GlassCard className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-500/40 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Mandi Operational Delay Protection Mechanism
              </h3>
              <Badge variant="protected" size="sm">
                Active Protocol
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              If the procurement centre itself causes delays, farmers do <strong>NOT</strong> lose their slot or suffer penalties. 
              The fairness engine automatically attaches protection flags and adjusts just-in-time dispatch times.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800 text-center">
              <span className="text-[10px] uppercase font-bold text-teal-300 block">Shielded Today</span>
              <span className="text-2xl font-black text-teal-400">
                {scoreData.protectedFarmersToday} Farmers
              </span>
            </div>
          </div>
        </div>

        {/* Protection Flow Diagram */}
        <div className="mt-6 pt-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-3">
            Protected Turn Transition Flow
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Step 1</span>
              <p className="text-sm font-bold text-white mt-1">Original Slot</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">10:00 AM Window</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/60">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Step 2</span>
              <p className="text-sm font-bold text-amber-200 mt-1">Centre Delay Detected</p>
              <p className="text-xs text-amber-400 font-mono mt-0.5">+55% Sensor Lag</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Step 3</span>
              <p className="text-sm font-bold text-white mt-1">New Estimated Slot</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">11:20 AM Window</p>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-400/80 shadow-md">
              <span className="text-[10px] text-teal-300 uppercase font-bold block">Step 4</span>
              <p className="text-sm font-bold text-teal-200 mt-1">Fairness Protection</p>
              <p className="text-xs text-teal-300 font-bold mt-0.5">Applied ✓ No Penalty</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Fairness Scorecard & Policy Weight Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scorecard */}
        <GlassCard variant="dark" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-slate-400">Queue Health</span>
              <Badge variant="success" size="sm">
                Excellent
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Fairness Score
            </h3>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-emerald-400 font-mono">
                {scoreData.overallScore}
              </span>
              <span className="text-xl font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              MandiSetu evaluates adherence, operational lag shielding, and transparent recovery. 
              Zero black-box queue jumping.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>On-Time Slot Adherence:</span>
              <span className="font-bold text-white">{scoreData.centreAdherencePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Auditable Adjustments Today:</span>
              <span className="font-bold text-white">{scoreData.explainableAdjustmentsCount}</span>
            </div>
          </div>
        </GlassCard>

        {/* Policy Weights */}
        <GlassCard variant="dark" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Configurable Fairness Factors (State Mandi Rules)
              </h4>
              <p className="text-xs text-slate-400">
                Official rules defined by the State Department of Agriculture & Civil Supplies.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scoreData.factors.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{f.name}</span>
                  <span className="text-emerald-400 font-bold font-mono">{f.weight}% weight</span>
                </div>
                <p className="text-[11px] text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Transparent Queue Adjustments Ledger */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              Transparent Queue Adjustments & Reason Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every position adjustment is logged with an explainable administrative or operational reason.
            </p>
          </div>
          <Badge variant="info" size="sm">
            Auditable Log
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Token</th>
                <th className="py-3 px-3">Farmer</th>
                <th className="py-3 px-3">Original Slot</th>
                <th className="py-3 px-3">Adjusted</th>
                <th className="py-3 px-3">Wait</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Fairness Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {adjustments.map((adj) => {
                const isProtected = adj.fairnessProtectionApplied;
                return (
                  <tr
                    key={adj.tokenId}
                    onClick={() => setSelectedAdjustment(adj)}
                    className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      selectedAdjustment?.tokenId === adj.tokenId ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-black text-white text-sm">
                      {adj.tokenId}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{adj.farmerName}</td>
                    <td className="py-3 px-3 text-slate-400">{adj.originalSlot}</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{adj.adjustedSlot}</td>
                    <td className="py-3 px-3 text-amber-400">{adj.waitDurationMinutes}m</td>
                    <td className="py-3 px-3">
                      {isProtected ? (
                        <Badge variant="protected" size="sm">
                          Protected ✓
                        </Badge>
                      ) : adj.status === 'Adjusted' ? (
                        <Badge variant="warning" size="sm">
                          Adjusted
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={adj.reason}>
                      {adj.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Reason Deep Dive */}
        {selectedAdjustment && (
          <div className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
            <div className="flex items-center gap-2 text-white font-bold">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>
                Explainable Reason for Token {selectedAdjustment.tokenId} ({selectedAdjustment.farmerName}):
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">
              “{selectedAdjustment.reason}”
            </p>
            <p className="text-[11px] text-teal-400 pl-6 pt-1 font-semibold">
              Protection Status: {selectedAdjustment.scoreImpact}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
