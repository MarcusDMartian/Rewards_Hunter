// ============================================
// APP MODULE - Main application module
// ============================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IdeasModule } from './ideas/ideas.module';
import { KudosModule } from './kudos/kudos.module';
import { RewardsModule } from './rewards/rewards.module';
import { GamificationModule } from './gamification/gamification.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ActivitiesModule } from './activities/activities.module';
import { AppScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 60 },
      { name: 'long', ttl: 3_600_000, limit: 1000 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    IdeasModule,
    KudosModule,
    RewardsModule,
    GamificationModule,
    FeedbackModule,
    ActivitiesModule,
    AppScheduleModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
