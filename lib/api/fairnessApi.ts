import { apiClient } from './client';
import { FairnessScore, FairnessAdjustment } from '@/types';
import { MOCK_FAIRNESS_SCORE, MOCK_FAIRNESS_ADJUSTMENTS } from '../mock-data';

export const fairnessApi = {
  /**
   * Future NestJS endpoint: GET /admin/fairness
   */
  async getFairnessScore(): Promise<FairnessScore> {
    return apiClient.get<FairnessScore>('/admin/fairness', MOCK_FAIRNESS_SCORE);
  },

  /**
   * Future NestJS endpoint: GET /admin/fairness/adjustments
   */
  async getFairnessAdjustments(): Promise<FairnessAdjustment[]> {
    return apiClient.get<FairnessAdjustment[]>('/admin/fairness/adjustments', MOCK_FAIRNESS_ADJUSTMENTS);
  },
};
