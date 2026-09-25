import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cropsService.remove(Number(id));
  }
}