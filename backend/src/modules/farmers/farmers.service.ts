import { Injectable, NotFoundException } from '@nestjs/common';
import { createSuccessResponse } from '../../common';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface FarmerProfile {
  id: string;
  name: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
  totalLandAcres: number;
  preferredLanguage: string;
  isVerified: boolean;
}
@Injectable()
export class FarmersService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    const farmers = await this.prisma.farmers.findMany({
      orderBy: { id: 'asc' },
    });
    return createSuccessResponse(farmers);
  }
  async findById(id: string) {
    const farmerId = Number(id);
    if (!Number.isInteger(farmerId)) {
      return createSuccessResponse(null);
    }
    const farmer = await this.prisma.farmers.findUnique({
      where: { id: farmerId },
    });
    return createSuccessResponse(farmer || null);
  }
  async findByUserId(userId: number) {
    const farmer = await this.prisma.farmers.findFirst({
      where: { user_id: userId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer profile not found');
    }
    return createSuccessResponse(farmer);
  }
  async register(farmerData: Partial<FarmerProfile> & { user_id?: number }) {
    const farmer = await this.prisma.farmers.create({
      data: {
        user_id: farmerData.user_id,
        name: farmerData.name || 'New Farmer',
        phone: farmerData.mobile || '+919999999999',
        village: farmerData.village || '',
      },
    });
    return createSuccessResponse(farmer, 'Farmer registered successfully');
  }
}