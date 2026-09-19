import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Post()
  createRetailUser(@Body() body: { userId?: string }) {
    return this.retailUsersService.create(body);
  }
}