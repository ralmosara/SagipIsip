import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  findAll() {
    return this.achievementService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findUserAchievements(@Request() req: any) {
    return this.achievementService.findUserAchievements(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('award/:id')
  awardAchievement(@Request() req: any, @Param('id') achievementId: string) {
    return this.achievementService.awardAchievement(req.user.id, achievementId);
  }
}
