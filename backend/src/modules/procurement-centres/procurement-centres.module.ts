import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ProcurementCentresController } from './procurement-centres.controller';
import { ProcurementCentresService } from './procurement-centres.service';

@Module({
  imports: [AuditLogModule],
  controllers: [ProcurementCentresController],
  providers: [ProcurementCentresService],
  exports: [ProcurementCentresService],
})
export class ProcurementCentresModule {}
