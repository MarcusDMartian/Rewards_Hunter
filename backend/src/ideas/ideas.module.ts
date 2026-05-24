// ============================================
// IDEAS MODULE
// ============================================
import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { GamificationModule } from '../gamification/gamification.module';
import { AiPolishService } from '../common/services/ai-polish.service';

@Module({
  imports: [GamificationModule],
  controllers: [IdeasController],
  providers: [IdeasService, AiPolishService],
  exports: [IdeasService],
})
export class IdeasModule {}
