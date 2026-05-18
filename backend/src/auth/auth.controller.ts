// ============================================
// AUTH CONTROLLER
// ============================================

import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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

  // Light throttle: domain existence check is mostly idempotent
  @Throttle({ short: { ttl: 60_000, limit: 20 } })
  @Post('check-domain')
  async checkDomain(@Body() dto: CheckDomainDto) {
    return this.authService.checkDomain(dto.email);
  }

  // Strict: 3 OTPs per minute per IP, 10 per hour
  @Throttle({
    short: { ttl: 60_000, limit: 3 },
    long: { ttl: 3_600_000, limit: 10 },
  })
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email);
  }

  // Strict: 5 login attempts per minute per IP
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Strict: 3 org registrations per IP per hour
  @Throttle({ long: { ttl: 3_600_000, limit: 3 } })
  @Post('register-org')
  async registerOrg(@Body() dto: RegisterOrgDto) {
    return this.authService.registerOrg(dto);
  }

  // Moderate: 10 join requests per IP per hour
  @Throttle({ long: { ttl: 3_600_000, limit: 10 } })
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
