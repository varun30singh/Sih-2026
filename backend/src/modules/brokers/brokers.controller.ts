import { Controller, Get, Post, Patch, Delete, Param, Body } from '../../common';
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

  @Post()
  createBroker(@Body() body: CreateBrokerDto) {
    return this.brokersService.create(body);
  }

  @Patch(':id')
  updateBroker(@Param('id') id: string, @Body() body: UpdateBrokerDto) {
    return this.brokersService.update(id, body);
  }

  @Delete(':id')
  deleteBroker(@Param('id') id: string) {
    return this.brokersService.remove(id);
  }
}
