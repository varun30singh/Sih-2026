export type CentreStatus = 'optimal' | 'moderate' | 'congested' | 'critical';

export interface CentreCapacity {
  currentLoad: number;
  maxCapacity: number;
  percentage: number;
  truckSlotsOccupied: number;
  truckSlotsTotal: number;
}

export interface ProcessingMetrics {
  avgMinutesPerFarmer: number;
  expectedMinutesPerFarmer: number;
  deviationPercentage: number;
  activeCounters: number;
  todayClearedCount: number;
}

export interface Centre {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  distanceKm: number;
  queueCount: number;
  processingMetrics: ProcessingMetrics;
  capacity: CentreCapacity;
  status: CentreStatus;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openHours: string;
  facilities: string[];
  recommendationScore: number;
}
