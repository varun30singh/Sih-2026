import { Module } from '@nestjs/common';
import { RetailUsersController } from './retail-users.controller';
import { RetailUsersService } from './retail-users.service';

@Module({
  controllers: [RetailUsersController],
  providers: [RetailUsersService],
  exports: [RetailUsersService],
})
export class RetailUsersModule {}