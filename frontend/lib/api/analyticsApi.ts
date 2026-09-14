import { apiClient } from './client';
import { MOCK_ANALYTICS } from '../mock-data';

export const analyticsApi = {
  /**
   * Future NestJS endpoint: GET /admin/analytics
   */
  async getAdminAnalytics() {
    return apiClient.get('/admin/analytics', MOCK_ANALYTICS);
  },
};
