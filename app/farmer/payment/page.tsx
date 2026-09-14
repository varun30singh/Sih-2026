'use client';

import React from 'react';
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Landmark, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function FarmerPaymentPage() {
  const payments = MOCK_PAYMENTS.slice(0, 2); // Farmer-001 records

  const totalAmount = payments.reduce((acc, p) => acc + p.totalAmount, 0);
  const paidAmount = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const pendingAmount = payments.reduce((acc, p) => acc + p.pendingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            PFMS & Aadhaar Payment Bridge (APB)
          </Badge>
          <span className="text-xs text-slate-500">Government Direct Benefit Transfer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          MSP Payment & Disbursement Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track official Minimum Support Price payments credited directly into your verified bank account without middlemen or delays.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Total MSP Amount
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalAmount)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Across 2 procurement lots</p>
        </GlassCard>

        <GlassCard className="p-6 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
            Disbursed to Bank (Paid)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {formatCurrency(paidAmount)}
          </h3>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1">
            Credited via Aadhaar Bridge ✓
          </p>
        </GlassCard>

        <GlassCard className="p-6 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
            Processing in Treasury (Pending)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(pendingAmount)}
          </h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1">
            Expected: Within 48 Hours
          </p>
        </GlassCard>
      </div>

      {/* Payment Transactions Ledger */}
      <GlassCard className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              Direct Benefit Transfer (DBT) Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified PFMS government disbursement records.
            </p>
          </div>
          <Badge variant="info" size="sm">
            Aadhaar Linked
          </Badge>
        </div>

        <div className="space-y-4">
          {payments.map((p) => {
            const isDone = p.status === 'DISBURSED';
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {p.transactionId}
                      </span>
                      {isDone ? (
                        <Badge variant="success" size="sm">
                          Disbursed to Bank ✓
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" dot={true}>
                          Treasury Processing
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lot #{p.procurementId} • {p.crop} ({p.quantityQuintals} Quintals @ ₹{p.mspRate}/Qtl)
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Net Amount</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Destination Bank Account</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.bankName}
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      A/C: {p.accountNumberMasked} (IFSC: {p.ifscCode})
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block">PFMS Reference</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {p.pfmsReference}
                    </span>
                    <p className="text-[11px] text-slate-500">Public Financial Management System</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Settlement Date</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.disbursedDate || p.expectedDate}
                    </span>
                    <p className="text-[11px] text-slate-500">{p.remarks}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
