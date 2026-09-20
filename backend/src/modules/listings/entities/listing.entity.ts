export class Listing {
  id: string;
  farmerId: string;
  stockistId: string;
  cropId: string;
  quantityAvailable: number;
  price: number;
  status: string;
  createdAt: Date;
}

// Database column mapping (snake_case):
// id, farmer_id, stockist_id, crop_id, quantity_available, price, status, created_at
