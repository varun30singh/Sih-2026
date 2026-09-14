import { apiClient } from './client';
import { FarmerProfile, FarmerRegistrationInput } from '@/types';
import { MOCK_FARMERS } from '../mock-data';

export const farmerApi = {
  /**
   * Future NestJS endpoint: GET /farmers/:id
   */
  async getFarmerProfile(id: string): Promise<FarmerProfile> {
    const fallback = MOCK_FARMERS.find((f) => f.id === id) || MOCK_FARMERS[0];
    return apiClient.get<FarmerProfile>(`/farmers/${id}`, fallback);
  },

  /**
   * Future NestJS endpoint: GET /farmers
   */
  async getAllFarmers(): Promise<FarmerProfile[]> {
    return apiClient.get<FarmerProfile[]>('/farmers', MOCK_FARMERS);
  },

  /**
   * Future NestJS endpoint: POST /farmers/register
   */
  async registerFarmer(input: FarmerRegistrationInput): Promise<FarmerProfile> {
    const newFarmer: FarmerProfile = {
      id: `farmer-${Date.now()}`,
      name: input.name,
      mobile: input.mobile,
      aadhaarHash: `XXXX-XXXX-${input.aadhaarNumber.slice(-4) || '9999'}`,
      farmerIdNumber: input.farmerId || `UP-FARM-${Date.now().toString().slice(-4)}`,
      village: input.village,
      district: input.district,
      state: input.state,
      address: input.address,
      totalLandAcres: Number(input.landAreaAcres) || 4.5,
      primaryCrops: [input.crop],
      bankAccountLinked: true,
      kisanCreditCard: true,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    return apiClient.post<FarmerProfile, FarmerRegistrationInput>('/farmers/register', input, newFarmer);
  },
};
