// ============================================
// ACTIVITIES CONTROLLER
// ============================================

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  async getFeed(
    @CurrentUser() user: ReqUser,
    @Query('scope') scope?: 'team' | 'org',
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.getFeed(
      user.orgId,
      scope ?? 'org',
      user.teamId,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
