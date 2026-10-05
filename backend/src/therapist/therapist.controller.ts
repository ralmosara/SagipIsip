import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Controller('therapist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.THERAPIST, Role.ADMIN)
export class TherapistController {
  constructor(
    private readonly therapistService: TherapistService,
    private readonly auditService: AuditService
  ) {}

  @Get('patients')
  getPatients() {
    return this.therapistService.getAllPatients();
  }

  @Get('patients/:id')
  async getPatientDetails(@Param('id') id: string, @Request() req: any) {
    const therapistId = req.user?.sub;
    if (therapistId) {
      await this.auditService.logPatientDataView(therapistId, id);
    }
    return this.therapistService.getPatientDetails(id);
  }

  @Get('alerts')
  getHighRiskAlerts() {
    return this.therapistService.getHighRiskAlerts();
  }
}
