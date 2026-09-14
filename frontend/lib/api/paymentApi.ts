import { apiClient } from './client';
import { PaymentRecord } from '@/types';
import { MOCK_PAYMENTS } from '../mock-data';

export const paymentApi = {
  /**
   * Future NestJS endpoint: GET /farmers/:id/payments
   */
  async getFarmerPayments(farmerId: string = 'farmer-001'): Promise<PaymentRecord[]> {
    const list = MOCK_PAYMENTS.filter((p) => p.farmerId === farmerId);
    return apiClient.get<PaymentRecord[]>(`/farmers/${farmerId}/payments`, list.length ? list : MOCK_PAYMENTS.slice(0, 2));
  },

  /**
   * Future NestJS endpoint: GET /payments
   */
  async getAllPayments(): Promise<PaymentRecord[]> {
    return apiClient.get<PaymentRecord[]>('/payments', MOCK_PAYMENTS);
  },
};
