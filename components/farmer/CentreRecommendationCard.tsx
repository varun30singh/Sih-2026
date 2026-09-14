'use client';

import React, { useState } from 'react';
import { CentreRecommendation } from '@/types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Trophy, 
  Clock, 
  MapPin, 
  Users, 
  Gauge, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface CentreRecommendationCardProps {
  rec: CentreRecommendation;
  onSelectCentre?: (centreId: string) => void;
  isSelected?: boolean;
}

export const CentreRecommendationCard: React.FC<CentreRecommendationCardProps> = ({
  rec,
  onSelectCentre,
  isSelected = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(rec.isRecommended);

  const rankMedal = {
    1: '🥇 1st Choice',
    2: '🥈 2nd Option',
    3: '🥉 3rd Option',
    4: '4th Option',
    5: '5th Option',
  }[rec.rank];

  const overallScoreColor =
    rec.comparisonScores.overallScore >= 85
      ? 'text-emerald-600 bg-emerald-50 border-emerald-300'
      : rec.comparisonScores.overallScore >= 70
      ? 'text-amber-600 bg-amber-50 border-amber-300'
      : 'text-rose-600 bg-rose-50 border-rose-300';

  return (
    <GlassCard
      variant="light"
      className={`relative overflow-hidden transition-all duration-300 ${
        rec.isRecommended
          ? 'border-2 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900'
          : isSelected
          ? 'border-2 border-emerald-600 shadow-lg'
          : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      {/* Header with Rank & Recommended Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {rankMedal}
          </span>
          {rec.isRecommended && (
            <Badge variant="success" size="md" dot={true}>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              AI Best Match
            </Badge>
          )}
          {rec.badge === 'High Congestion' && (
            <Badge variant="danger" size="md">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              High Congestion Warning
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Match Score</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${overallScoreColor}`}>
            {rec.comparisonScores.overallScore}/100
          </span>
        </div>
      </div>

      {/* Centre Name & Address */}
      <div className="mt-4 mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {rec.centre.name}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {rec.centre.address}
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] text-slate-500 block">Distance</span>
          <span className="text-base font-black text-slate-900 dark:text-white">
            {rec.metrics.distanceKm} km
          </span>
          <p className="text-[10px] text-slate-400">~{rec.metrics.roadTravelMinutes} min drive</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] text-slate-500 block">Farmers Waiting</span>
          <span
            className={`text-base font-black ${
              rec.metrics.waitingFarmers > 50
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {rec.metrics.waitingFarmers} in queue
          </span>
          <p className="text-[10px] text-slate-400">
            {rec.metrics.waitingFarmers > 50 ? 'Heavy line' : 'Fast clearance'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] text-slate-500 block">Avg. Service Speed</span>
          <span className="text-base font-black text-slate-900 dark:text-white">
            {rec.metrics.avgProcessingMinutes} min
          </span>
          <p className="text-[10px] text-slate-400">Per farmer weighment</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block">
            Estimated Total Time
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
            {rec.estimatedTotalTimeMinutes >= 60
              ? `${Math.floor(rec.estimatedTotalTimeMinutes / 60)}h ${rec.estimatedTotalTimeMinutes % 60}m`
              : `${rec.estimatedTotalTimeMinutes} min`}
          </span>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 font-medium">
            Travel + Mandi wait
          </p>
        </div>
      </div>

      {/* AI Recommendation Summary Box */}
      <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
        <strong className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
          💡 Intelligent Matching Insight:
        </strong>
        {rec.recommendationReason}
      </div>

      {/* "Why this centre?" Expandable Accordion */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 py-1"
        >
          <span>Why this centre? (Score Factor Breakdown)</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2.5 animate-in fade-in text-xs">
            {/* Factor Bars */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Queue Congestion Score</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {rec.comparisonScores.queueScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${rec.comparisonScores.queueScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Counter Processing Speed Score</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {rec.comparisonScores.speedScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full"
                  style={{ width: `${rec.comparisonScores.speedScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Distance & Transit Convenience</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {rec.comparisonScores.distanceScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${rec.comparisonScores.distanceScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Yard & Truck Capacity Compatibility</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {rec.comparisonScores.capacityScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${rec.comparisonScores.capacityScore}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Select Centre Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
        <Button
          size="md"
          variant={rec.isRecommended ? 'primary' : 'outline'}
          onClick={() => onSelectCentre && onSelectCentre(rec.centre.id)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isSelected ? 'Selected Centre ✓' : `Select ${rec.centre.name.split('—')[0]}`}
        </Button>
      </div>
    </GlassCard>
  );
};
