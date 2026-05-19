// ============================================
// KUDOS MODULE
// ============================================
import { Module } from '@nestjs/common';
import { KudosService } from './kudos.service';
import { KudosController } from './kudos.controller';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  controllers: [KudosController],
  providers: [KudosService],
  exports: [KudosService],
})
export class KudosModule {}
