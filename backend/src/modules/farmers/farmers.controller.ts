import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FarmersService } from './farmers.service';

@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @Get()
  getAllFarmers() {
    return this.farmersService.findAll();
  }

  @Get(':id')
  getFarmerById(@Param('id') id: string) {
    return this.farmersService.findById(id);
  }

  @Post('register')
  registerFarmer(@Body() body: any) {
    return this.farmersService.register(body);
  }
}
