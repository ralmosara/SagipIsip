import { Module } from '@nestjs/common';
import { WorkbookController } from './workbook.controller';
import { WorkbookService } from './workbook.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WorkbookController],
  providers: [WorkbookService]
})
export class WorkbookModule {}
