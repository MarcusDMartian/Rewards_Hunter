// ============================================
// KUDOS CONTROLLER
// ============================================

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KudosService } from './kudos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';

@Controller('kudos')
@UseGuards(JwtAuthGuard)
export class KudosController {
  constructor(private kudosService: KudosService) {}

  @Get()
  async findAll(@Query('teamId') teamId?: string) {
    return this.kudosService.findAll(teamId);
  }

  @Get('quota')
  async getQuota(@CurrentUser() user: ReqUser) {
    return this.kudosService.getWeeklyQuota(user.id);
  }

  @Get('values-distribution')
  async getValuesDistribution(@CurrentUser() user: ReqUser) {
    return this.kudosService.getValuesDistribution(user.orgId);
  }

  @Get('top-recipients')
  async getTopRecipients(@Query('period') period?: 'week' | 'month') {
    return this.kudosService.getTopRecipients(period ?? 'week');
  }

  @Post()
  async create(
    @CurrentUser() user: ReqUser,
    @Body() body: { receiverId: string; coreValue: string; message: string },
  ) {
    return this.kudosService.create({ senderId: user.id, ...body });
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: ReqUser) {
    return this.kudosService.toggleLike(id, user.id);
  }
}
