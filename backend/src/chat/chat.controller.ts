import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentIngestionService } from '../document-ingestion/document-ingestion.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: DocumentIngestionService,
  ) {}

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Direct Clinical Consultation endpoint grounded in 18,047 vectors.
   */
  @Post('consult')
  async consult(@Body() body: { query: string; topK?: number }) {
    if (!body?.query) {
      return { error: 'Query is required for consultation.' };
    }
    return this.ragService.clinicalConsult(body.query, body.topK || 4);
  }

  /**
   * Direct Semantic Search endpoint across the pgvector library.
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
