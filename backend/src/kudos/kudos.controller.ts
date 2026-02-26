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

@Controller('kudos')
@UseGuards(JwtAuthGuard)
export class KudosController {
  constructor(private kudosService: KudosService) {}

  @Get()
  async findAll(@Query('teamId') teamId?: string) {
    return this.kudosService.findAll(teamId);
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() body: { receiverId: string; coreValue: string; message: string },
  ) {
    return this.kudosService.create({
      senderId: user.id,
      ...body,
    });
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kudosService.toggleLike(id, user.id);
  }
}
