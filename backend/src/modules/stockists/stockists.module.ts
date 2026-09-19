import { Module } from '@nestjs/common';
import { StockistsController } from './stockists.controller';
import { StockistsService } from './stockists.service';

@Module({
  controllers: [StockistsController],
  providers: [StockistsService],
  exports: [StockistsService],
})
export class StockistsModule {}