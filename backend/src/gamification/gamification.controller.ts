// ============================================
// GAMIFICATION CONTROLLER
// ============================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  // ── Employee events & missions ─────────────────────────────────────────────

  @Post('events')
  async processEvent(
    @CurrentUser() user: ReqUser,
    @Body() body: { eventType: string; referenceId?: string },
  ) {
    return this.gamificationService.processEvent(user.id, body.eventType, body.referenceId);
  }

  @Get('missions/today')
  async getMissions(@CurrentUser() user: ReqUser) {
    return this.gamificationService.getUserMissions(user.id);
  }

  @Post('missions/:id/claim')
  async claimMission(@Param('id') id: string, @CurrentUser() user: ReqUser) {
    return this.gamificationService.claimMission(user.id, id);
  }

  @Get('badges')
  async getBadges(@CurrentUser() user: ReqUser) {
    return this.gamificationService.getAllBadges(user.id);
  }

  // ── Admin: Badge CRUD ──────────────────────────────────────────────────────

  @Post('admin/badges')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async createBadge(@Body() body: { name: string; icon?: string; color?: string; description?: string; criteriaJson?: string; rarity?: string }) {
    return this.gamificationService.createBadge(body);
  }

  @Patch('admin/badges/:id')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async updateBadge(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.gamificationService.updateBadge(id, body);
  }

  @Delete('admin/badges/:id')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async deleteBadge(@Param('id') id: string) {
    return this.gamificationService.deleteBadge(id);
  }

  // ── Admin: Mission CRUD ────────────────────────────────────────────────────

  @Post('admin/missions')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async createMission(@Body() body: { title: string; description?: string; type?: string; triggerEvent: string; targetCount?: number; rewardPoints?: number }) {
    return this.gamificationService.createMission(body);
  }

  @Patch('admin/missions/:id')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async updateMission(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.gamificationService.updateMission(id, body);
  }

  @Delete('admin/missions/:id')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async deleteMission(@Param('id') id: string) {
    return this.gamificationService.deleteMission(id);
  }

  // ── Admin: Point Rules CRUD ────────────────────────────────────────────────

  @Get('admin/point-rules')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async getPointRules() {
    return this.gamificationService.getAllPointRules();
  }

  @Patch('admin/point-rules/:id')
  @UseGuards(RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  async updatePointRule(
    @Param('id') id: string,
    @Body() body: Partial<{ points: number; dailyLimit: number; enabled: boolean; label: string }>,
  ) {
    return this.gamificationService.updatePointRule(id, body);
  }
}
