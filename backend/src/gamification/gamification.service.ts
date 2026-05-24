// ============================================
// GAMIFICATION SERVICE - Missions, Badges, Events, Levels
// Points are driven by PointRule records (admin-configurable)
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // EVENTS ENGINE (reads PointRule from DB)
  // ============================================

  async processEvent(userId: string, eventType: string, referenceId?: string) {
    const rule = await this.prisma.pointRule.findUnique({ where: { eventType } });
    const points = rule?.enabled ? (rule.points ?? 0) : 0;

    if (points > 0) {
      await this.awardPoints(userId, points, eventType, referenceId);
    }

    await this.updateMissionProgress(userId, eventType);
    await this.checkBadgeUnlock(userId, eventType);

    if (eventType === 'daily_login') {
      await this.updateStreak(userId);
    }

    return { points, eventType };
  }

  // ============================================
  // POINTS
  // ============================================

  private async awardPoints(userId: string, amount: number, source: string, referenceId?: string) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const newTotal = user.points + amount;
      let newLevel = user.level;
      let newNextLevel = user.nextLevelPoints;
      if (newTotal >= user.nextLevelPoints) {
        newLevel = user.level + 1;
        newNextLevel = Math.floor(user.nextLevelPoints * 1.5);
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: amount },
          monthlyPoints: { increment: amount },
          quarterlyPoints: { increment: amount },
          weeklyPoints: { increment: amount },
          level: newLevel,
          nextLevelPoints: newNextLevel,
        },
      });

      await tx.pointTransaction.create({
        data: { userId, amount, type: 'earn', source, referenceId, description: `Earned from: ${source}` },
      });
    });
  }

  // ============================================
  // MISSIONS
  // ============================================

  async getUserMissions(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userMissions = await this.prisma.userMission.findMany({
      where: { userId, periodStart: { gte: today } },
      include: { mission: true },
    });

    if (userMissions.length === 0) {
      const activeMissions = await this.prisma.mission.findMany({ where: { isActive: true } });
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      for (const mission of activeMissions) {
        const periodEnd = mission.type === 'weekly'
          ? new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          : endOfDay;
        await this.prisma.userMission.create({
          data: { userId, missionId: mission.id, periodStart: today, periodEnd },
        });
      }

      userMissions = await this.prisma.userMission.findMany({
        where: { userId, periodStart: { gte: today } },
        include: { mission: true },
      });
    }

    return userMissions.map((um) => ({
      id: um.mission.id,
      title: um.mission.title,
      description: um.mission.description,
      progress: um.progress,
      total: um.mission.targetCount,
      reward: um.mission.rewardPoints,
      completed: um.completed,
      claimed: um.claimed,
      type: um.mission.type,
    }));
  }

  async claimMission(userId: string, missionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userMission = await this.prisma.userMission.findFirst({
      where: { userId, missionId, periodStart: { gte: today }, completed: true, claimed: false },
      include: { mission: true },
    });

    if (!userMission) throw new NotFoundException('Mission not found or not claimable');

    await this.prisma.userMission.update({ where: { id: userMission.id }, data: { claimed: true } });
    await this.awardPoints(userId, userMission.mission.rewardPoints, 'mission_completed', missionId);

    return { reward: userMission.mission.rewardPoints };
  }

  private async updateMissionProgress(userId: string, eventType: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userMissions = await this.prisma.userMission.findMany({
      where: { userId, periodStart: { gte: today }, completed: false },
      include: { mission: true },
    });

    for (const um of userMissions) {
      if (um.mission.triggerEvent === eventType) {
        const newProgress = um.progress + 1;
        const completed = newProgress >= um.mission.targetCount;
        await this.prisma.userMission.update({
          where: { id: um.id },
          data: { progress: newProgress, completed },
        });
      }
    }
  }

  // ============================================
  // BADGES (with rarity + progress)
  // ============================================

  async getAllBadges(userId: string) {
    const allBadges = await this.prisma.badge.findMany({
      orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
    });
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const unlockedIds = new Set(userBadges.map((ub) => ub.badgeId));

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kaizenIdeas: true, kudosSent: true, kudosReceived: true },
    });

    return allBadges.map((b) => {
      let criteria: { type?: string; count?: number } = {};
      try { criteria = JSON.parse(b.criteriaJson); } catch { /* skip */ }

      const targetCount = criteria.count ?? 0;
      let rawProgress = 0;

      if (user && targetCount > 0) {
        switch (criteria.type) {
          case 'ideas_count':    rawProgress = user.kaizenIdeas.length; break;
          case 'kudos_received': rawProgress = user.kudosReceived.length; break;
          case 'kudos_sent':     rawProgress = user.kudosSent.length; break;
          case 'streak':         rawProgress = user.streak; break;
        }
      }

      return {
        id: b.id, name: b.name, icon: b.icon, color: b.color,
        description: b.description, rarity: b.rarity,
        unlocked: unlockedIds.has(b.id),
        progress: Math.min(rawProgress, targetCount),
        targetCount,
      };
    });
  }

  private async checkBadgeUnlock(userId: string, _eventType: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kaizenIdeas: true, kudosSent: true, kudosReceived: true, userBadges: true },
    });
    if (!user) return;

    const unlockedIds = new Set(user.userBadges.map((ub) => ub.badgeId));
    const badges = await this.prisma.badge.findMany();

    for (const badge of badges) {
      if (unlockedIds.has(badge.id)) continue;
      let criteria: { type?: string; count?: number } = {};
      try { criteria = JSON.parse(badge.criteriaJson); } catch { continue; }

      let shouldUnlock = false;
      const count = criteria.count ?? 0;
      switch (criteria.type) {
        case 'ideas_count':    shouldUnlock = user.kaizenIdeas.length >= count; break;
        case 'kudos_received': shouldUnlock = user.kudosReceived.length >= count; break;
        case 'kudos_sent':     shouldUnlock = user.kudosSent.length >= count; break;
        case 'streak':         shouldUnlock = user.streak >= count; break;
      }

      if (shouldUnlock) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id, reason: 'Auto-unlocked' },
        });
      }
    }
  }

  // ============================================
  // BADGE ADMIN CRUD
  // ============================================

  async createBadge(data: { name: string; icon?: string; color?: string; description?: string; criteriaJson?: string; rarity?: string }) {
    return this.prisma.badge.create({ data });
  }

  async updateBadge(id: string, data: Partial<{ name: string; icon: string; color: string; description: string; criteriaJson: string; rarity: string }>) {
    return this.prisma.badge.update({ where: { id }, data });
  }

  async deleteBadge(id: string) {
    await this.prisma.userBadge.deleteMany({ where: { badgeId: id } });
    await this.prisma.badge.delete({ where: { id } });
    return { deleted: true };
  }

  // ============================================
  // MISSION ADMIN CRUD
  // ============================================

  async createMission(data: { title: string; description?: string; type?: string; triggerEvent: string; targetCount?: number; rewardPoints?: number }) {
    return this.prisma.mission.create({ data });
  }

  async updateMission(id: string, data: Partial<{ title: string; description: string; type: string; triggerEvent: string; targetCount: number; rewardPoints: number; isActive: boolean }>) {
    return this.prisma.mission.update({ where: { id }, data });
  }

  async deleteMission(id: string) {
    await this.prisma.userMission.deleteMany({ where: { missionId: id } });
    await this.prisma.mission.delete({ where: { id } });
    return { deleted: true };
  }

  // ============================================
  // POINT RULES ADMIN CRUD
  // ============================================

  async getAllPointRules() {
    return this.prisma.pointRule.findMany({ orderBy: { eventType: 'asc' } });
  }

  async updatePointRule(id: string, data: Partial<{ points: number; dailyLimit: number; enabled: boolean; label: string }>) {
    return this.prisma.pointRule.update({ where: { id }, data });
  }

  // ============================================
  // STREAK
  // ============================================

  private async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;
    if (user.lastActiveDate === yesterday) newStreak = user.streak + 1;
    else if (user.lastActiveDate === today) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: { streak: newStreak, lastActiveDate: today },
    });
  }
}
