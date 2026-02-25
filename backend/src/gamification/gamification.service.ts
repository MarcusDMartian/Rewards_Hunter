// ============================================
// GAMIFICATION SERVICE - Missions, Badges, Events, Levels
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    // ============================================
    // EVENTS ENGINE
    // ============================================

    async processEvent(userId: string, eventType: string, referenceId?: string) {
        // 1. Award points based on event type
        const pointsMap: Record<string, number> = {
            idea_created: 50,
            idea_approved: 100,
            idea_implemented: 200,
            kudos_sent: 10,
            kudos_received: 15,
            daily_login: 5,
        };

        const points = pointsMap[eventType] || 0;

        if (points > 0) {
            await this.awardPoints(userId, points, eventType, referenceId);
        }

        // 2. Update mission progress
        await this.updateMissionProgress(userId, eventType);

        // 3. Check badge criteria
        await this.checkBadgeUnlock(userId, eventType);

        // 4. Update streak for daily_login
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
            await tx.user.update({
                where: { id: userId },
                data: {
                    points: { increment: amount },
                    monthlyPoints: { increment: amount },
                    quarterlyPoints: { increment: amount },
                },
            });

            await tx.pointTransaction.create({
                data: {
                    userId,
                    amount,
                    type: 'earn',
                    source,
                    referenceId,
                    description: `Earned from: ${source}`,
                },
            });

            // Check level up
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user && user.points + amount >= user.nextLevelPoints) {
                const newLevel = user.level + 1;
                const newNextLevel = Math.floor(user.nextLevelPoints * 1.5);
                await tx.user.update({
                    where: { id: userId },
                    data: { level: newLevel, nextLevelPoints: newNextLevel },
                });
            }
        });
    }

    // ============================================
    // MISSIONS
    // ============================================

    async getUserMissions(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let userMissions = await this.prisma.userMission.findMany({
            where: {
                userId,
                periodStart: { gte: today },
            },
            include: { mission: true },
        });

        // If no missions for today, assign active missions
        if (userMissions.length === 0) {
            const activeMissions = await this.prisma.mission.findMany({
                where: { isActive: true },
            });

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            for (const mission of activeMissions) {
                const periodEnd = mission.type === 'weekly'
                    ? new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    : endOfDay;

                await this.prisma.userMission.create({
                    data: {
                        userId,
                        missionId: mission.id,
                        periodStart: today,
                        periodEnd,
                    },
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

        if (!userMission) {
            throw new NotFoundException('Mission not found or not claimable');
        }

        await this.prisma.userMission.update({
            where: { id: userMission.id },
            data: { claimed: true },
        });

        await this.awardPoints(userId, userMission.mission.rewardPoints, 'mission_completed', missionId);

        return { reward: userMission.mission.rewardPoints };
    }

    private async updateMissionProgress(userId: string, eventType: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userMissions = await this.prisma.userMission.findMany({
            where: {
                userId,
                periodStart: { gte: today },
                completed: false,
            },
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
    // BADGES
    // ============================================

    async getAllBadges(userId: string) {
        const allBadges = await this.prisma.badge.findMany();
        const userBadges = await this.prisma.userBadge.findMany({
            where: { userId },
            select: { badgeId: true },
        });
        const unlockedIds = new Set(userBadges.map((ub) => ub.badgeId));

        return allBadges.map((b) => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
            color: b.color,
            description: b.description,
            unlocked: unlockedIds.has(b.id),
        }));
    }

    private async checkBadgeUnlock(userId: string, eventType: string) {
        // Simple criteria-based badge unlock
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { kaizenIdeas: true, kudosSent: true, kudosReceived: true, userBadges: true },
        });
        if (!user) return;

        const unlockedIds = new Set(user.userBadges.map((ub) => ub.badgeId));
        const badges = await this.prisma.badge.findMany();

        for (const badge of badges) {
            if (unlockedIds.has(badge.id)) continue;

            let criteria: any = {};
            try { criteria = JSON.parse(badge.criteriaJson); } catch { continue; }

            let shouldUnlock = false;

            if (criteria.type === 'ideas_count' && user.kaizenIdeas.length >= (criteria.count || 5)) {
                shouldUnlock = true;
            } else if (criteria.type === 'kudos_received' && user.kudosReceived.length >= (criteria.count || 10)) {
                shouldUnlock = true;
            } else if (criteria.type === 'kudos_sent' && user.kudosSent.length >= (criteria.count || 20)) {
                shouldUnlock = true;
            } else if (criteria.type === 'streak' && user.streak >= (criteria.count || 30)) {
                shouldUnlock = true;
            }

            if (shouldUnlock) {
                await this.prisma.userBadge.create({
                    data: { userId, badgeId: badge.id, reason: `Auto-unlocked via ${eventType}` },
                });
            }
        }
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
        if (user.lastActiveDate === yesterday) {
            newStreak = user.streak + 1;
        } else if (user.lastActiveDate === today) {
            return; // Already logged in today
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { streak: newStreak, lastActiveDate: today },
        });
    }
}
