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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId) {
        const where = {};
        if (orgId)
            where.orgId = orgId;
        const users = await this.prisma.user.findMany({
            where,
            include: { team: true, userBadges: { include: { badge: true } } },
            orderBy: { points: 'desc' },
        });
        return users.map(this.formatUser);
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { team: true, organization: true, userBadges: { include: { badge: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.formatUser(user);
    }
    async update(id, updates) {
        const user = await this.prisma.user.update({
            where: { id },
            data: updates,
            include: { team: true, userBadges: { include: { badge: true } } },
        });
        return this.formatUser(user);
    }
    async getTeams(orgId) {
        const where = {};
        if (orgId)
            where.orgId = orgId;
        return this.prisma.team.findMany({ where });
    }
    async getJoinRequests(orgId) {
        return this.prisma.joinRequest.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLeaderboard(period, teamId) {
        const where = { role: { not: 'SystemAdmin' } };
        if (teamId)
            where.teamId = teamId;
        const orderBy = {};
        if (period === 'monthly')
            orderBy.monthlyPoints = 'desc';
        else if (period === 'quarterly')
            orderBy.quarterlyPoints = 'desc';
        else
            orderBy.points = 'desc';
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
    formatUser(user) {
        const { passwordHash, ...rest } = user;
        const badges = user.userBadges?.map((ub) => ({
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map