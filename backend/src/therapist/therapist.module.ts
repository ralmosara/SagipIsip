import { Module } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { TherapistController } from './therapist.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { DocumentIngestionModule } from '../document-ingestion/document-ingestion.module';

@Module({
  imports: [PrismaModule, AuthModule, AuditModule, DocumentIngestionModule],
  providers: [TherapistService],
  controllers: [TherapistController]
})
export class TherapistModule {}
