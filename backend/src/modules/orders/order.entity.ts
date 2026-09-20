export interface Order {
  id: number;
  listingId: number;
  buyerId: number;
  brokerId: number;
  quantity: number;
  amount: number;
  status: string;
  createdAt: Date;
}