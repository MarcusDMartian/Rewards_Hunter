// ============================================
// USERS CONTROLLER
// ============================================

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async findAll(@Query('orgId') orgId?: string) {
    return this.usersService.findAll(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Patch('users/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('teams')
  async getTeams(@CurrentUser() user: any) {
    return this.usersService.getTeams(user.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period = 'all',
    @Query('teamId') teamId?: string,
  ) {
    return this.usersService.getLeaderboard(period, teamId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Superadmin', 'Admin')
  @Get('admin/join-requests')
  async getJoinRequests(@CurrentUser() user: any) {
    return this.usersService.getJoinRequests(user.orgId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SystemAdmin')
  @Get('admin/organizations')
  async getAllOrganizations() {
    return this.usersService.getAllOrganizations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SystemAdmin')
  @Get('admin/stats')
  async getPlatformStats() {
    return this.usersService.getPlatformStats();
  }
}
