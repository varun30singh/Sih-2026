import { apiClient } from './client';
import { ProcurementRecord } from '@/types';
import { MOCK_PROCUREMENT_RECORD } from '../mock-data';

export const procurementApi = {
  /**
   * Future NestJS endpoint: GET /procurement/:id
   */
  async getProcurementRecord(id: string = 'proc-2026-8921'): Promise<ProcurementRecord> {
    return apiClient.get<ProcurementRecord>(`/procurement/${id}`, MOCK_PROCUREMENT_RECORD);
  },

  /**
   * Future NestJS endpoint: GET /farmers/:id/procurement
   */
  async getFarmerProcurement(farmerId: string = 'farmer-001'): Promise<ProcurementRecord> {
    return apiClient.get<ProcurementRecord>(`/farmers/${farmerId}/procurement`, MOCK_PROCUREMENT_RECORD);
  },
};
