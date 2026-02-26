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
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterOrgDto, JoinRequestDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    return {
      accessToken,
      user: this.formatUser(user),
      organization: user.organization,
    };
  }

  // Register new organization
  async registerOrg(dto: RegisterOrgDto) {
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

  // Submit join request
  async submitJoinRequest(dto: JoinRequestDto) {
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
    const { passwordHash, ...rest } = user;
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
      ...rest,
      badges,
      team: user.team?.name || 'General',
      teamId: user.teamId || '',
    };
  }
}
