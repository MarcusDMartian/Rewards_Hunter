// ============================================
// APP MODULE - Main application module
// ============================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IdeasModule } from './ideas/ideas.module';
import { KudosModule } from './kudos/kudos.module';
import { RewardsModule } from './rewards/rewards.module';
import { GamificationModule } from './gamification/gamification.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    IdeasModule,
    KudosModule,
    RewardsModule,
    GamificationModule,
    FeedbackModule,
  ],
})
export class AppModule { }
