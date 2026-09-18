import { Controller, Get, Param } from '@nestjs/common';
import { ProcurementService } from './procurement.service';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('lifecycle/:tokenId')
  getProcurementLifecycle(@Param('tokenId') tokenId: string) {
    return this.procurementService.getLifecycle(tokenId);
  }
}
