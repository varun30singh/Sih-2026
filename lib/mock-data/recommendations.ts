import { CentreRecommendation } from '@/types';
import { MOCK_CENTRES } from './centres';

export const MOCK_RECOMMENDATIONS: CentreRecommendation[] = [
  {
    centre: MOCK_CENTRES[1], // Centre #12 - Modinagar Agri Hub
    rank: 1,
    badge: 'Recommended',
    isRecommended: true,
    estimatedTotalTimeMinutes: 55,
    recommendationReason:
      'Although Centre #12 is 6 km farther away than Centre #14, its shorter queue (20 vs 75) and faster automated weighbridge (3.8 min/farmer) make it 1 hr 25 mins faster overall.',
    comparisonScores: {
      distanceScore: 78,
      queueScore: 95,
      speedScore: 92,
      capacityScore: 88,
      timeCompatibilityScore: 98,
      overallScore: 94,
    },
    metrics: {
      distanceKm: 18.2,
      waitingFarmers: 20,
      avgProcessingMinutes: 3.8,
      capacityPercentage: 62,
      estimatedWaitMinutes: 32,
      roadTravelMinutes: 23,
    },
  },
  {
    centre: MOCK_CENTRES[0], // Centre #14 - Hapur Central Mandi
    rank: 2,
    badge: 'High Congestion',
    isRecommended: false,
    estimatedTotalTimeMinutes: 140, // 2h 20m
    recommendationReason:
      'Closest physical location (12.4 km), but currently suffering high congestion (75 waiting farmers) and a 55% operational delay at the verification desk.',
    comparisonScores: {
      distanceScore: 94,
      queueScore: 32,
      speedScore: 45,
      capacityScore: 48,
      timeCompatibilityScore: 85,
      overallScore: 61,
    },
    metrics: {
      distanceKm: 12.4,
      waitingFarmers: 75,
      avgProcessingMinutes: 6.2,
      capacityPercentage: 82,
      estimatedWaitMinutes: 125,
      roadTravelMinutes: 15,
    },
  },
  {
    centre: MOCK_CENTRES[4], // Centre #21 - Pilkhuwa Sub-Yard
    rank: 3,
    badge: 'Alternative',
    isRecommended: false,
    estimatedTotalTimeMinutes: 68,
    recommendationReason:
      'Very close distance (8.5 km), but has limited tractor parking space (76% full) and fewer active counters.',
    comparisonScores: {
      distanceScore: 98,
      queueScore: 72,
      speedScore: 75,
      capacityScore: 65,
      timeCompatibilityScore: 80,
      overallScore: 78,
    },
    metrics: {
      distanceKm: 8.5,
      waitingFarmers: 31,
      avgProcessingMinutes: 4.8,
      capacityPercentage: 76,
      estimatedWaitMinutes: 52,
      roadTravelMinutes: 16,
    },
  },
  {
    centre: MOCK_CENTRES[3], // Centre #07 - Bulandshahr Grain Complex
    rank: 4,
    badge: 'Alternative',
    isRecommended: false,
    estimatedTotalTimeMinutes: 75,
    recommendationReason:
      'High operational efficiency and low queue, but significant road transit distance (28.5 km) increases transport fuel costs.',
    comparisonScores: {
      distanceScore: 50,
      queueScore: 92,
      speedScore: 90,
      capacityScore: 94,
      timeCompatibilityScore: 90,
      overallScore: 75,
    },
    metrics: {
      distanceKm: 28.5,
      waitingFarmers: 22,
      avgProcessingMinutes: 4.2,
      capacityPercentage: 52,
      estimatedWaitMinutes: 35,
      roadTravelMinutes: 40,
    },
  },
];
