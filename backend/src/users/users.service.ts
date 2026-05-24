// ============================================
// USERS SERVICE
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      include: {
        team: true,
        organization: true,
        userBadges: { include: { badge: true } },
      },
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

  async getLeaderboard(period: string, teamId?: string, orgId?: string) {
    const where: any = { role: { not: 'SystemAdmin' }, isActive: true };
    if (teamId && teamId !== 'all') where.teamId = teamId;
    if (orgId) where.orgId = orgId;

    const orderBy: any = {};
    if (period === 'week') orderBy.weeklyPoints = 'desc';
    else if (period === 'month') orderBy.monthlyPoints = 'desc';
    else if (period === 'quarter') orderBy.quarterlyPoints = 'desc';
    else orderBy.points = 'desc'; // 'all'

    const users = await this.prisma.user.findMany({
      where,
      include: {
        team: true,
        userBadges: { include: { badge: true } },
        kaizenIdeas: { select: { id: true } },
        kudosReceived: { select: { id: true } },
      },
      orderBy,
    });

    // Get last week's rank snapshots for trend calculation
    const lastWeekStart = (() => {
      const now = new Date();
      const day = now.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon - 7); // previous Monday
      return mon.toISOString().split('T')[0];
    })();

    const snapshots = await this.prisma.rankSnapshot.findMany({
      where: { weekStart: lastWeekStart, ...(orgId ? { orgId } : {}) },
      select: { userId: true, rank: true },
    });
    const prevRankMap = new Map(snapshots.map((s) => [s.userId, s.rank]));

    return users.map((user, index) => {
      const currentRank = index + 1;
      const prevRank = prevRankMap.get(user.id);
      let trend: 'up' | 'down' | 'same' | 'new' = 'new';
      if (prevRank !== undefined) {
        if (currentRank < prevRank) trend = 'up';
        else if (currentRank > prevRank) trend = 'down';
        else trend = 'same';
      }

      return {
        ...this.formatUserForLeaderboard(user),
        rank: currentRank,
        trend,
        ideasCount: user.kaizenIdeas.length,
        kudosCount: user.kudosReceived.length,
        badgesCount: user.userBadges.length,
        periodPoints:
          period === 'week' ? user.weeklyPoints
          : period === 'month' ? user.monthlyPoints
          : period === 'quarter' ? user.quarterlyPoints
          : user.points,
      };
    });
  }

  async getBurnoutRisks(orgId: string) {
    // Burnout: activity this week < 50% of avg activity over previous 4 weeks
    // Activity = weeklyPoints earned (using RankSnapshot as a proxy)
    const now = new Date();
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() + diffToMon);
    currentMonday.setHours(0, 0, 0, 0);

    const users = await this.prisma.user.findMany({
      where: { orgId, isActive: true, role: { not: 'SystemAdmin' } },
      select: { id: true, name: true, avatar: true, weeklyPoints: true, teamId: true, team: true },
    });

    const flags: { userId: string; name: string; avatar: string; team: string; currentWeekPts: number; avgPts: number; dropPercent: number }[] = [];

    for (const user of users) {
      // Current week points
      const currentWeekPts = user.weeklyPoints;

      // Avg of previous 4 weeks via RankSnapshot
      const prevWeeks: string[] = [];
      for (let i = 1; i <= 4; i++) {
        const d = new Date(currentMonday);
        d.setDate(currentMonday.getDate() - i * 7);
        prevWeeks.push(d.toISOString().split('T')[0]);
      }
      const snapshots = await this.prisma.rankSnapshot.findMany({
        where: { userId: user.id, weekStart: { in: prevWeeks } },
        select: { points: true },
      });

      if (snapshots.length < 2) continue; // not enough data

      const avgPts = snapshots.reduce((s, r) => s + r.points, 0) / snapshots.length;
      if (avgPts === 0) continue;

      const dropPercent = Math.round(((avgPts - currentWeekPts) / avgPts) * 100);
      if (dropPercent >= 50) {
        flags.push({
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          team: (user.team as any)?.name ?? 'General',
          currentWeekPts,
          avgPts: Math.round(avgPts),
          dropPercent,
        });
      }
    }

    return flags.sort((a, b) => b.dropPercent - a.dropPercent);
  }

  async getPlatformStats() {
    const totalOrgs = await this.prisma.organization.count();
    const totalUsers = await this.prisma.user.count({
      where: { role: { not: 'SystemAdmin' } },
    });
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true, role: { not: 'SystemAdmin' } },
    });
    const pendingRequests = await this.prisma.joinRequest.count({
      where: { status: 'PENDING' },
    });

    return {
      totalOrganizations: totalOrgs,
      totalUsers,
      activeUsers,
      pendingRequests,
    };
  }

  async getAllOrganizations() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

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

  private formatUserForLeaderboard(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, kaizenIdeas, kudosReceived, ...safeUser } = user;
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
