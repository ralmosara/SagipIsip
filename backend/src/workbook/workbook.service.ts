import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkbookDto } from './workbook.dto';

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWorkbookDto) {
    return this.prisma.workbookEntry.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.workbookEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.workbookEntry.findFirst({
      where: { id, userId },
    });
  }
}
