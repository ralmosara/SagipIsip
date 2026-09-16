import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: any) {
    return this.prisma.habit.create({
      data: {
        userId,
        title: data.title,
        frequency: data.frequency,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });
  }

  logHabit(id: string) {
    return this.prisma.habitLog.create({
      data: {
        habitId: id,
      },
    });
  }

  remove(id: string) {
    return this.prisma.habit.delete({
      where: { id },
    });
  }
}
