export class Booking {
  id: string;
  farmerId: string;
  slotId: string;
  quantityEstimate: number;
  tokenNumber: string | number;
  status: string;
  bookedBy: string;
  createdAt: Date;
}

// Database column mapping (snake_case):
// id, farmer_id, slot_id, quantity_estimate, token_number, status, booked_by, created_at
