import { Module } from '@nestjs/common';
import { ConfigService } from '../../config';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';

@Module({
  controllers: [BrokersController],
  providers: [BrokersService, ConfigService],
  exports: [BrokersService],
})
export class BrokersModule {}
