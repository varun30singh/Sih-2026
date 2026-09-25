import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateQueueDto, QueueStatus } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createQueueDto: CreateQueueDto) {
    await this.validateRelations(createQueueDto.booking_id, createQueueDto.centre_id);

    const queueItem = await this.prisma.queue.create({
      data: {
        booking_id: createQueueDto.booking_id,
        centre_id: createQueueDto.centre_id,
        status: (createQueueDto.status ?? QueueStatus.waiting) as $Enums.queue_status,
        entered_at: new Date(),
        called_at: createQueueDto.called_at ?? null,
      },
    });

    await this.auditLogService.log(
      null,
      'CREATE',
      'Queue',
      queueItem.id,
      {
        booking_id: queueItem.booking_id,
        centre_id: queueItem.centre_id,
        status: queueItem.status,
      },
    );

    return queueItem;
  }

  async findAll(filter?: { farmerId?: number; bookingId?: number; centreId?: number }) {
    if (filter?.farmerId !== undefined && isNaN(filter.farmerId)) {
      return [];
    }
    if (filter?.bookingId !== undefined && isNaN(filter.bookingId)) {
      return [];
    }
    if (filter?.centreId !== undefined && isNaN(filter.centreId)) {
      return [];
    }

    const where: any = {};

    if (filter?.farmerId !== undefined) {
      where.bookings = {
        OR: [
          { farmer_id: filter.farmerId },
          { farmers: { user_id: filter.farmerId } },
        ],
      };
    }

    if (filter?.bookingId !== undefined) {
      where.booking_id = filter.bookingId;
    }

    if (filter?.centreId !== undefined) {
      where.centre_id = filter.centreId;
    }

    const items = await this.prisma.queue.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        bookings: {
          include: {
            farmers: true,
            crops: true,
          },
        },
        procurement_centres: true,
      },
      orderBy: { id: 'desc' },
    });

    return items.map((item) => this.formatQueueEntry(item));
  }

  async findOne(id: number) {
    const queueItem = await this.prisma.queue.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            farmers: true,
            crops: true,
          },
        },
        procurement_centres: true,
      },
    });

    if (!queueItem) {
      throw new NotFoundException('Queue entry not found');
    }

    return this.formatQueueEntry(queueItem);
  }

  private formatQueueEntry(item: any) {
    const booking = item.bookings;
    const farmer = booking?.farmers;
    const crop = booking?.crops;
    const centre = item.procurement_centres;

    return {
      id: item.id,
      booking_id: item.booking_id,
      centre_id: item.centre_id,
      status: item.status,
      entered_at: item.entered_at,
      called_at: item.called_at,

      // Joined details
      token_number: booking?.token_number ?? null,
      farmer_id: booking?.farmer_id ?? null,
      farmer_name: farmer?.name ?? null,
      farmer_phone: farmer?.phone ?? null,
      farmer_village: farmer?.village ?? null,
      crop_id: booking?.crop_id ?? null,
      crop_name: crop?.name ?? null,
      commodity: crop?.name ?? null,
      quantity: booking?.quantity_estimate ? Number(booking.quantity_estimate) : null,
      quantity_estimate: booking?.quantity_estimate ? Number(booking.quantity_estimate) : null,
      centre_name: centre?.name ?? null,

      // Preserving full nested objects
      booking: booking
        ? {
            id: booking.id,
            slot_id: booking.slot_id,
            crop_id: booking.crop_id,
            token_number: booking.token_number,
            quantity_estimate: booking.quantity_estimate ? Number(booking.quantity_estimate) : null,
            status: booking.status,
            booked_by: booking.booked_by,
            farmer_name: farmer?.name ?? null,
            crop_name: crop?.name ?? null,
          }
        : null,
      procurement_centre: centre
        ? {
            id: centre.id,
            name: centre.name,
            location: centre.location,
          }
        : null,
    };
  }

  async update(id: number, updateQueueDto: UpdateQueueDto) {
    await this.findOne(id);

    const centreId = updateQueueDto.centre_id ?? (await this.prisma.queue.findUnique({ where: { id } }))!.centre_id;
    const bookingId = updateQueueDto.booking_id ?? (await this.prisma.queue.findUnique({ where: { id } }))!.booking_id;

    await this.validateRelations(bookingId, centreId);

    const queueItem = await this.prisma.queue.update({
      where: { id },
      data: {
        ...(updateQueueDto.booking_id !== undefined && {
          booking_id: updateQueueDto.booking_id,
        }),
        ...(updateQueueDto.centre_id !== undefined && {
          centre_id: updateQueueDto.centre_id,
        }),
        ...(updateQueueDto.status !== undefined && {
          status: updateQueueDto.status as $Enums.queue_status,
        }),
        ...(updateQueueDto.called_at !== undefined && {
          called_at: updateQueueDto.called_at,
        }),
      },
    });

    await this.auditLogService.log(null, 'UPDATE', 'Queue', queueItem.id, {
      status: queueItem.status,
      centre_id: queueItem.centre_id,
    });

    return queueItem;
  }

  async updateStatus(id: number, status: QueueStatus) {
    await this.findOne(id);

    const queueItem = await this.prisma.queue.update({
      where: { id },
      data: {
        status: status as $Enums.queue_status,
      },
    });

    await this.auditLogService.log(null, 'UPDATE', 'Queue', queueItem.id, {
      status: queueItem.status,
    });

    return queueItem;
  }

  async remove(id: number) {
    const queueItem = await this.findOne(id);
    const deleted = await this.prisma.queue.delete({
      where: { id },
    });

    await this.auditLogService.log(null, 'DELETE', 'Queue', deleted.id, {
      booking_id: deleted.booking_id,
      centre_id: deleted.centre_id,
    });

    return deleted;
  }

  private async validateRelations(bookingId: number, centreId: number) {
    const [bookingExists, centreExists] = await Promise.all([
      this.prisma.bookings.findUnique({ where: { id: bookingId } }),
      this.prisma.procurement_centres.findUnique({ where: { id: centreId } }),
    ]);

    if (!bookingExists) {
      throw new NotFoundException('Booking not found');
    }

    if (!centreExists) {
      throw new NotFoundException('Procurement centre not found');
    }
  }
}
