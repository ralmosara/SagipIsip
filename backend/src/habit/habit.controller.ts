import { Controller, Get, Post, Body, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { HabitService } from './habit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('habit')
@UseGuards(JwtAuthGuard)
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post()
  create(@Request() req: any, @Body() createHabitDto: any) {
    return this.habitService.create(req.user.id, createHabitDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.habitService.findAll(req.user.id);
  }

  @Post(':id/log')
  logHabit(@Param('id') id: string) {
    return this.habitService.logHabit(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.habitService.remove(id);
  }
}
