export type SlotStatus = 'available' | 'filling' | 'full' | 'delayed' | 'disabled';

export interface Slot {
  id: string;
  centreId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  utilizationPercent: number;
  status: SlotStatus;
  delayMinutes: number;
}

export interface DynamicSlotAlert {
  centreId: string;
  centreName: string;
  expectedMinutesPerFarmer: number;
  currentMinutesPerFarmer: number;
  delayPercentage: number;
  affectedFarmersCount: number;
  additionalWaitMinutes: number;
  recommendedAlternativeCentreId: string;
  recommendedAlternativeCentreName: string;
  alternativeDistanceKm: number;
  alternativeQueueCount: number;
  alternativeTotalMinutes: number;
  options: {
    id: 'reschedule' | 'move_farmers' | 'extend_hours' | 'keep_current';
    title: string;
    description: string;
    actionLabel: string;
  }[];
}
