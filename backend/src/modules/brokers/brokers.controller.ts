import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BrokersService } from './brokers.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';

@Controller('brokers')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Get()
  getAllBrokers() {
    return this.brokersService.findAll();
  }

  @Get(':id')
  getBrokerById(@Param('id') id: string) {
    return this.brokersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createBroker(@Body() body: CreateBrokerDto) {
    return this.brokersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  updateBroker(@Param('id') id: string, @Body() body: UpdateBrokerDto) {
    return this.brokersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  deleteBroker(@Param('id') id: string) {
    return this.brokersService.remove(id);
  }
}
