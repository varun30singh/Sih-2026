import { Controller, Get, Post, Param, Body } from '../../common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createBooking(@Body() body: any) {
    return this.bookingsService.create(body);
  }

  @Get('farmer/:farmerId')
  getBookingsByFarmer(@Param('farmerId') farmerId: string) {
    return this.bookingsService.findByFarmer(farmerId);
  }
}
