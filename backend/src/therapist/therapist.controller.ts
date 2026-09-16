import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('therapist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.THERAPIST, Role.ADMIN)
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get('patients')
  getPatients() {
    return this.therapistService.getAllPatients();
  }

  @Get('patients/:id')
  getPatientDetails(@Param('id') id: string) {
    return this.therapistService.getPatientDetails(id);
  }

  @Get('alerts')
  getHighRiskAlerts() {
    return this.therapistService.getHighRiskAlerts();
  }
}
