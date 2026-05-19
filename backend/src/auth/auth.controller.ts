// ============================================
// AUTH CONTROLLER
// ============================================

import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterOrgDto,
  JoinRequestDto,
  CheckDomainDto,
  SendOtpDto,
  ForgotPasswordDto,
  VerifyForgotOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard, Roles } from './roles.guard';
import { CurrentUser } from './current-user.decorator';
import type { ReqUser } from '../common/interfaces/req-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('check-domain')
  async checkDomain(@Body() dto: CheckDomainDto) {
    return this.authService.checkDomain(dto.email);
  }

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-org')
  async registerOrg(@Body() dto: RegisterOrgDto) {
    return this.authService.registerOrg(dto);
  }

  @Post('join-request')
  async joinRequest(@Body() dto: JoinRequestDto) {
    return this.authService.submitJoinRequest(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendForgotPasswordOtp(dto.email);
  }

  @Post('forgot-password/verify')
  async verifyForgotPasswordOtp(@Body() dto: VerifyForgotOtpDto) {
    return this.authService.verifyForgotPasswordOtp(dto.email, dto.otp);
  }

  @Post('forgot-password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: ReqUser) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  @Post('join-requests/:id/approve')
  async approveJoinRequest(@Param('id') id: string) {
    return this.authService.approveJoinRequest(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Superadmin', 'Admin', 'SystemAdmin')
  @Post('join-requests/:id/reject')
  async rejectJoinRequest(@Param('id') id: string) {
    return this.authService.rejectJoinRequest(id);
  }
}
