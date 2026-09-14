import { apiClient } from './client';
import { DigitalToken } from '@/types';
import { MOCK_ACTIVE_TOKEN_M142, MOCK_TOKENS } from '../mock-data';

export const tokenApi = {
  /**
   * Future NestJS endpoint: GET /farmers/:id/token
   */
  async getActiveToken(farmerId: string = 'farmer-001'): Promise<DigitalToken> {
    return apiClient.get<DigitalToken>(
      `/farmers/${farmerId}/token`,
      MOCK_ACTIVE_TOKEN_M142
    );
  },

  /**
   * Future NestJS endpoint: GET /tokens/:id
   */
  async getTokenById(tokenId: string): Promise<DigitalToken | undefined> {
    const fallback = MOCK_TOKENS.find((t) => t.tokenId === tokenId) || MOCK_ACTIVE_TOKEN_M142;
    return apiClient.get<DigitalToken>(`/tokens/${tokenId}`, fallback);
  },

  /**
   * Future NestJS endpoint: GET /tokens
   */
  async getAllTokens(): Promise<DigitalToken[]> {
    return apiClient.get<DigitalToken[]>('/tokens', MOCK_TOKENS);
  },

  /**
   * Future NestJS endpoint: GET /farmers/:id/estimated-arrival
   */
  async getEstimatedArrival(farmerId: string = 'farmer-001') {
    return apiClient.get(`/farmers/${farmerId}/estimated-arrival`, {
      tokenId: 'M-142',
      farmersAhead: 8,
      estimatedWaitMinutes: 45,
      recommendedArrival: '10:45 AM',
      status: 'ON_TRACK',
    });
  },
};
