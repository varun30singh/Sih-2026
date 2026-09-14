import { apiClient } from './client';
import { Centre, CentreRecommendation } from '@/types';
import { MOCK_CENTRES, MOCK_RECOMMENDATIONS } from '../mock-data';

export const centreApi = {
  /**
   * Future NestJS endpoint: GET /centres
   */
  async getCentres(): Promise<Centre[]> {
    return apiClient.get<Centre[]>('/centres', MOCK_CENTRES);
  },

  /**
   * Future NestJS endpoint: GET /centres/:id
   */
  async getCentreById(id: string): Promise<Centre | undefined> {
    const fallback = MOCK_CENTRES.find((c) => c.id === id) || MOCK_CENTRES[0];
    return apiClient.get<Centre>(`/centres/${id}`, fallback);
  },

  /**
   * Future NestJS endpoint: GET /farmers/:id/recommended-centres
   */
  async getRecommendedCentres(farmerId: string = 'farmer-001'): Promise<CentreRecommendation[]> {
    return apiClient.get<CentreRecommendation[]>(
      `/farmers/${farmerId}/recommended-centres`,
      MOCK_RECOMMENDATIONS
    );
  },
};
