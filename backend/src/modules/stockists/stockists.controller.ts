import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StockistsService } from './stockists.service';

@Controller('stockists')
export class StockistsController {
  constructor(private readonly stockistsService: StockistsService) {}

  @Get()
  getAllStockists() {
    return this.stockistsService.findAll();
  }

  @Get(':id')
  getStockistById(@Param('id') id: string) {
    return this.stockistsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createStockist(@Body() body: { userId?: string; businessName?: string }) {
    return this.stockistsService.create(body);
  }
}