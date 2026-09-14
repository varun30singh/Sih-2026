import { Injectable, createSuccessResponse } from '../../common';

@Injectable()
export class BookingsService {
  private bookings: any[] = [];

  create(bookingData: any) {
    const booking = {
      id: `book-${Date.now().toString().slice(-6)}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    this.bookings.push(booking);
    return createSuccessResponse(booking, 'Slot booked successfully');
  }

  findByFarmer(farmerId: string) {
    return createSuccessResponse(this.bookings.filter(b => b.farmerId === farmerId));
  }
}
