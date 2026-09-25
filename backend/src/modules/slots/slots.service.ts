import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createSlotDto: CreateSlotDto) {
    await this.validateCentreAndCrop(createSlotDto.centre_id, createSlotDto.crop_id);
    this.validateBookedCountAgainstCapacity(
      createSlotDto.booked_count ?? 0,
      createSlotDto.capacity,
    );

    const slot = await this.prisma.slots.create({
      data: {
        centre_id: createSlotDto.centre_id,
        crop_id: createSlotDto.crop_id,
        date: this.toDateOnly(createSlotDto.date),
        start_time: this.toTime(createSlotDto.start_time),
        end_time: this.toTime(createSlotDto.end_time),
        capacity: createSlotDto.capacity,
        booked_count: createSlotDto.booked_count ?? 0,
      },
    });

    await this.auditLogService.log(null, 'CREATE', 'Slot', slot.id, {
      centre_id: slot.centre_id,
      crop_id: slot.crop_id,
      date: slot.date,
    });

    return slot;
  }

  async findAll(centreId?: number) {
    if (centreId !== undefined && isNaN(centreId)) {
      return [];
    }
    return this.prisma.slots.findMany({
      where: centreId !== undefined ? { centre_id: centreId } : undefined,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const slot = await this.prisma.slots.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }

  async update(id: number, updateSlotDto: UpdateSlotDto) {
    const existing = await this.findOne(id);

    const centreId = updateSlotDto.centre_id ?? existing.centre_id;
    const cropId = updateSlotDto.crop_id ?? existing.crop_id;
    const capacity = updateSlotDto.capacity ?? existing.capacity;
    const bookedCount = updateSlotDto.booked_count ?? existing.booked_count;

    await this.validateCentreAndCrop(centreId, cropId);
    this.validateBookedCountAgainstCapacity(bookedCount, capacity);

    const slot = await this.prisma.slots.update({
      where: { id },
      data: {
        ...(updateSlotDto.centre_id !== undefined && {
          centre_id: updateSlotDto.centre_id,
        }),
        ...(updateSlotDto.crop_id !== undefined && {
          crop_id: updateSlotDto.crop_id,
        }),
        ...(updateSlotDto.date !== undefined && {
          date: this.toDateOnly(updateSlotDto.date),
        }),
        ...(updateSlotDto.start_time !== undefined && {
          start_time: this.toTime(updateSlotDto.start_time),
        }),
        ...(updateSlotDto.end_time !== undefined && {
          end_time: this.toTime(updateSlotDto.end_time),
        }),
        ...(updateSlotDto.capacity !== undefined && {
          capacity: updateSlotDto.capacity,
        }),
        ...(updateSlotDto.booked_count !== undefined && {
          booked_count: updateSlotDto.booked_count,
        }),
      },
    });

    await this.auditLogService.log(null, 'UPDATE', 'Slot', slot.id, {
      centre_id: slot.centre_id,
      crop_id: slot.crop_id,
      capacity: slot.capacity,
    });

    return slot;
  }

  async remove(id: number) {
    const slot = await this.findOne(id);
    const deleted = await this.prisma.slots.delete({
      where: { id },
    });

    await this.auditLogService.log(null, 'DELETE', 'Slot', deleted.id, {
      centre_id: deleted.centre_id,
      crop_id: deleted.crop_id,
    });

    return deleted;
  }

  private async validateCentreAndCrop(centreId: number, cropId: number) {
    const [centreExists, cropExists] = await Promise.all([
      this.prisma.procurement_centres.findUnique({ where: { id: centreId } }),
      this.prisma.crops.findUnique({ where: { id: cropId } }),
    ]);

    if (!centreExists) {
      throw new NotFoundException('Procurement centre not found');
    }

    if (!cropExists) {
      throw new NotFoundException('Crop not found');
    }
  }

  private validateBookedCountAgainstCapacity(bookedCount: number, capacity: number) {
    if (bookedCount > capacity) {
      throw new BadRequestException(
        'booked_count cannot exceed capacity for a slot',
      );
    }
  }

  private toDateOnly(value: Date) {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toTime(value: Date) {
    const date = new Date(value);
    return new Date(
      Date.UTC(1970, 0, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()),
    );
  }
}
