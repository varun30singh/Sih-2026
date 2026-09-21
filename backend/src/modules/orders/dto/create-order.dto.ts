export class CreateOrderDto {
  listingId: number;
  buyerId: number;
  brokerId: number;
  quantity: number;
  amount: number;
  status?: string;
}