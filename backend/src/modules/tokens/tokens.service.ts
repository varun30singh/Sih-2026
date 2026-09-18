import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from '../../common';

@Injectable()
export class TokensService {
  private tokens = [
    {
      id: 'tok-142',
      tokenNumber: 'M-142',
      farmerName: 'Ramesh Singh',
      crop: 'Wheat (Sharbati)',
      quantityQtl: 25,
      centreId: 'centre-14',
      centreName: 'Meerut Grain Mandi #14',
      farmersAhead: 8,
      estimatedWaitMinutes: 42,
      recommendedArrival: '10:45 AM',
      status: 'ON_TRACK',
      qrHash: 'M142-SECURE-SHA256-HASH',
    }
  ];

  findByNumber(tokenNumber: string) {
    const token = this.tokens.find(t => t.tokenNumber.toUpperCase() === tokenNumber.toUpperCase());
    return createSuccessResponse(token || this.tokens[0]);
  }
}
