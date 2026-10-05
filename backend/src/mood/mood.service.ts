import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodDto } from './mood.dto';

export interface MoodTrend {
  sevenDayAverage: number | null;
  thirtyDayAverage: number | null;
  weeklyData: { date: string; average: number; count: number }[];
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  anomalyDetected: boolean;
  anomalyDescription: string | null;
  prolongedLowMood: boolean;
  prolongedLowMoodDescription: string | null;
  recentLogs: { mood: number; notes: string | null; createdAt: Date }[];
}

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

  /**
   * Computes mood trend analytics for a user.
   * Source: AI-Driven Innovations in Healthcare (Langabeer & Lalani) — trend analysis
   * and anomaly detection are key to proactive care escalation.
   * Source: Biopsychosocial Multiaxial Toolkit (Mayall) — longitudinal mood tracking
   * informs clinical decision-making.
   */
  async getMoodTrend(userId: string): Promise<MoodTrend> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allLogs = await this.prisma.moodLog.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' },
    });

    if (allLogs.length === 0) {
      return {
        sevenDayAverage: null,
        thirtyDayAverage: null,
        weeklyData: [],
        trend: 'insufficient_data',
        anomalyDetected: false,
        anomalyDescription: null,
        prolongedLowMood: false,
        prolongedLowMoodDescription: null,
        recentLogs: [],
      };
    }

    // 7-day average
    const sevenDayLogs = allLogs.filter((l: { createdAt: Date }) => l.createdAt >= sevenDaysAgo);
    const sevenDayAverage =
      sevenDayLogs.length > 0
        ? Math.round((sevenDayLogs.reduce((s: number, l: { mood: number }) => s + l.mood, 0) / sevenDayLogs.length) * 10) / 10
        : null;

    // 30-day average
    const thirtyDayAverage =
      Math.round((allLogs.reduce((s: number, l: { mood: number }) => s + l.mood, 0) / allLogs.length) * 10) / 10;

    // Weekly breakdown (each day for last 7 days)
    const weeklyData: { date: string; average: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = allLogs.filter(
        (l: { createdAt: Date }) => l.createdAt >= dayStart && l.createdAt <= dayEnd,
      );

      if (dayLogs.length > 0) {
        weeklyData.push({
          date: dayStart.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
          average: Math.round((dayLogs.reduce((s: number, l: { mood: number }) => s + l.mood, 0) / dayLogs.length) * 10) / 10,
          count: dayLogs.length,
        });
      } else {
        weeklyData.push({
          date: dayStart.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
          average: 0,
          count: 0,
        });
      }
    }

    // Trend detection: compare first half vs second half of 30-day window
    let trend: MoodTrend['trend'] = 'stable';
    if (allLogs.length >= 4) {
      const midpoint = Math.floor(allLogs.length / 2);
      const firstHalfAvg = allLogs.slice(0, midpoint).reduce((s: number, l: { mood: number }) => s + l.mood, 0) / midpoint;
      const secondHalfAvg = allLogs.slice(midpoint).reduce((s: number, l: { mood: number }) => s + l.mood, 0) / (allLogs.length - midpoint);
      const delta = secondHalfAvg - firstHalfAvg;
      if (delta >= 0.5) trend = 'improving';
      else if (delta <= -0.5) trend = 'declining';
      else trend = 'stable';
    } else {
      trend = 'insufficient_data';
    }

    // Anomaly detection: significant single-day drop (≥2 points below recent average)
    // Source: AI-Driven Innovations in Healthcare — anomaly detection triggers proactive outreach
    let anomalyDetected = false;
    let anomalyDescription: string | null = null;
    if (sevenDayLogs.length >= 2) {
      const recentAvgWithoutLast = sevenDayLogs
        .slice(0, -1)
        .reduce((s: number, l: { mood: number }) => s + l.mood, 0) / (sevenDayLogs.length - 1);
      const lastLog = sevenDayLogs[sevenDayLogs.length - 1];
      if (recentAvgWithoutLast - lastLog.mood >= 2) {
        anomalyDetected = true;
        anomalyDescription = `Significant mood drop detected: your latest log (${lastLog.mood}/5) is notably lower than your recent average (${Math.round(recentAvgWithoutLast * 10) / 10}/5). Consider checking in with your AI Companion or a trusted person.`;
      }
    }

    // Anomaly detection: prolonged low mood (3 consecutive logs of mood <= 2)
    let prolongedLowMood = false;
    let prolongedLowMoodDescription: string | null = null;
    if (sevenDayLogs.length >= 3) {
      const lastThree = sevenDayLogs.slice(-3);
      if (lastThree.every((l: { mood: number }) => l.mood <= 2)) {
        prolongedLowMood = true;
        prolongedLowMoodDescription = `Prolonged low mood detected: your mood has been low for ${lastThree.length} consecutive logs. We strongly recommend reaching out to a support person or using your 'Grounding Mode'.`;
      }
    }

    return {
      sevenDayAverage,
      thirtyDayAverage,
      weeklyData,
      trend,
      anomalyDetected,
      anomalyDescription,
      prolongedLowMood,
      prolongedLowMoodDescription,
      recentLogs: allLogs.slice(-5).reverse().map((l: { mood: number; notes: string | null; createdAt: Date }) => ({
        mood: l.mood,
        notes: l.notes,
        createdAt: l.createdAt,
      })),
    };
  }
}
