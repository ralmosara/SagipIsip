import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodDto } from './mood.dto';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateMoodDto) {
    return this.prisma.moodLog.create({
      data: {
        userId,
        mood: data.mood,
        notes: data.notes,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Get last 30 entries
    });
  }
}
