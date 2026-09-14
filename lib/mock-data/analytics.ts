export interface HourlyMetric {
  hour: string;
  arrivals: number;
  completed: number;
  avgWaitMins: number;
  capacityUtilPercent: number;
}

export interface CentreThroughput {
  centreName: string;
  clearedFarmers: number;
  tonnageProcured: number;
  avgWaitMins: number;
  status: 'Optimal' | 'Congested' | 'Critical';
}

export const MOCK_ANALYTICS = {
  nationalStats: {
    farmersRegistered: '1,842,910',
    procurementCentres: '4,820',
    tokensManaged: '6,419,230',
    waitingTimeReducedPercent: '74%',
    dbtDisbursedCrores: '₹ 14,280 Cr',
    onTimeArrivalRate: '93.4%',
  },
  centre14Overview: {
    totalFarmersToday: 218,
    activeTokens: 37,
    farmersWaiting: 37,
    averageWaitingTimeMinutes: 42,
    procurementCompletedCount: 142,
    pendingPaymentsCount: 18,
    tonnageProcuredTonnes: 485.4,
    fairnessIndex: '91/100',
  },
  hourlyTrends: [
    { hour: '08:00 AM', arrivals: 18, completed: 14, avgWaitMins: 15, capacityUtilPercent: 45 },
    { hour: '09:00 AM', arrivals: 28, completed: 22, avgWaitMins: 22, capacityUtilPercent: 70 },
    { hour: '10:00 AM', arrivals: 42, completed: 26, avgWaitMins: 42, capacityUtilPercent: 92 }, // Peak bottleneck
    { hour: '11:00 AM', arrivals: 38, completed: 28, avgWaitMins: 48, capacityUtilPercent: 95 },
    { hour: '12:00 PM', arrivals: 25, completed: 24, avgWaitMins: 38, capacityUtilPercent: 80 },
    { hour: '01:00 PM', arrivals: 16, completed: 18, avgWaitMins: 25, capacityUtilPercent: 60 },
    { hour: '02:00 PM', arrivals: 22, completed: 20, avgWaitMins: 28, capacityUtilPercent: 68 },
    { hour: '03:00 PM', arrivals: 20, completed: 22, avgWaitMins: 24, capacityUtilPercent: 62 },
    { hour: '04:00 PM', arrivals: 14, completed: 16, avgWaitMins: 18, capacityUtilPercent: 48 },
    { hour: '05:00 PM', arrivals: 8, completed: 12, avgWaitMins: 12, capacityUtilPercent: 30 },
  ] as HourlyMetric[],
  multiCentreComparison: [
    { centreName: 'Centre #12 (Modinagar)', clearedFarmers: 186, tonnageProcured: 610.5, avgWaitMins: 18, status: 'Optimal' },
    { centreName: 'Centre #07 (Bulandshahr)', clearedFarmers: 165, tonnageProcured: 540.2, avgWaitMins: 22, status: 'Optimal' },
    { centreName: 'Centre #14 (Hapur Central)', clearedFarmers: 142, tonnageProcured: 485.4, avgWaitMins: 42, status: 'Congested' },
    { centreName: 'Centre #21 (Pilkhuwa)', clearedFarmers: 118, tonnageProcured: 390.0, avgWaitMins: 28, status: 'Optimal' },
    { centreName: 'Centre #18 (Meerut North)', clearedFarmers: 98, tonnageProcured: 320.8, avgWaitMins: 65, status: 'Critical' },
  ] as CentreThroughput[],
  cropBreakdown: [
    { crop: 'Wheat', percentage: 65, totalTonnes: 1580 },
    { crop: 'Mustard', percentage: 20, totalTonnes: 486 },
    { crop: 'Chana (Gram)', percentage: 10, totalTonnes: 243 },
    { crop: 'Others (Barley/Pulses)', percentage: 5, totalTonnes: 121 },
  ],
};
