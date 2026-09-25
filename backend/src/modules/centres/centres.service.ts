import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createSuccessResponse } from '../../common';

export interface ProcurementCentreResponse {
  id: number;
  name: string;
  location: string;
  district: string;
  state: string;
  address: string;
  capacity_per_slot: number;
  capacityTrucks: number;
  processing_rate: number | null;
  processingRateQtlPerHr: number;
  activeCounters: number;
  status: 'ACTIVE' | 'CONGESTED' | 'SLOWDOWN' | 'INACTIVE';
  currentWaitMinutes: number;
  created_at?: Date;
}

@Injectable()
export class CentresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const centres = await this.prisma.procurement_centres.findMany({
      orderBy: { id: 'asc' },
    });

    const formatted = centres.map((centre) => this.formatCentre(centre));
    return createSuccessResponse(formatted);
  }

  async findById(id: string | number) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      return createSuccessResponse(null);
    }

    const centre = await this.prisma.procurement_centres.findUnique({
      where: { id: numericId },
    });

    if (!centre) {
      return createSuccessResponse(null);
    }

    return createSuccessResponse(this.formatCentre(centre));
  }

  private formatCentre(centre: {
    id: number;
    name: string;
    location: string;
    capacity_per_slot: number;
    processing_rate: number | null;
    created_at?: Date;
  }): ProcurementCentreResponse {
    return {
      id: centre.id,
      name: centre.name,
      location: centre.location,
      district: centre.location,
      state: 'Uttar Pradesh',
      address: centre.location,
      capacity_per_slot: centre.capacity_per_slot,
      capacityTrucks: centre.capacity_per_slot,
      processing_rate: centre.processing_rate,
      processingRateQtlPerHr: centre.processing_rate ?? 100,
      activeCounters: 3,
      status: 'ACTIVE',
      currentWaitMinutes: 0,
      created_at: centre.created_at,
    };
  }
}
