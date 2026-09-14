export interface PriorityFactor {
  id: string;
  name: string;
  weight: number;
  description: string;
  isConfigurable: boolean;
}

export type AdjustmentCategory = 
  | 'CENTRE_DELAY'
  | 'PERISHABLE_CROP'
  | 'SPECIAL_ASSISTANCE'
  | 'FARMER_DELAYED_ARRIVAL'
  | 'MISSED_SLOT_REALLOCATION';

export interface FairnessAdjustment {
  tokenId: string;
  farmerName: string;
  originalSlot: string;
  adjustedSlot: string;
  waitDurationMinutes: number;
  status: 'On time' | 'Adjusted' | 'Protected' | 'Normal';
  category: AdjustmentCategory;
  reason: string;
  fairnessProtectionApplied: boolean;
  scoreImpact: string;
}

export interface FairnessScore {
  overallScore: number;
  rating: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
  centreAdherencePercentage: number;
  protectedFarmersToday: number;
  explainableAdjustmentsCount: number;
  factors: PriorityFactor[];
}
