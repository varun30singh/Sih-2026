import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Crop, CropsService } from './crops.service';

@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  getAllCrops() {
    return this.cropsService.findAll();
  }

  @Get(':id')
  getCropById(@Param('id') id: string) {
    return this.cropsService.findById(id);
  }

  @Post()
  createCrop(@Body() body: Partial<Crop>) {
    return this.cropsService.create(body);
  }

  @Patch(':id')
  updateCrop(@Param('id') id: string, @Body() body: Partial<Crop>) {
    return this.cropsService.update(id, body);
  }

  @Delete(':id')
  deleteCrop(@Param('id') id: string) {
    return this.cropsService.remove(id);
  }
}