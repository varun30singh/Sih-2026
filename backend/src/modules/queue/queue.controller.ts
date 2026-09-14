import { Controller, Get, Post, Query, Body } from '../../common';
import { QueueService } from './queue.service';

@Controller('admin/queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('state')
  getLiveState(@Query('centreId') centreId: string) {
    return this.queueService.getLiveState(centreId || 'centre-14');
  }

  @Get('entries')
  getQueueEntries(@Query('centreId') centreId: string) {
    return this.queueService.getEntries(centreId || 'centre-14');
  }

  @Post('call-next')
  callNextToken(@Body() body: any) {
    return this.queueService.callNext(body?.centreId || 'centre-14', body?.currentTokenId || 'M-134');
  }

  @Post('hold')
  holdToken(@Body() body: any) {
    return this.queueService.hold(body?.tokenId || 'M-135', body?.reason || 'Calibration');
  }

  @Post('complete')
  completeToken(@Body() body: any) {
    return this.queueService.complete(body?.tokenId || 'M-134');
  }
}
