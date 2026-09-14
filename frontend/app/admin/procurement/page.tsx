'use client';

import React from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_PROCUREMENT_RECORD } from '@/lib/mock-data/procurement';
import { formatCurrency } from '@/lib/utils';
import { 
  PackageCheck, 
  Scale, 
  FileText, 
  Printer, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function AdminProcurementPage() {
  const record = MOCK_PROCUREMENT_RECORD;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <PackageCheck className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-teal-400">
              FCI & Civil Supplies Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            MSP Procurement & Weighment Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official grain intake records with certified electronic weighbridge gross/tare values and moisture assays.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
          className="bg-slate-800 border-slate-700 text-white"
        >
          Print Daily Ledger
        </Button>
      </div>

      {/* Hero Highlight Record */}
      <GlassCard variant="dark" className="p-6 border-l-4 border-l-emerald-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Latest Active Batch</span>
              <Badge variant="warning" size="sm" dot={true}>
                At Weighbridge Desk #1
              </Badge>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mt-1">
              Lot #{record.procurementId}
            </h3>
            <p className="text-xs text-slate-400">
              Farmer: <strong>{record.farmerName}</strong> • Token: <strong className="text-emerald-400">{record.tokenId}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block">Total MSP Valuation</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(record.netPayableAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block">Moisture Assay</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
              {record.moisturePercent}% (FAQ Compliant)
            </span>
            <span className="text-[10px] text-slate-500">Threshold: &lt;12.0%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block">Quantity Weighment</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {record.quantityQuintals} Quintals
            </span>
            <span className="text-[10px] text-slate-500">Slip #{record.weighmentSlipNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block">Quality Grade</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {record.grade}
            </span>
            <span className="text-[10px] text-slate-500">Government FAQ Standard</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block">DBT Status</span>
            <span className="font-bold text-amber-400 text-sm mt-0.5 block">
              Invoiced to PFMS
            </span>
            <span className="text-[10px] text-slate-500">Direct Bank Credit</span>
          </div>
        </div>
      </GlassCard>

      {/* Procurement Ledger Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Procurement ID</th>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Moisture</th>
                <th className="py-2.5 px-3">Gross Value</th>
                <th className="py-2.5 px-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/60">
                <td className="py-3 px-3 font-mono font-bold text-white">
                  {record.procurementId}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                  {record.tokenId}
                </td>
                <td className="py-3 px-3 font-medium text-slate-200">{record.farmerName}</td>
                <td className="py-3 px-3 text-slate-300">{record.crop}</td>
                <td className="py-3 px-3 font-mono text-slate-200">{record.quantityQuintals} Qtl</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">{record.moisturePercent}%</td>
                <td className="py-3 px-3 font-mono text-white font-bold">
                  {formatCurrency(record.netPayableAmount)}
                </td>
                <td className="py-3 px-3">
                  <Badge variant="warning" size="sm">
                    Weighing Active
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
