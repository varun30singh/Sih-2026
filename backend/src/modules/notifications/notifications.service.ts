import { Injectable, createSuccessResponse } from '../../common';

@Injectable()
export class NotificationsService {
  sendArrivalDispatchAlert(farmerMobile: string, tokenNumber: string, mandiName: string) {
    return createSuccessResponse({
      dispatched: true,
      channels: ['SMS', 'IVR_VOICE_CALL', 'APP_PUSH'],
      recipient: farmerMobile,
      message: `MandiSetu Alert: Only 8 farmers ahead at ${mandiName}. Please depart from home now with Token ${tokenNumber}.`,
    });
  }
}
