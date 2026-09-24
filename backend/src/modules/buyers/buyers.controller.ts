import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
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

  @UseGuards(JwtAuthGuard)
  @Post()
  createBuyer(@Body() body: CreateBuyerDto) {
    return this.buyersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  updateBuyer(@Param('id') id: string, @Body() body: UpdateBuyerDto) {
    return this.buyersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  deleteBuyer(@Param('id') id: string) {
    return this.buyersService.remove(id);
  }
}
