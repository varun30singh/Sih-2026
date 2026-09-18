import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from '../../common';

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
  private farmers: FarmerProfile[] = [
    {
      id: 'farmer-001',
      name: 'Ramesh Singh',
      mobile: '+919876543210',
      state: 'Uttar Pradesh',
      district: 'Meerut',
      village: 'Dorli',
      totalLandAcres: 4.5,
      preferredLanguage: 'hindi',
      isVerified: true,
    },
    {
      id: 'farmer-002',
      name: 'Sukhwinder Dhillon',
      mobile: '+919812345678',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Taraori',
      totalLandAcres: 8.0,
      preferredLanguage: 'punjabi',
      isVerified: true,
    }
  ];

  findAll() {
    return createSuccessResponse(this.farmers);
  }

  findById(id: string) {
    const farmer = this.farmers.find(f => f.id === id);
    return createSuccessResponse(farmer || null);
  }

  register(farmerData: Partial<FarmerProfile>) {
    const newFarmer: FarmerProfile = {
      id: `farmer-${Date.now().toString().slice(-4)}`,
      name: farmerData.name || 'New Farmer',
      mobile: farmerData.mobile || '+919999999999',
      state: farmerData.state || 'Uttar Pradesh',
      district: farmerData.district || 'Meerut',
      village: farmerData.village || '',
      totalLandAcres: farmerData.totalLandAcres || 2.0,
      preferredLanguage: farmerData.preferredLanguage || 'hindi',
      isVerified: false,
    };
    this.farmers.push(newFarmer);
    return createSuccessResponse(newFarmer, 'Farmer registered successfully');
  }
}
