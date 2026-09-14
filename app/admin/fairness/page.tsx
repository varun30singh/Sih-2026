'use client';

import React from 'react';
import { FairnessTable } from '@/components/admin/FairnessTable';
import { MOCK_FAIRNESS_SCORE, MOCK_FAIRNESS_ADJUSTMENTS } from '@/lib/mock-data/fairness';
import { Badge } from '@/components/common/Badge';

export default function AdminFairnessPage() {
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            Core SIH Differentiator
          </Badge>
          <span className="text-xs text-slate-400">Auditable Turn Policy & Delay Shielding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Queue Fairness Engine & Operational Protection
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          MandiSetu replaces arbitrary queuing with an auditable fairness framework. When equipment or staff slowdowns occur, farmers are automatically shielded against missed-slot penalties.
        </p>
      </div>

      <FairnessTable
        scoreData={MOCK_FAIRNESS_SCORE}
        adjustments={MOCK_FAIRNESS_ADJUSTMENTS}
      />
    </div>
  );
}
