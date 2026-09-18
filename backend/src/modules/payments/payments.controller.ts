import { Controller, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('farmer/:farmerId')
  getFarmerPayments(@Param('farmerId') farmerId: string) {
    return this.paymentsService.findByFarmer(farmerId);
  }
}
