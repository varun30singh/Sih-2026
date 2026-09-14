'use client';

import React from 'react';
import { TokenCard } from '@/components/farmer/TokenCard';
import { MOCK_ACTIVE_TOKEN_M142 } from '@/lib/mock-data/tokens';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck } from 'lucide-react';

export default function TokenPage() {
  const token = MOCK_ACTIVE_TOKEN_M142;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <Badge variant="success" size="sm">
          Govt. e-Procurement Pass
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Digital Token & Gate Entry Pass
        </h1>
        <p className="text-xs text-slate-500">
          Present this barcode at Mandi Gate #1 or use your registered mobile number for automatic ANPR entry.
        </p>
      </div>

      {/* Hero Token Card */}
      <TokenCard token={token} />
    </div>
  );
}
