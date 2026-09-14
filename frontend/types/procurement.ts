export type ProcurementStage = 
  | 'REGISTRATION'
  | 'SLOT_BOOKED'
  | 'ARRIVED'
  | 'VERIFICATION'
  | 'WEIGHING'
  | 'PROCUREMENT_COMPLETE'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED';

export interface StageProgress {
  stage: ProcurementStage;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  officerName?: string;
}

export interface ProcurementRecord {
  id: string;
  procurementId: string;
  tokenId: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  date: string;
  crop: string;
  quantityQuintals: number;
  moisturePercent: number;
  grade: 'FAQ (Fair Average Quality)' | 'Grade A';
  mspRatePerQuintal: number;
  grossAmount: number;
  deductions: number;
  netPayableAmount: number;
  weighmentSlipNumber: string;
  currentStage: ProcurementStage;
  stages: StageProgress[];
}
