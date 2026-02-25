"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GamificationService = class GamificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processEvent(userId, eventType, referenceId) {
        const pointsMap = {
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
        await this.updateMissionProgress(userId, eventType);
        await this.checkBadgeUnlock(userId, eventType);
        if (eventType === 'daily_login') {
            await this.updateStreak(userId);
        }
        return { points, eventType };
    }
    async awardPoints(userId, amount, source, referenceId) {
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
    async getUserMissions(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let userMissions = await this.prisma.userMission.findMany({
            where: {
                userId,
                periodStart: { gte: today },
            },
            include: { mission: true },
        });
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
    async claimMission(userId, missionId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const userMission = await this.prisma.userMission.findFirst({
            where: { userId, missionId, periodStart: { gte: today }, completed: true, claimed: false },
            include: { mission: true },
        });
        if (!userMission) {
            throw new common_1.NotFoundException('Mission not found or not claimable');
        }
        await this.prisma.userMission.update({
            where: { id: userMission.id },
            data: { claimed: true },
        });
        await this.awardPoints(userId, userMission.mission.rewardPoints, 'mission_completed', missionId);
        return { reward: userMission.mission.rewardPoints };
    }
    async updateMissionProgress(userId, eventType) {
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
    async getAllBadges(userId) {
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
    async checkBadgeUnlock(userId, eventType) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { kaizenIdeas: true, kudosSent: true, kudosReceived: true, userBadges: true },
        });
        if (!user)
            return;
        const unlockedIds = new Set(user.userBadges.map((ub) => ub.badgeId));
        const badges = await this.prisma.badge.findMany();
        for (const badge of badges) {
            if (unlockedIds.has(badge.id))
                continue;
            let criteria = {};
            try {
                criteria = JSON.parse(badge.criteriaJson);
            }
            catch {
                continue;
            }
            let shouldUnlock = false;
            if (criteria.type === 'ideas_count' && user.kaizenIdeas.length >= (criteria.count || 5)) {
                shouldUnlock = true;
            }
            else if (criteria.type === 'kudos_received' && user.kudosReceived.length >= (criteria.count || 10)) {
                shouldUnlock = true;
            }
            else if (criteria.type === 'kudos_sent' && user.kudosSent.length >= (criteria.count || 20)) {
                shouldUnlock = true;
            }
            else if (criteria.type === 'streak' && user.streak >= (criteria.count || 30)) {
                shouldUnlock = true;
            }
            if (shouldUnlock) {
                await this.prisma.userBadge.create({
                    data: { userId, badgeId: badge.id, reason: `Auto-unlocked via ${eventType}` },
                });
            }
        }
    }
    async updateStreak(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = 1;
        if (user.lastActiveDate === yesterday) {
            newStreak = user.streak + 1;
        }
        else if (user.lastActiveDate === today) {
            return;
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { streak: newStreak, lastActiveDate: today },
        });
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map