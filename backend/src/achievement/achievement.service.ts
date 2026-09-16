import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.achievement.findMany();
  }

  findUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  }

  async awardAchievement(userId: string, achievementId: string) {
    const existing = await this.prisma.userAchievement.findFirst({
      where: { userId, achievementId },
    });
    if (existing) return existing; // Already awarded

    return this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });
  }
}
