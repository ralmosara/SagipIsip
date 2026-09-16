import { Controller, Post, UseGuards } from '@nestjs/common';
import { DocumentIngestionService } from './document-ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/document-ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DocumentIngestionController {
  constructor(private readonly ingestionService: DocumentIngestionService) {}

  @Post('trigger')
  async triggerIngestion() {
    this.ingestionService.processBooksDirectory();
    return { message: 'Document ingestion started in the background.' };
  }
}
