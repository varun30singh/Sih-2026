'use client';

import React, { useState } from 'react';
import { DigitalTwinData, CentreZone } from '@/types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Tractor, 
  UserCheck, 
  ClipboardCheck, 
  Scale, 
  PackageCheck, 
  DoorOpen, 
  AlertOctagon, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface DigitalTwinVisualizerProps {
  data: DigitalTwinData;
}

export const DigitalTwinVisualizer: React.FC<DigitalTwinVisualizerProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<CentreZone>(data.zones[2]); // Default to bottleneck zone
  const [isSimulating, setIsSimulating] = useState(false);

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tractor':
        return <Tractor className="w-6 h-6" />;
      case 'UserCheck':
        return <UserCheck className="w-6 h-6" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-6 h-6" />;
      case 'Scale':
        return <Scale className="w-6 h-6" />;
      case 'PackageCheck':
        return <PackageCheck className="w-6 h-6" />;
      case 'DoorOpen':
        return <DoorOpen className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getStatusBadge = (status: 'available' | 'busy' | 'bottleneck') => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            🟢 Available
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            🟡 Busy
          </span>
        );
      case 'bottleneck':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-700 animate-soft-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            🔴 Bottleneck
          </span>
        );
    }
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1200);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Telemetry KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Inside Mandi</span>
          <span className="text-xl font-black text-white">{data.farmersInside}</span>
          <span className="text-[9px] text-slate-500 block">Active farmers</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Waiting Queue</span>
          <span className="text-xl font-black text-amber-400">{data.waitingFarmers}</span>
          <span className="text-[9px] text-slate-500 block">In buffer & hall</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Processing Now</span>
          <span className="text-xl font-black text-emerald-400">{data.currentlyProcessing}</span>
          <span className="text-[9px] text-slate-500 block">Active weighment</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cleared Today</span>
          <span className="text-xl font-black text-slate-200">{data.completedToday}</span>
          <span className="text-[9px] text-emerald-400 block">Dispatched</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Wait Time</span>
          <span className="text-xl font-black text-amber-400">{data.avgWaitTimeMinutes} min</span>
          <span className="text-[9px] text-slate-500 block">6 min service</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Yard Capacity</span>
          <span className="text-xl font-black text-slate-200">{data.todayCapacityPercentage}%</span>
          <span className="text-[9px] text-amber-400 block">High utilization</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weighbridge</span>
          <span className="text-sm font-black text-emerald-400 block mt-1">🟢 AVAILABLE</span>
          <span className="text-[9px] text-slate-500 block">50T Calibrated</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Staff Deployed</span>
          <span className="text-xl font-black text-slate-200">{data.staffAvailable}</span>
          <span className="text-[9px] text-slate-500 block">Density: {data.queueDensity}</span>
        </div>
      </div>

      {/* Main Visual Centre Interactive Map */}
      <GlassCard variant="dark" className="p-6 sm:p-8 relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Centre #14 — Virtual Floor Plan & Flow Twin
              </h3>
              <Badge variant="danger" size="sm">
                1 Bottleneck Detected
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any stage in the flow pipeline to inspect queue density, staff allocation, and diagnostic telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulate}
              isLoading={isSimulating}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Simulate Live Influx
            </Button>
          </div>
        </div>

        {/* 6-Zone Flow Visualization Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 relative">
          {data.zones.map((zone, idx) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                  zone.isBottleneck
                    ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/30'
                    : isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Zone Step Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {getStatusBadge(zone.status)}
                  </div>

                  <div className="my-2 p-2.5 rounded-xl bg-slate-800/80 w-fit text-emerald-400">
                    {getZoneIcon(zone.iconName)}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{zone.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{zone.subTitle}</p>
                </div>

                {/* Live Count & Metric footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Occupancy</span>
                    <span className="font-mono font-bold text-white">
                      {zone.activeCount}/{zone.capacityLimit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Avg. Duration</span>
                    <span
                      className={`font-mono font-bold ${
                        zone.isBottleneck ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {zone.avgTimeMinutes} min
                    </span>
                  </div>
                </div>

                {/* Arrow connector for large screen */}
                {idx < data.zones.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-500 font-bold">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Zone Deep-Dive Inspection Panel */}
      <GlassCard variant="dark" className="p-6 bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400">
              {getZoneIcon(selectedZone.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Zone Diagnostic Telemetry
                </span>
                {getStatusBadge(selectedZone.status)}
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">{selectedZone.title}</h3>
              <p className="text-xs text-slate-400">{selectedZone.subTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedZone.isBottleneck && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 animate-spin" />
                Root Cause of Centre Delay (+55%)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Equipment & Sensor State</span>
            <p className="text-sm font-semibold text-slate-200 mt-1">
              {selectedZone.equipmentStatus}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Staff Assigned</span>
            <p className="text-sm font-semibold text-slate-200 mt-1">
              {selectedZone.staffAssigned} Officers on Duty
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Real-time Observations</span>
            <p className="text-sm font-semibold text-slate-200 mt-1">
              {selectedZone.notes}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
