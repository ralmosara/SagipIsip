import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MoodService } from './mood.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMoodDto } from './mood.dto';

@Controller('moods')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  create(@Request() req: any, @Body() createMoodDto: CreateMoodDto) {
    return this.moodService.create(req.user.id, createMoodDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.moodService.findAllByUser(req.user.id);
  }

  /**
   * Returns mood trend analytics: 7-day/30-day averages, daily breakdown,
   * trend direction, and anomaly detection.
   * Source: AI-Driven Innovations in Healthcare (Langabeer & Lalani)
   */
  @Get('trend')
  getMoodTrend(@Request() req: any) {
    return this.moodService.getMoodTrend(req.user.id);
  }
}
