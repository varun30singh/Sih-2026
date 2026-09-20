import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Get()
  getAllBuyers() {
    return this.buyersService.findAll();
  }

  @Get(':id')
  getBuyerById(@Param('id') id: string) {
    return this.buyersService.findById(id);
  }

  @Post()
  createBuyer(@Body() body: CreateBuyerDto) {
    return this.buyersService.create(body);
  }

  @Patch(':id')
  updateBuyer(@Param('id') id: string, @Body() body: UpdateBuyerDto) {
    return this.buyersService.update(id, body);
  }

  @Delete(':id')
  deleteBuyer(@Param('id') id: string) {
    return this.buyersService.remove(id);
  }
}
