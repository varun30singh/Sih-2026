export type ZoneType = 
  | 'entry' 
  | 'registration' 
  | 'verification' 
  | 'weighing' 
  | 'procurement' 
  | 'exit';

export type ZoneStatus = 'available' | 'busy' | 'bottleneck';

export interface CentreZone {
  id: string;
  zoneType: ZoneType;
  title: string;
  subTitle: string;
  iconName: string;
  status: ZoneStatus;
  activeCount: number;
  capacityLimit: number;
  avgTimeMinutes: number;
  staffAssigned: number;
  equipmentStatus: string;
  notes: string;
  isBottleneck: boolean;
}

export interface DigitalTwinData {
  centreId: string;
  centreName: string;
  updatedAt: string;
  farmersInside: number;
  waitingFarmers: number;
  currentlyProcessing: number;
  completedToday: number;
  avgWaitTimeMinutes: number;
  todayCapacityPercentage: number;
  weighingMachineStatus: 'AVAILABLE' | 'BUSY' | 'CALIBRATING';
  staffAvailable: string;
  queueDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bottleneckZoneName?: string;
  processingSpeedScore: number;
  zones: CentreZone[];
}
