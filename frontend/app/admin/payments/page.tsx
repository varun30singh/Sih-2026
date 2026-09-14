'use client';

import React from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments';
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck 
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const totalDisbursed = MOCK_PAYMENTS.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = MOCK_PAYMENTS.reduce((sum, p) => sum + p.pendingAmount, 0);

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CreditCard className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-blue-400">
              Financial Treasury
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Direct Benefit Transfer (DBT) Clearance Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Public Financial Management System (PFMS) reconciliation and Aadhaar Payment Bridge disbursements.
          </p>
        </div>

        <Badge variant="success" size="md">
          PFMS Gateway Online ✓
        </Badge>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard variant="dark" className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Ledger Amount</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatCurrency(totalDisbursed + totalPending)}
          </p>
          <span className="text-xs text-slate-400">Total MSP grain value today</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs uppercase font-bold text-emerald-400 block">Disbursed (Settled)</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalDisbursed)}
          </p>
          <span className="text-xs text-slate-400">Credited to farmer bank accounts</span>
        </GlassCard>

        <GlassCard variant="dark" className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs uppercase font-bold text-amber-400 block">Pending Treasury Approval</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {formatCurrency(totalPending)}
          </p>
          <span className="text-xs text-slate-400">Within 48-hour SLA</span>
        </GlassCard>
      </div>

      {/* Payments Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Disbursement Batch Ledger</h3>
          <span className="text-xs text-slate-400">Showing {MOCK_PAYMENTS.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Farmer Name</th>
                <th className="py-2.5 px-3">Lot ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Bank Destination</th>
                <th className="py-2.5 px-3">PFMS Ref</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_PAYMENTS.map((p) => {
                const isDisbursed = p.status === 'DISBURSED';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/60">
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{p.farmerName}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{p.procurementId}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200 block font-medium">{p.bankName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.accountNumberMasked}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.pfmsReference}</td>
                    <td className="py-3 px-3">
                      {isDisbursed ? (
                        <Badge variant="success" size="sm">
                          Disbursed ✓
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" dot={true}>
                          {p.status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
