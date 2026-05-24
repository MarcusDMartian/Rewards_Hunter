// ============================================
// SCHEDULE MODULE
// ============================================
import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ScheduleService],
})
export class AppScheduleModule {}
