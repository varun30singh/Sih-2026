import { apiClient } from './client';
import { QueueEntry, LiveQueueState } from '@/types';
import { MOCK_QUEUE_ENTRIES, MOCK_LIVE_QUEUE_STATE } from '../mock-data';

export const queueApi = {
  /**
   * Future NestJS endpoint: GET /centres/:id/queue
   */
  async getCentreQueue(centreId: string = 'centre-14'): Promise<QueueEntry[]> {
    return apiClient.get<QueueEntry[]>(`/centres/${centreId}/queue`, MOCK_QUEUE_ENTRIES);
  },

  /**
   * Future NestJS endpoint: GET /admin/queue
   */
  async getLiveQueueState(centreId: string = 'centre-14'): Promise<LiveQueueState> {
    return apiClient.get<LiveQueueState>(`/admin/queue/state?centreId=${centreId}`, MOCK_LIVE_QUEUE_STATE);
  },

  /**
   * Future NestJS endpoint: POST /admin/queue/call-next
   */
  async callNextToken(centreId: string = 'centre-14', currentTokenId: string = 'M-134') {
    return apiClient.post(`/admin/queue/call-next`, { centreId, currentTokenId }, {
      success: true,
      nextServingToken: 'M-135',
      message: 'Token M-135 called to Counter #1',
    });
  },

  /**
   * Future NestJS endpoint: POST /admin/queue/hold
   */
  async holdToken(tokenId: string, reason: string = 'Weighment recalibration') {
    return apiClient.post(`/admin/queue/hold`, { tokenId, reason }, {
      success: true,
      tokenId,
      status: 'hold',
      message: `Token ${tokenId} placed on hold.`,
    });
  },

  /**
   * Future NestJS endpoint: POST /admin/queue/complete
   */
  async completeToken(tokenId: string) {
    return apiClient.post(`/admin/queue/complete`, { tokenId }, {
      success: true,
      tokenId,
      status: 'completed',
      message: `Token ${tokenId} procurement finalized.`,
    });
  },
};
