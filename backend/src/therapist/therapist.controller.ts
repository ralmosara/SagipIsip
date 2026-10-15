import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { DocumentIngestionService } from '../document-ingestion/document-ingestion.service';

@Controller('therapist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.THERAPIST, Role.ADMIN)
export class TherapistController {
  constructor(
    private readonly therapistService: TherapistService,
    private readonly auditService: AuditService,
    private readonly ragService: DocumentIngestionService,
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

  /**
   * Therapist clinical consultation with 22 medical textbooks.
   */
  @Post('consult')
  async consult(@Body() body: { query: string; topK?: number }) {
    if (!body?.query) {
      return { error: 'Query is required for clinical consultation.' };
    }
    return this.ragService.clinicalConsult(body.query, body.topK || 4);
  }

  /**
   * Clinical textbook search for treatment strategies and DSM/NICE guidance.
   */
  @Get('consult/search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    if (!query) return [];
    return this.ragService.retrieveRelevantChunks(
      query,
      limit ? parseInt(limit, 10) : 5,
    );
  }
}
