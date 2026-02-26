// ============================================
// REWARDS CONTROLLER
// ============================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('wallet')
  async getWallet(@CurrentUser() user: any) {
    return this.rewardsService.getWallet(user.id);
  }

  @Get('rewards')
  async getCatalog() {
    return this.rewardsService.getCatalog();
  }

  @Post('rewards/:id/redeem')
  async redeem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rewardsService.redeem(user.id, id);
  }

  @Get('redemptions')
  async getRedemptions(@CurrentUser() user: any) {
    return this.rewardsService.getRedemptions(user.id);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Get('admin/redemptions')
  async getAllRedemptions(@Query('status') status?: string) {
    return this.rewardsService.getAllRedemptions(status);
  }

  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Patch('admin/redemptions/:id')
  async processRedemption(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { status: 'Approved' | 'Rejected'; note?: string },
  ) {
    return this.rewardsService.processRedemption(
      id,
      body.status,
      user.id,
      body.note,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Post('admin/rewards')
  async createReward(
    @Body()
    body: {
      name: string;
      description?: string;
      image?: string;
      cost: number;
      type: string;
      stock: number;
    },
  ) {
    return this.rewardsService.createReward(body);
  }

  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Patch('admin/rewards/:id')
  async updateReward(@Param('id') id: string, @Body() body: any) {
    return this.rewardsService.updateReward(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Delete('admin/rewards/:id')
  async deleteReward(@Param('id') id: string) {
    return this.rewardsService.deleteReward(id);
  }
}
