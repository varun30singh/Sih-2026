import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health(@Res() response: any) {
    return response.status(200).json({ status: 'ok' });
  }
}