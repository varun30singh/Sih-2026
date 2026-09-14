'use client';

import React from 'react';
import { DynamicSlotAlert } from '@/components/admin/DynamicSlotAlert';
import { MOCK_DYNAMIC_SLOT_ALERT } from '@/lib/mock-data/slots';
import { Badge } from '@/components/common/Badge';

export default function DynamicSlotsPage() {
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="danger" size="sm">
            Core SIH Differentiator
          </Badge>
          <span className="text-xs text-slate-400">Automated Bottleneck Detection & Mitigation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Dynamic Slot Adjustment & Congestion Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          When a mandi processes slower than benchmark, the system automatically detects queue buildup, calculates ripple effects across downstream slots, and formulates actionable reallocation interventions.
        </p>
      </div>

      <DynamicSlotAlert alertData={MOCK_DYNAMIC_SLOT_ALERT} />
    </div>
  );
}
