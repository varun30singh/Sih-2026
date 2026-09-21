import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CropsService } from './crops.service';

@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  findAll() {
    return this.cropsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cropsService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      mspRate: number;
      unit: string;
    },
  ) {
    return this.cropsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      mspRate?: number;
      unit?: string;
    },
  ) {
    return this.cropsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cropsService.remove(Number(id));
  }
}