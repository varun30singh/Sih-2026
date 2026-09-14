'use client';

import React from 'react';
import { QueueTracker } from '@/components/farmer/QueueTracker';
import { MOCK_QUEUE_ENTRIES, MOCK_LIVE_QUEUE_STATE } from '@/lib/mock-data/queue';
import { Badge } from '@/components/common/Badge';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function FarmerQueuePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" size="sm">
            Live Mandi Feed
          </Badge>
          <span className="text-xs text-slate-500">Centre #14 — Hapur Central Mandi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Live Procurement Queue Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Watch real-time token advancement. Automated Just-In-Time dispatch calculates your exact departure time so you avoid on-site queue fatigue.
        </p>
      </div>

      {/* Main Queue Component */}
      <QueueTracker
        entries={MOCK_QUEUE_ENTRIES}
        queueState={MOCK_LIVE_QUEUE_STATE}
        userTokenId="M-142"
      />
    </div>
  );
}
