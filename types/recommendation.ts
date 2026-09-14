import { Centre } from './centre';

export interface RecommendationFactor {
  name: string;
  score: number; // 0 to 100
  weight: number;
  description: string;
  status: 'positive' | 'neutral' | 'warning';
}

export interface CentreRecommendation {
  centre: Centre;
  rank: 1 | 2 | 3 | 4 | 5;
  badge?: 'Recommended' | 'Nearest' | 'Alternative' | 'High Congestion';
  isRecommended: boolean;
  estimatedTotalTimeMinutes: number;
  recommendationReason: string;
  comparisonScores: {
    distanceScore: number;
    queueScore: number;
    speedScore: number;
    capacityScore: number;
    timeCompatibilityScore: number;
    overallScore: number;
  };
  metrics: {
    distanceKm: number;
    waitingFarmers: number;
    avgProcessingMinutes: number;
    capacityPercentage: number;
    estimatedWaitMinutes: number;
    roadTravelMinutes: number;
  };
}
