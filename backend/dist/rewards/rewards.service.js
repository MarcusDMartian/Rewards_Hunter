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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RewardsService = class RewardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWallet(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { points: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const transactions = await this.prisma.pointTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return {
            balance: user.points,
            transactions: transactions.map((t) => ({
                id: t.id,
                userId: t.userId,
                description: t.description,
                amount: t.amount,
                type: t.type,
                source: t.source,
                date: t.createdAt.toISOString(),
            })),
        };
    }
    async getCatalog() {
        return this.prisma.reward.findMany({
            where: { isActive: true },
            orderBy: { cost: 'asc' },
        });
    }
    async redeem(userId, rewardId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        if (reward.stock <= 0)
            throw new common_1.BadRequestException('Reward out of stock');
        if (user.points < reward.cost)
            throw new common_1.BadRequestException('Not enough points');
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: reward.cost } },
            });
            await tx.reward.update({
                where: { id: rewardId },
                data: { stock: { decrement: 1 } },
            });
            await tx.pointTransaction.create({
                data: {
                    userId,
                    amount: -reward.cost,
                    type: 'spend',
                    source: 'redeem',
                    referenceId: rewardId,
                    description: `Redeemed: ${reward.name}`,
                },
            });
            const redemption = await tx.redemptionRequest.create({
                data: {
                    userId,
                    rewardId,
                    rewardName: reward.name,
                    pointsCost: reward.cost,
                },
            });
            return redemption;
        });
        return result;
    }
    async getRedemptions(userId) {
        return this.prisma.redemptionRequest.findMany({
            where: { userId },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async getAllRedemptions(status) {
        const where = {};
        if (status)
            where.status = status;
        return this.prisma.redemptionRequest.findMany({
            where,
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async processRedemption(id, status, processedBy, note) {
        const redemption = await this.prisma.redemptionRequest.findUnique({ where: { id } });
        if (!redemption)
            throw new common_1.NotFoundException('Redemption not found');
        if (status === 'Rejected') {
            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: redemption.userId },
                    data: { points: { increment: redemption.pointsCost } },
                });
                await tx.reward.update({
                    where: { id: redemption.rewardId },
                    data: { stock: { increment: 1 } },
                });
                await tx.pointTransaction.create({
                    data: {
                        userId: redemption.userId,
                        amount: redemption.pointsCost,
                        type: 'earn',
                        source: 'admin_adjust',
                        description: `Refund: ${redemption.rewardName} (rejected)`,
                    },
                });
            });
        }
        return this.prisma.redemptionRequest.update({
            where: { id },
            data: { status, processedBy, processedAt: new Date(), note },
        });
    }
    async createReward(data) {
        return this.prisma.reward.create({ data });
    }
    async updateReward(id, data) {
        return this.prisma.reward.update({ where: { id }, data });
    }
    async deleteReward(id) {
        return this.prisma.reward.update({ where: { id }, data: { isActive: false } });
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map