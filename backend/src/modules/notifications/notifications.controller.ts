import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post('dispatch-alert')
  sendAlert(@Body() body: any) {
    return this.notificationsService.sendArrivalDispatchAlert(
      body?.mobile || '+919876543210',
      body?.token || 'M-142',
      body?.mandi || 'Meerut Grain Mandi #14'
    );
  }
}
