// ============================================
// GAMIFICATION CONTROLLER
// ============================================

import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Post('events')
  async processEvent(
    @CurrentUser() user: any,
    @Body() body: { eventType: string; referenceId?: string },
  ) {
    return this.gamificationService.processEvent(
      user.id,
      body.eventType,
      body.referenceId,
    );
  }

  @Get('missions/today')
  async getMissions(@CurrentUser() user: any) {
    return this.gamificationService.getUserMissions(user.id);
  }

  @Post('missions/:id/claim')
  async claimMission(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gamificationService.claimMission(user.id, id);
  }

  @Get('badges')
  async getBadges(@CurrentUser() user: any) {
    return this.gamificationService.getAllBadges(user.id);
  }
}
