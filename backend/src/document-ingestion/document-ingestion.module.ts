import { Module } from '@nestjs/common';
import { DocumentIngestionService } from './document-ingestion.service';
import { DocumentIngestionController } from './document-ingestion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentIngestionController],
  providers: [DocumentIngestionService],
  exports: [DocumentIngestionService]
})
export class DocumentIngestionModule {}
