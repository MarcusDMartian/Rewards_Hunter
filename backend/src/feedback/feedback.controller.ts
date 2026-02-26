// ============================================
// FEEDBACK CONTROLLER
// ============================================

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('templates')
  async getTemplates() {
    return this.feedbackService.getTemplates();
  }

  @Post()
  async submit(
    @CurrentUser() user: any,
    @Body()
    body: {
      templateId: string;
      targetType: string;
      targetId?: string;
      content: any;
      score?: number;
    },
  ) {
    return this.feedbackService.submitFeedback(user.id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('Admin', 'Superadmin', 'SystemAdmin')
  @Get('summary')
  async getSummary(@Query('targetType') targetType?: string) {
    return this.feedbackService.getSummary(targetType);
  }
}
