import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ProcurementsController } from './procurements.controller';
import { ProcurementsService } from './procurements.service';

@Module({
  imports: [AuditLogModule],
  controllers: [ProcurementsController],
  providers: [ProcurementsService],
  exports: [ProcurementsService],
})
export class ProcurementsModule {}
