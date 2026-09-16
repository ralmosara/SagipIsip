import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class TherapistService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPatients() {
    return this.prisma.user.findMany({
      where: { role: Role.PATIENT },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        sessionSummaries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
    });
  }

  async getPatientDetails(patientId: string) {
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, role: Role.PATIENT },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        moods: {
          orderBy: { createdAt: 'desc' },
          take: 30, // Last 30 moods
        },
        workbooks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        sessionSummaries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async getHighRiskAlerts() {
    return this.prisma.sessionSummary.findMany({
      where: { riskLevel: 'HIGH' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
}
