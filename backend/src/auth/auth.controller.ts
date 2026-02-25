// ============================================
// AUTH CONTROLLER
// ============================================

import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterOrgDto, JoinRequestDto, CheckDomainDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard, Roles } from './roles.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('check-domain')
    async checkDomain(@Body() dto: CheckDomainDto) {
        return this.authService.checkDomain(dto.email);
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

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@CurrentUser() user: any) {
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
