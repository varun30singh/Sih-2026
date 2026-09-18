import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from '../../common';

@Injectable()
export class PaymentsService {
  private payments = [
    {
      id: 'pay-771',
      farmerId: 'farmer-001',
      procurementId: 'PR001',
      amountInr: 56875.0,
      crop: 'Wheat Grade-A MSP',
      dbtStatus: 'CREDITED_TO_ACCOUNT',
      pfmsBatchRef: 'PFMS-2026-UP-99201',
      bankLast4: '4192',
      creditDate: '2026-09-08T14:22:10Z',
    }
  ];

  findByFarmer(farmerId: string) {
    return createSuccessResponse(this.payments.filter(p => p.farmerId === farmerId));
  }
}
