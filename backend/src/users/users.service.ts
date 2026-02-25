// ============================================
// USERS SERVICE
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(orgId?: string) {
        const where: any = {};
        if (orgId) where.orgId = orgId;

        const users = await this.prisma.user.findMany({
            where,
            include: { team: true, userBadges: { include: { badge: true } } },
            orderBy: { points: 'desc' },
        });

        return users.map(this.formatUser);
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { team: true, organization: true, userBadges: { include: { badge: true } } },
        });
        if (!user) throw new NotFoundException('User not found');
        return this.formatUser(user);
    }

    async update(id: string, updates: any) {
        const user = await this.prisma.user.update({
            where: { id },
            data: updates,
            include: { team: true, userBadges: { include: { badge: true } } },
        });
        return this.formatUser(user);
    }

    async getTeams(orgId?: string) {
        const where: any = {};
        if (orgId) where.orgId = orgId;
        return this.prisma.team.findMany({ where });
    }

    async getJoinRequests(orgId: string) {
        return this.prisma.joinRequest.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getLeaderboard(period: string, teamId?: string) {
        const where: any = { role: { not: 'SystemAdmin' } };
        if (teamId) where.teamId = teamId;

        const orderBy: any = {};
        if (period === 'monthly') orderBy.monthlyPoints = 'desc';
        else if (period === 'quarterly') orderBy.quarterlyPoints = 'desc';
        else orderBy.points = 'desc';

        const users = await this.prisma.user.findMany({
            where,
            include: { team: true, userBadges: { include: { badge: true } } },
            orderBy,
        });

        return users.map(this.formatUser);
    }

    async getPlatformStats() {
        const totalOrgs = await this.prisma.organization.count();
        const totalUsers = await this.prisma.user.count({ where: { role: { not: 'SystemAdmin' } } });
        const activeUsers = await this.prisma.user.count({ where: { isActive: true, role: { not: 'SystemAdmin' } } });
        const pendingRequests = await this.prisma.joinRequest.count({ where: { status: 'PENDING' } });

        return { totalOrganizations: totalOrgs, totalUsers, activeUsers, pendingRequests };
    }

    async getAllOrganizations() {
        return this.prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
    }

    private formatUser(user: any) {
        const { passwordHash, ...rest } = user;
        const badges = user.userBadges?.map((ub: any) => ({
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
