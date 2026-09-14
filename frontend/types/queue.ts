export type QueueStatus = 
  | 'serving'
  | 'waiting'
  | 'on_track'
  | 'approaching'
  | 'delayed'
  | 'hold'
  | 'skipped'
  | 'completed';

export interface QueueEntry {
  id: string;
  tokenId: string;
  farmerId: string;
  farmerName: string;
  mobile: string;
  crop: string;
  quantityKg: number;
  slotTime: string;
  estimatedArrival: string;
  estimatedServiceTime: string;
  farmersAhead: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  centreId: string;
  counterNumber?: number;
  fairnessScore: number;
  delayReason?: string;
  isProtected?: boolean;
}

export interface LiveQueueState {
  currentServingToken: string;
  currentServingFarmer: string;
  activeCounterCount: number;
  totalWaiting: number;
  avgServiceMinutes: number;
  predictedClearanceHours: number;
  centreDelayDetected: boolean;
  centreDelayMinutes: number;
}
