import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const list = await this.prisma.crops.findMany({
      orderBy: { id: 'asc' },
    });
    return list.map((crop) => ({
      id: crop.id,
      name: crop.name,
      mspRate: Number(crop.msp_rate),
      msp_rate: Number(crop.msp_rate),
      unit: crop.unit,
    }));
  }

  async findOne(id: number) {
    const crop = await this.prisma.crops.findUnique({
      where: { id },
    });
    if (!crop) return null;
    return {
      id: crop.id,
      name: crop.name,
      mspRate: Number(crop.msp_rate),
      msp_rate: Number(crop.msp_rate),
      unit: crop.unit,
    };
  }

  async create(data: {
    name: string;
    mspRate?: number;
    msp_rate?: number;
    unit?: string;
  }) {
    const rate = data.mspRate ?? data.msp_rate ?? 0;
    const crop = await this.prisma.crops.create({
      data: {
        name: data.name,
        msp_rate: rate,
        unit: data.unit || 'quintal',
      },
    });
    return {
      id: crop.id,
      name: crop.name,
      mspRate: Number(crop.msp_rate),
      msp_rate: Number(crop.msp_rate),
      unit: crop.unit,
    };
  }

  async update(
    id: number,
    data: {
      name?: string;
      mspRate?: number;
      msp_rate?: number;
      unit?: string;
    },
  ) {
    const existing = await this.prisma.crops.findUnique({ where: { id } });
    if (!existing) return null;

    const rate = data.mspRate ?? data.msp_rate;
    const crop = await this.prisma.crops.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(rate !== undefined && { msp_rate: rate }),
        ...(data.unit !== undefined && { unit: data.unit }),
      },
    });
    return {
      id: crop.id,
      name: crop.name,
      mspRate: Number(crop.msp_rate),
      msp_rate: Number(crop.msp_rate),
      unit: crop.unit,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.crops.findUnique({ where: { id } });
    if (!existing) return null;

    const crop = await this.prisma.crops.delete({
      where: { id },
    });
    return {
      id: crop.id,
      name: crop.name,
      mspRate: Number(crop.msp_rate),
      msp_rate: Number(crop.msp_rate),
      unit: crop.unit,
    };
  }
}