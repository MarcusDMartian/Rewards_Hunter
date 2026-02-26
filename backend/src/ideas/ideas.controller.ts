// ============================================
// IDEAS CONTROLLER
// ============================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ideas')
@UseGuards(JwtAuthGuard)
export class IdeasController {
  constructor(private ideasService: IdeasService) {}

  @Get()
  async findAll(
    @Query('filter') filter?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.ideasService.findAll(filter, teamId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body()
    body: { title: string; problem: string; proposal: string; impact: string },
  ) {
    return this.ideasService.create({
      ...body,
      creatorId: user.id,
      teamId: user.teamId,
    });
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ideasService.toggleVote(id, user.id);
  }

  @Post(':id/follow')
  async follow(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ideasService.toggleFollow(id, user.id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { text: string },
  ) {
    return this.ideasService.addComment(id, user.id, body.text);
  }

  @UseGuards(RolesGuard)
  @Roles('Leader', 'Admin', 'Superadmin', 'SystemAdmin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.ideasService.updateStatus(id, body.status);
  }
}
