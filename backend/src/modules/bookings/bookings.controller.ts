import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Req() request: { user: { userId: number } },
  ) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get('farmer/:farmerId')
  getBookingsByFarmer(@Param('farmerId') farmerId: string) {
    return this.bookingsService.findByFarmer(farmerId);
  }
}
