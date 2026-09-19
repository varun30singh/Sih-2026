import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Post()
  createStockist(@Body() body: { userId?: string; businessName?: string }) {
    return this.stockistsService.create(body);
  }
}