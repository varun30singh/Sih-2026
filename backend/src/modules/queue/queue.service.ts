import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from '../../common';

@Injectable()
export class QueueService {
  private queueState = {
    centreId: 'centre-14',
    centreName: 'Meerut Grain Mandi #14',
    currentServingToken: 'M-134',
    nextServingToken: 'M-135',
    activeVehiclesInYard: 14,
    averageTurnaroundMinutes: 18,
    delayShieldActive: false,
    activeCounters: 3,
  };

  private queueEntries = [
    { id: 'q-134', token: 'M-134', farmer: 'Pritam Lal', crop: 'Wheat', status: 'SERVING', stage: 'WEIGHBRIDGE', queuePos: 0 },
    { id: 'q-135', token: 'M-135', farmer: 'Harish Chandra', crop: 'Wheat', status: 'CALLED', stage: 'GATE_ENTRY', queuePos: 1 },
    { id: 'q-136', token: 'M-136', farmer: 'Baljit Kaur', crop: 'Wheat', status: 'WAITING', stage: 'HOLDING_BAY', queuePos: 2 },
    { id: 'q-142', token: 'M-142', farmer: 'Ramesh Singh', crop: 'Wheat', status: 'EN_ROUTE', stage: 'DISPATCHED', queuePos: 8 },
  ];

  getLiveState(centreId: string = 'centre-14') {
    return createSuccessResponse({
      ...this.queueState,
      centreId,
    });
  }

  getEntries(centreId: string = 'centre-14') {
    return createSuccessResponse(this.queueEntries);
  }

  callNext(centreId: string, currentTokenId: string) {
    const next = this.queueState.nextServingToken;
    this.queueState.currentServingToken = next;
    return createSuccessResponse({
      success: true,
      currentServingToken: this.queueState.currentServingToken,
      message: `Token ${next} summoned to electronic weighbridge #1.`,
    });
  }

  hold(tokenId: string, reason: string) {
    return createSuccessResponse({
      success: true,
      tokenId,
      status: 'HOLD',
      reason,
      message: `Token ${tokenId} placed on delay shield hold: ${reason}.`,
    });
  }

  complete(tokenId: string) {
    return createSuccessResponse({
      success: true,
      tokenId,
      status: 'COMPLETED',
      message: `Procurement intake finalized for token ${tokenId}.`,
    });
  }
}
