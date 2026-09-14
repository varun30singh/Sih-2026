import { Injectable, createSuccessResponse } from '../../common';

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  capacityTrucks: number;
  processingRateQtlPerHr: number;
  activeCounters: number;
  status: 'ACTIVE' | 'CONGESTED' | 'SLOWDOWN' | 'INACTIVE';
  currentWaitMinutes: number;
}

@Injectable()
export class CentresService {
  private centres: ProcurementCentre[] = [
    {
      id: 'centre-14',
      name: 'Meerut Grain Mandi #14',
      code: 'UP-MRT-014',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      address: 'Roorkee Road, Dorli, Meerut, UP 250001',
      latitude: 28.9845,
      longitude: 77.7064,
      capacityTrucks: 45,
      processingRateQtlPerHr: 140.0,
      activeCounters: 3,
      status: 'ACTIVE',
      currentWaitMinutes: 42,
    },
    {
      id: 'centre-08',
      name: 'Modinagar Relief Mandi #08',
      code: 'UP-GZB-008',
      district: 'Ghaziabad',
      state: 'Uttar Pradesh',
      address: 'Delhi-Meerut Expressway, Modinagar, UP 201204',
      latitude: 28.8318,
      longitude: 77.5818,
      capacityTrucks: 30,
      processingRateQtlPerHr: 95.0,
      activeCounters: 2,
      status: 'ACTIVE',
      currentWaitMinutes: 25,
    },
    {
      id: 'centre-22',
      name: 'Hapur Central Mandi #22',
      code: 'UP-HPR-022',
      district: 'Hapur',
      state: 'Uttar Pradesh',
      address: 'Railway Road, Hapur, UP 245101',
      latitude: 28.7306,
      longitude: 77.7759,
      capacityTrucks: 60,
      processingRateQtlPerHr: 180.0,
      activeCounters: 4,
      status: 'SLOWDOWN',
      currentWaitMinutes: 110,
    }
  ];

  findAll() {
    return createSuccessResponse(this.centres);
  }

  findById(id: string) {
    const centre = this.centres.find(c => c.id === id);
    return createSuccessResponse(centre || null);
  }
}
