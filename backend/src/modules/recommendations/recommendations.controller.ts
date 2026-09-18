import { Controller, Post, Body, Get } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  getDefaultRecommendations() {
    return this.recommendationsService.recommendBestCentre();
  }

  @Post('smart-centres')
  getSmartRecommendations(@Body() body: any) {
    return this.recommendationsService.recommendBestCentre(body);
  }
}
