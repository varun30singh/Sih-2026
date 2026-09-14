import { apiClient } from './client';
import { DigitalTwinData } from '@/types';
import { MOCK_DIGITAL_TWIN } from '../mock-data';

export const digitalTwinApi = {
  /**
   * Future NestJS endpoint: GET /centres/:id/digital-twin
   */
  async getDigitalTwinData(centreId: string = 'centre-14'): Promise<DigitalTwinData> {
    return apiClient.get<DigitalTwinData>(
      `/centres/${centreId}/digital-twin`,
      MOCK_DIGITAL_TWIN
    );
  },
};
