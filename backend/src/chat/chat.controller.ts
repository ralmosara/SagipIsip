import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
  }
}
