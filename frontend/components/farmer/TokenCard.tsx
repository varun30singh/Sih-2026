'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DigitalToken } from '@/types';
import { GlassCard, Badge, Button } from '@/components/ui';
import { 
  QrCode, 
  Clock, 
  MapPin, 
  Calendar, 
  Wheat, 
  Scale, 
  Download, 
  Navigation, 
  Eye, 
  ShieldCheck,
  CheckCircle2,
  Printer
} from 'lucide-react';

interface TokenCardProps {
  token: DigitalToken;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = () => {
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <GlassCard
        variant="light"
        className="p-0 overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl"
      >
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-400/30">
            Govt. of India • MSP Procurement Pass
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">MandiSetu Digital Token</h2>
          <p className="text-xs text-emerald-100 opacity-90 mt-0.5">Verified e-Procurement Pass</p>

          <div className="mt-4 inline-block bg-white text-slate-950 px-6 py-3 rounded-2xl shadow-xl border-2 border-emerald-300">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Token Number</span>
            <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-emerald-700">
              {token.tokenId}
            </span>
          </div>

          <div className="mt-3">
            <Badge variant="success" size="sm" dot={true}>
              🟢 ON TRACK
            </Badge>
          </div>
        </div>

        {/* Notched perforated separator */}
        <div className="relative h-6 bg-slate-50 dark:bg-slate-950 flex items-center justify-between px-4 border-y border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 -ml-6" />
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            NON-TRANSFERABLE OFFICIAL TOKEN
          </div>
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 -mr-6" />
        </div>

        {/* Pass Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* QR Code & Status Block */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            {/* Visual QR Code Placeholder */}
            <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center justify-center shrink-0 text-center">
              <QrCode className="w-24 h-24 text-slate-900" />
              <span className="text-[9px] font-mono font-bold text-slate-500 -mt-1">SCAN AT GATE</span>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Farmers Ahead in Line</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {token.farmersAhead} Farmers
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-500">Estimated Wait</span>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {token.estimatedWaitMinutes} minutes
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Recommended Arrival</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {token.recommendedArrival}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Procurement Centre
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {token.centreName}
              </p>
              <p className="text-[11px] text-slate-500">{token.centreAddress}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Date & Time Window
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {token.date}
              </p>
              <p className="text-[11px] text-slate-500">Slot: {token.slotTime}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                Crop Declared
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {token.crop}
              </p>
              <p className="text-[11px] text-slate-500">MSP: ₹2,275 / Quintal</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                Quantity Quota
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {token.quantityKg} kg (25 Quintals)
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">Land Quota Verified ✓</p>
            </div>
          </div>

          {/* Fairness Protection Banner */}
          {token.fairnessProtected && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Operational Fairness Guarantee Active:</strong> In case of mandi weighbridge delays, your token is automatically protected from missed-slot penalties.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/farmer/queue" className="w-full sm:flex-1">
              <Button size="lg" variant="primary" className="w-full" leftIcon={<Eye className="w-4 h-4" />}>
                Track Live Queue
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleDownload}
              leftIcon={isDownloaded ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
            >
              {isDownloaded ? 'Downloaded ✓' : 'Download Pass'}
            </Button>

            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="ghost" className="w-full sm:w-auto" leftIcon={<Navigation className="w-4 h-4" />}>
                Directions
              </Button>
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
