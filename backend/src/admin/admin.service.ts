import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getSystemStats() {
    const totalUsers = await this.prisma.user.count({ where: { deletedAt: null } });
    const totalPatients = await this.prisma.user.count({ where: { role: 'PATIENT', deletedAt: null } });
    const totalTherapists = await this.prisma.user.count({ where: { role: 'THERAPIST', deletedAt: null } });
    const totalChats = await this.prisma.chatHistory.count();

    return {
      totalUsers,
      totalPatients,
      totalTherapists,
      totalChats,
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            chats: true,
            moods: true,
            workbooks: true,
          }
        },
      }
    });
  }

  async updateUserRole(id: string, role: import('@prisma/client').Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
