import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const farmer = await this.prisma.farmers.findFirst({
      where: { user_id: userId },
    });

    if (!farmer) {
      throw new ForbiddenException('Only registered farmers can book slots');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.slots.findUnique({
        where: { id: createBookingDto.slot_id },
      });
      if (!slot) throw new NotFoundException('Slot not found');

      const crop = await tx.crops.findUnique({
        where: { id: createBookingDto.crop_id },
      });
      if (!crop) throw new NotFoundException('Crop not found');
      if (slot.booked_count >= slot.capacity) {
        throw new ConflictException('This slot is already full');
      }

      const tokenNumber = String(slot.booked_count + 1).padStart(3, '0');
      const booking = await tx.bookings.create({
        data: {
          farmer_id: farmer.id,
          slot_id: slot.id,
          crop_id: crop.id,
          quantity_estimate: createBookingDto.quantity_estimate,
          token_number: tokenNumber,
        },
      });

      await tx.slots.update({
        where: { id: slot.id },
        data: { booked_count: { increment: 1 } },
      });

      return booking;
    });
  }

  findByFarmer(farmerId: string) {
    return this.prisma.bookings.findMany({
      where: { farmer_id: Number(farmerId) },
      orderBy: { created_at: 'desc' },
    });
  }
}
