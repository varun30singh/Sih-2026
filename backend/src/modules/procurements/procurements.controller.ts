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
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { ProcurementsService } from './procurements.service';

@Controller('procurements')
export class ProcurementsController {
  constructor(private readonly procurementsService: ProcurementsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post()
  create(@Body() createProcurementDto: CreateProcurementDto) {
    return this.procurementsService.create(createProcurementDto);
  }

  @Get()
  findAll() {
    return this.procurementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procurementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcurementDto: UpdateProcurementDto,
  ) {
    return this.procurementsService.update(id, updateProcurementDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementsService.remove(id);
  }
}
