import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProcurementCentreDto } from './dto/create-procurement-centre.dto';
import { UpdateProcurementCentreDto } from './dto/update-procurement-centre.dto';

@Injectable()
export class ProcurementCentresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createProcurementCentreDto: CreateProcurementCentreDto) {
    const centre = await this.prisma.procurement_centres.create({
      data: {
        name: createProcurementCentreDto.name,
        location: createProcurementCentreDto.location,
        capacity_per_slot: createProcurementCentreDto.capacity_per_slot,
        processing_rate: createProcurementCentreDto.processing_rate ?? null,
      },
    });

    await this.auditLogService.log(
      null,
      'CREATE',
      'ProcurementCentre',
      centre.id,
      {
        name: centre.name,
        location: centre.location,
      },
    );

    return centre;
  }

  findAll() {
    return this.prisma.procurement_centres.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const centre = await this.prisma.procurement_centres.findUnique({
      where: { id },
    });

    if (!centre) {
      throw new NotFoundException('Procurement centre not found');
    }

    return centre;
  }

  async update(id: number, updateProcurementCentreDto: UpdateProcurementCentreDto) {
    await this.findOne(id);

    const centre = await this.prisma.procurement_centres.update({
      where: { id },
      data: {
        ...(updateProcurementCentreDto.name !== undefined && {
          name: updateProcurementCentreDto.name,
        }),
        ...(updateProcurementCentreDto.location !== undefined && {
          location: updateProcurementCentreDto.location,
        }),
        ...(updateProcurementCentreDto.capacity_per_slot !== undefined && {
          capacity_per_slot: updateProcurementCentreDto.capacity_per_slot,
        }),
        ...(updateProcurementCentreDto.processing_rate !== undefined && {
          processing_rate: updateProcurementCentreDto.processing_rate ?? null,
        }),
      },
    });

    await this.auditLogService.log(
      null,
      'UPDATE',
      'ProcurementCentre',
      centre.id,
      {
        name: centre.name,
        location: centre.location,
      },
    );

    return centre;
  }

  async remove(id: number) {
    await this.findOne(id);

    const centre = await this.prisma.procurement_centres.delete({
      where: { id },
    });

    await this.auditLogService.log(
      null,
      'DELETE',
      'ProcurementCentre',
      centre.id,
      {
        name: centre.name,
      },
    );

    return centre;
  }
}
