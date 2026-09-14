import { apiClient } from './client';
import { Slot, DynamicSlotAlert } from '@/types';
import { MOCK_SLOTS, MOCK_DYNAMIC_SLOT_ALERT } from '../mock-data';

export const slotApi = {
  /**
   * Future NestJS endpoint: GET /slots
   */
  async getSlots(centreId: string = 'centre-14'): Promise<Slot[]> {
    return apiClient.get<Slot[]>(`/slots?centreId=${centreId}`, MOCK_SLOTS);
  },

  /**
   * Future NestJS endpoint: POST /slots/book
   */
  async bookSlot(data: {
    farmerId: string;
    centreId: string;
    crop: string;
    quantityKg: number;
    preferredDate: string;
    timeSlot: string;
  }) {
    return apiClient.post('/slots/book', data, {
      success: true,
      tokenId: 'M-142',
      centreId: data.centreId,
      timeSlot: data.timeSlot,
      message: 'Slot successfully booked. Token M-142 generated.',
    });
  },

  /**
   * Future NestJS endpoint: GET /slots/dynamic-alert/:centreId
   */
  async getDynamicSlotAlert(centreId: string = 'centre-14'): Promise<DynamicSlotAlert> {
    return apiClient.get<DynamicSlotAlert>(
      `/slots/dynamic-alert/${centreId}`,
      MOCK_DYNAMIC_SLOT_ALERT
    );
  },

  /**
   * Future NestJS endpoint: POST /slots/reschedule
   */
  async rescheduleSlot(data: { actionId: string; affectedFarmersCount: number; targetCentreId?: string }) {
    return apiClient.post('/slots/reschedule', data, {
      success: true,
      actionId: data.actionId,
      affectedFarmersNotified: data.affectedFarmersCount,
      message: 'Automated dynamic rescheduling applied. SMS & IVR notifications dispatched to farmers.',
    });
  },
};
