'use client';

import React from 'react';
import { ProcurementTimeline } from '@/components/procurement';
import { MOCK_PROCUREMENT_RECORD } from '@/lib/mock-data/procurement';
import { Badge } from '@/components/ui';

export default function FarmerProcurementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info" size="sm">
            FCI / State Civil Supplies Ledger
          </Badge>
          <span className="text-xs text-slate-500">End-to-End Grain Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Procurement Lifecycle Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Follow your harvest through moisture quality check, electronic gross/tare weighbridge recording, and DBT invoice generation.
        </p>
      </div>

      <ProcurementTimeline record={MOCK_PROCUREMENT_RECORD} />
    </div>
  );
}
