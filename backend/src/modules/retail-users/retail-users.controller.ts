import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RetailUsersService } from './retail-users.service';

@Controller('retail-users')
export class RetailUsersController {
  constructor(private readonly retailUsersService: RetailUsersService) {}

  @Get()
  getAllRetailUsers() {
    return this.retailUsersService.findAll();
  }

  @Get(':id')
  getRetailUserById(@Param('id') id: string) {
    return this.retailUsersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createRetailUser(@Body() body: { userId?: string; businessName?: string }) {
    return this.retailUsersService.create(body);
  }
}