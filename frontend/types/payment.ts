export type PaymentStatus = 
  | 'PENDING'
  | 'VERIFIED'
  | 'PROCESSING'
  | 'DISBURSED'
  | 'FAILED';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  procurementId: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantityQuintals: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  mspRate: number;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  status: PaymentStatus;
  pfmsReference: string;
  expectedDate: string;
  disbursedDate?: string;
  remarks: string;
}
