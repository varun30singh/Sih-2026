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
import { CreateQueueDto, QueueStatus } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post()
  create(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.create(createQueueDto);
  }

  @Get()
  findAll() {
    return this.queueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQueueDto: UpdateQueueDto,
  ) {
    return this.queueService.update(id, updateQueueDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: QueueStatus,
  ) {
    return this.queueService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.remove(id);
  }
}
