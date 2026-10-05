import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkbookModule } from './workbook/workbook.module';
import { MoodModule } from './mood/mood.module';
import { TherapistModule } from './therapist/therapist.module';
import { AdminModule } from './admin/admin.module';
import { HabitModule } from './habit/habit.module';
import { AchievementModule } from './achievement/achievement.module';
import { DocumentIngestionModule } from './document-ingestion/document-ingestion.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [PrismaModule, AuthModule, ChatModule, WorkbookModule, MoodModule, TherapistModule, AdminModule, HabitModule, AchievementModule, DocumentIngestionModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
