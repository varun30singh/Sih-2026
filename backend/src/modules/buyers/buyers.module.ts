import { Module } from '../../common';
import { ConfigService } from '../../config';
import { BuyersController } from './buyers.controller';
import { BuyersService } from './buyers.service';

@Module({
  controllers: [BuyersController],
  providers: [BuyersService, ConfigService],
  exports: [BuyersService],
})
export class BuyersModule {}
