import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(actorId: string, action: string, resource: string, status: string = 'SUCCESS') {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          action,
          resource,
          status,
        },
      });
      this.logger.log(`Audit: ${actorId} performed ${action} on ${resource} (${status})`);
    } catch (e: any) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }
  }

  async logPatientDataView(therapistId: string, patientId: string) {
    return this.logAction(
      therapistId, 
      'VIEW_SENSITIVE_DATA', 
      `Patient_${patientId}`
    );
  }
}
