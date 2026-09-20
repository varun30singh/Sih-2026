import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';

@Injectable()
export class ProcurementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createProcurementDto: CreateProcurementDto) {
    await this.validateRelations(createProcurementDto.booking_id, createProcurementDto.procured_by);

    const procurement = await this.prisma.procurements.create({
      data: {
        booking_id: createProcurementDto.booking_id,
        actual_quantity: this.toDecimal(createProcurementDto.actual_quantity),
        quality_grade: createProcurementDto.quality_grade ?? null,
        rate_applied: this.toDecimal(createProcurementDto.rate_applied),
        total_amount: this.toDecimal(createProcurementDto.total_amount),
        procured_by: createProcurementDto.procured_by ?? null,
      },
    });

    await this.auditLogService.log(
      null,
      'CREATE',
      'Procurement',
      procurement.id,
      {
        booking_id: procurement.booking_id,
        total_amount: procurement.total_amount.toString(),
      },
    );

    return procurement;
  }

  findAll() {
    return this.prisma.procurements.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const procurement = await this.prisma.procurements.findUnique({
      where: { id },
    });

    if (!procurement) {
      throw new NotFoundException('Procurement not found');
    }

    return procurement;
  }

  async update(id: number, updateProcurementDto: UpdateProcurementDto) {
    await this.findOne(id);

    const bookingId = updateProcurementDto.booking_id ?? (await this.prisma.procurements.findUnique({ where: { id } }))!.booking_id;
    const procuredBy = updateProcurementDto.procured_by ?? (await this.prisma.procurements.findUnique({ where: { id } }))!.procured_by;

    await this.validateRelations(bookingId, procuredBy);

    const procurement = await this.prisma.procurements.update({
      where: { id },
      data: {
        ...(updateProcurementDto.booking_id !== undefined && {
          booking_id: updateProcurementDto.booking_id,
        }),
        ...(updateProcurementDto.actual_quantity !== undefined && {
          actual_quantity: this.toDecimal(updateProcurementDto.actual_quantity),
        }),
        ...(updateProcurementDto.quality_grade !== undefined && {
          quality_grade: updateProcurementDto.quality_grade ?? null,
        }),
        ...(updateProcurementDto.rate_applied !== undefined && {
          rate_applied: this.toDecimal(updateProcurementDto.rate_applied),
        }),
        ...(updateProcurementDto.total_amount !== undefined && {
          total_amount: this.toDecimal(updateProcurementDto.total_amount),
        }),
        ...(updateProcurementDto.procured_by !== undefined && {
          procured_by: updateProcurementDto.procured_by ?? null,
        }),
      },
    });

    await this.auditLogService.log(
      null,
      'UPDATE',
      'Procurement',
      procurement.id,
      {
        booking_id: procurement.booking_id,
        total_amount: procurement.total_amount.toString(),
      },
    );

    return procurement;
  }

  async remove(id: number) {
    const procurement = await this.findOne(id);
    const deleted = await this.prisma.procurements.delete({
      where: { id },
    });

    await this.auditLogService.log(
      null,
      'DELETE',
      'Procurement',
      deleted.id,
      {
        booking_id: deleted.booking_id,
        total_amount: deleted.total_amount.toString(),
      },
    );

    return deleted;
  }

  private async validateRelations(bookingId: number, procuredBy?: number | null) {
    const bookingExists = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
    if (!bookingExists) {
      throw new NotFoundException('Booking not found');
    }

    if (procuredBy !== undefined && procuredBy !== null) {
      const userExists = await this.prisma.users.findUnique({ where: { id: procuredBy } });
      if (!userExists) {
        throw new NotFoundException('User not found');
      }
    }
  }

  private toDecimal(value: number | string) {
    return new Prisma.Decimal(value);
  }
}
