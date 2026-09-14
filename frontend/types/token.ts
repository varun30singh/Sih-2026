export type TokenStatus = 
  | 'ON_TRACK'
  | 'APPROACHING'
  | 'NOW_SERVING'
  | 'DELAYED'
  | 'PROTECTED_DELAY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ArrivalAlert {
  id: string;
  stage: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  timestamp: string;
  channels: ('SMS' | 'IVR' | 'APP')[];
  isRead: boolean;
}

export interface DigitalToken {
  tokenId: string;
  farmerId: string;
  farmerName: string;
  mobile: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  date: string;
  slotTime: string;
  crop: string;
  quantityKg: number;
  status: TokenStatus;
  farmersAhead: number;
  estimatedWaitMinutes: number;
  recommendedArrival: string;
  currentTurnServing: string;
  qrCodeData: string;
  generatedAt: string;
  fairnessProtected?: boolean;
  alternativeCentreAvailable?: boolean;
  alternativeCentreName?: string;
  alertsHistory: ArrivalAlert[];
}
