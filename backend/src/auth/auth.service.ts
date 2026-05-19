// ============================================
// AUTH SERVICE - Real authentication with JWT + bcrypt
// ============================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { LoginDto, RegisterOrgDto, JoinRequestDto } from './dto/auth.dto';
import * as nodemailer from 'nodemailer';

function createMailTransporter() {
  // Brevo (formerly Sendinblue) SMTP — works reliably from cloud provider IPs.
  // Falls back to Gmail SMTP if Brevo creds are absent.
  const brevoUser = process.env.BREVO_SMTP_USER;
  const brevoKey = process.env.BREVO_SMTP_KEY;
  if (brevoUser && brevoKey) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: { user: brevoUser, pass: brevoKey },
    });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
  }

  return null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private gamification: GamificationService,
  ) {}

  // Extract domain from email
  private extractDomain(email: string): string {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : '';
  }

  // Check if email domain belongs to an organization
  async checkDomain(email: string) {
    const domain = this.extractDomain(email);
    const org = await this.prisma.organization.findUnique({
      where: { domain },
    });

    if (!org) {
      return { exists: false };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return {
      exists: true,
      organization: org,
      userExists: !!existingUser,
    };
  }

  // Send OTP
  async sendOtp(email: string) {
    // TODO: restore real OTP after demo — hardcoded to 123456 for now
    const code = '123456';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour for demo

    // Invalidate old OTPs for this email
    await this.prisma.otpRecord.updateMany({
      where: { email: email.toLowerCase(), isUsed: false },
      data: { isUsed: true },
    });

    // Save new OTP
    await this.prisma.otpRecord.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    });

    // TODO: restore email sending after demo
    // const transporter = createMailTransporter();
    // if (!transporter) {
    //   console.log(`[OTP Stub] No mail provider configured. OTP for ${email}: ${code}`);
    //   return { success: true };
    // }
    // const fromAddress =
    //   process.env.BREVO_SMTP_USER || process.env.GMAIL_USER || 'noreply@rewardshunter.app';
    // try {
    //   const info = await transporter.sendMail({
    //     from: `"Reward Hunter" <${fromAddress}>`,
    //     to: email,
    //     subject: 'Your Reward Hunter Verification Code',
    //     text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.`,
    //     html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 5 minutes.</p>`,
    //   });
    //   console.log(`[OTP] Sent to ${email} (messageId=${info.messageId})`);
    // } catch (error) {
    //   console.error('[OTP Error] Failed to send OTP email:', (error as Error).message);
    //   throw new ConflictException('Failed to send OTP email');
    // }

    console.log(`[OTP Demo] Hardcoded OTP used for ${email}`);
    return { success: true };
  }

  // Login with email and password
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        team: true,
        organization: true,
        userBadges: { include: { badge: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is not active. Please wait for approval.',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Fire-and-forget: awards 5 pts + updates streak + daily mission progress
    this.gamification.processEvent(user.id, 'daily_login').catch(() => {});

    return {
      accessToken,
      user: this.formatUser(user),
      organization: user.organization,
    };
  }

  async registerOrg(dto: RegisterOrgDto) {
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        code: dto.otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    // Mark as used
    await this.prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const domain = this.extractDomain(dto.email);

    // Check if domain exists
    const existingOrg = await this.prisma.organization.findUnique({
      where: { domain },
    });
    if (existingOrg) {
      throw new ConflictException(
        'Organization with this domain already exists',
      );
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create org + default team + superadmin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.orgName, domain },
      });

      const defaultTeam = await tx.team.create({
        data: { name: 'General', orgId: org.id },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.name.replace(/\s/g, '')}`,
          role: 'Superadmin',
          position: 'Organization Owner',
          teamId: defaultTeam.id,
          orgId: org.id,
        },
      });

      return { org, user };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.formatUser(result.user),
      organization: result.org,
    };
  }

  async submitJoinRequest(dto: JoinRequestDto) {
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        code: dto.otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    // Mark as used
    await this.prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const org = await this.prisma.organization.findUnique({
      where: { id: dto.orgId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingRequest = await this.prisma.joinRequest.findFirst({
      where: { email: dto.email.toLowerCase(), status: 'PENDING' },
    });
    if (existingRequest) {
      throw new ConflictException(
        'A pending request already exists for this email',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.joinRequest.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        orgId: dto.orgId,
      },
    });

    return { success: true, message: 'Join request submitted successfully' };
  }

  // Approve join request (Superadmin)
  async approveJoinRequest(requestId: string) {
    const request = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const defaultTeam = await this.prisma.team.findFirst({
      where: { orgId: request.orgId },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      const user = await tx.user.create({
        data: {
          email: request.email,
          passwordHash: request.passwordHash,
          name: request.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name.replace(/\s/g, '')}`,
          role: 'Member',
          teamId: defaultTeam?.id,
          orgId: request.orgId,
        },
      });

      return user;
    });

    return { success: true, user: this.formatUser(result) };
  }

  // Reject join request
  async rejectJoinRequest(requestId: string) {
    const request = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    await this.prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return { success: true };
  }

  // Send OTP for forgot-password flow (requires existing user)
  async sendForgotPasswordOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('No account found for this email');
    }
    return this.sendOtp(email);
  }

  // Verify OTP for forgot-password and issue a short-lived reset token
  async verifyForgotPasswordOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('No account found for this email');
    }

    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        email: email.toLowerCase(),
        code: otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    await this.prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'password-reset' },
      { expiresIn: '15m' },
    );

    return { resetToken };
  }

  // Reset password using reset token, then auto-login
  async resetPassword(resetToken: string, newPassword: string) {
    let payload: { sub: string; email: string; purpose: string };
    try {
      payload = this.jwtService.verify(resetToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        team: true,
        organization: true,
        userBadges: { include: { badge: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    const loginPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(loginPayload);

    return {
      accessToken,
      user: this.formatUser({ ...user, passwordHash }),
      organization: user.organization,
    };
  }

  // Get user by ID (for JWT strategy)
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        organization: true,
        userBadges: { include: { badge: true } },
      },
    });
    return user ? this.formatUser(user) : null;
  }

  // Format user for API response (strip password hash)
  private formatUser(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    const badges =
      user.userBadges?.map((ub: any) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        color: ub.badge.color,
        description: ub.badge.description,
        unlocked: true,
      })) || [];

    return {
      ...safeUser,
      badges,
      team: user.team?.name || 'General',
      teamId: user.teamId || '',
    };
  }
}
