'use client';

import React from 'react';
import { HourlyMetric, CentreThroughput } from '@/lib/mock-data/analytics';

interface HourlyChartProps {
  data: HourlyMetric[];
  className?: string;
}

export const HourlyArrivalsChart: React.FC<HourlyChartProps> = ({ data, className = '' }) => {
  const maxArrivals = Math.max(...data.map((d) => Math.max(d.arrivals, d.completed)), 45);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold">Hourly Farmer Influx vs. Procurement Completed</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            Arrivals
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            Completed
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-700/60">
        {data.map((item) => {
          const arrivalHeight = (item.arrivals / maxArrivals) * 100;
          const completedHeight = (item.completed / maxArrivals) * 100;

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-white text-[10px] p-1.5 rounded-md shadow-lg z-20 pointer-events-none whitespace-nowrap">
                <span>{item.hour}</span>
                <span>Arr: {item.arrivals} | Done: {item.completed}</span>
              </div>

              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-400 rounded-t transition-all duration-300"
                  style={{ height: `${arrivalHeight}%` }}
                />
                <div
                  className="w-1/2 bg-blue-500 hover:bg-blue-400 rounded-t transition-all duration-300"
                  style={{ height: `${completedHeight}%` }}
                />
              </div>

              <span className="text-[9px] text-slate-400 font-mono rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                {item.hour.split(':')[0]} {item.hour.slice(-2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WaitTimeTrendChart: React.FC<HourlyChartProps> = ({ data }) => {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-slate-400 block">
        Average Wait Time (Minutes) Across Hours
      </span>

      <div className="h-40 flex items-end justify-between gap-1.5 pt-2 px-1 border-b border-slate-700/60">
        {data.map((item) => {
          const height = Math.min((item.avgWaitMins / 60) * 100, 100);
          const isBottleneck = item.avgWaitMins >= 40;

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div className="absolute -top-8 hidden group-hover:flex bg-slate-900 border border-slate-700 text-white text-[10px] p-1 rounded z-20 pointer-events-none">
                {item.avgWaitMins} mins
              </div>

              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isBottleneck
                    ? 'bg-amber-500 hover:bg-amber-400 shadow-sm shadow-amber-500/30'
                    : 'bg-emerald-600/70 hover:bg-emerald-500'
                }`}
                style={{ height: `${height}%` }}
              />

              <span className="text-[9px] text-slate-400 font-mono mt-1">
                {item.avgWaitMins}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MultiCentreThroughputTable: React.FC<{ data: CentreThroughput[] }> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <th className="py-2.5 px-3">Procurement Centre</th>
            <th className="py-2.5 px-3">Cleared Farmers</th>
            <th className="py-2.5 px-3">Tonnage</th>
            <th className="py-2.5 px-3">Avg Wait</th>
            <th className="py-2.5 px-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((c) => (
            <tr key={c.centreName} className="hover:bg-slate-800/50">
              <td className="py-2.5 px-3 font-semibold text-white">{c.centreName}</td>
              <td className="py-2.5 px-3 font-mono">{c.clearedFarmers}</td>
              <td className="py-2.5 px-3 font-mono">{c.tonnageProcured} T</td>
              <td className="py-2.5 px-3 font-mono text-amber-400">{c.avgWaitMins} min</td>
              <td className="py-2.5 px-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Optimal'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : c.status === 'Congested'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
