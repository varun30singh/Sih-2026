import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from '../../common';

@Injectable()
export class ProcurementService {
  private lifecycleStages = [
    { stage: 1, name: 'Gate Entry & Biometric Pass', status: 'COMPLETED', timestamp: '09:15 AM' },
    { stage: 2, name: 'Automated Moisture Assay (<12% FAQ)', status: 'COMPLETED', result: '11.4% (Pass)', timestamp: '09:28 AM' },
    { stage: 3, name: 'Electronic Gross Weighbridge', status: 'COMPLETED', result: '4,280 kg', timestamp: '09:44 AM' },
    { stage: 4, name: 'Unloading & Quality Assortment', status: 'IN_PROGRESS', timestamp: '10:02 AM' },
    { stage: 5, name: 'Electronic Tare Weighbridge', status: 'PENDING' },
    { stage: 6, name: 'Digital Weighment Slip Generation', status: 'PENDING' },
    { stage: 7, name: 'Jute Bag Stamping & RFID Tagging', status: 'PENDING' },
    { stage: 8, name: 'DBT Payment Voucher Approval', status: 'PENDING' },
  ];

  getLifecycle(tokenId: string = 'M-142') {
    return createSuccessResponse({
      tokenId,
      stages: this.lifecycleStages,
      overallStatus: 'PROCESSING',
    });
  }
}
