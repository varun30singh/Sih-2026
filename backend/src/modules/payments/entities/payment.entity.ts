export class Payment {
  procurementId: string;
  amount: number;
  status: string;
  paymentMode: string;
  transactionRef: string;
  paidAt: Date;
}

// Database column mapping (snake_case):
// procurement_id, amount, status, payment_mode, transaction_ref, paid_at
