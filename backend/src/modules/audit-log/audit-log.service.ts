import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    userId: number | null,
    action: string,
    entityType: string,
    entityId: number | null,
    details?: object,
  ) {
    return this.prisma.audit_logs.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
