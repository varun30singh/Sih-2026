'use client';

import React from 'react';
import { DigitalTwinVisualizer } from '@/components/admin/DigitalTwinVisualizer';
import { MOCK_DIGITAL_TWIN } from '@/lib/mock-data/digital-twin';
import { Badge } from '@/components/common/Badge';

export default function DigitalTwinPage() {
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            Core SIH Differentiator
          </Badge>
          <span className="text-xs text-slate-400">Live Virtual Mandi Infrastructure Model</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Mandi Digital Twin 3D Telemetry Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Visual twin mapping the physical procurement pipeline: Entry Gate → Registration → Verification (Moisture Assay) → Electronic Weighbridge → Bagging Bay → Exit. Bottlenecks pulse dynamically in red.
        </p>
      </div>

      <DigitalTwinVisualizer data={MOCK_DIGITAL_TWIN} />
    </div>
  );
}
