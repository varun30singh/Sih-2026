import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProcurementCentreDto } from './dto/create-procurement-centre.dto';
import { UpdateProcurementCentreDto } from './dto/update-procurement-centre.dto';
import { ProcurementCentresService } from './procurement-centres.service';

@Controller('procurement-centres')
export class ProcurementCentresController {
  constructor(
    private readonly procurementCentresService: ProcurementCentresService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post()
  create(@Body() createProcurementCentreDto: CreateProcurementCentreDto) {
    return this.procurementCentresService.create(createProcurementCentreDto);
  }

  @Get()
  findAll() {
    return this.procurementCentresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procurementCentresService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcurementCentreDto: UpdateProcurementCentreDto,
  ) {
    return this.procurementCentresService.update(id, updateProcurementCentreDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementCentresService.remove(id);
  }
}
