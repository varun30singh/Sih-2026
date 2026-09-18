import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('dispatch-alert')
  sendAlert(@Body() body: any) {
    return this.notificationsService.sendArrivalDispatchAlert(
      body?.mobile || '+919876543210',
      body?.token || 'M-142',
      body?.mandi || 'Meerut Grain Mandi #14'
    );
  }
}
