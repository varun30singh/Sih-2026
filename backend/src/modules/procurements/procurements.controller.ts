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
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { ProcurementsService } from './procurements.service';

@Controller('procurements')
export class ProcurementsController {
  constructor(private readonly procurementsService: ProcurementsService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcurementDto: UpdateProcurementDto,
  ) {
    return this.procurementsService.update(id, updateProcurementDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementsService.remove(id);
  }
}
