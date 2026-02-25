// ============================================
// REWARDS SERVICE - Wallet, Catalog, Redemption
// ============================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
    constructor(private prisma: PrismaService) { }

    // Wallet: get user balance + transaction history
    async getWallet(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { points: true },
        });
        if (!user) throw new NotFoundException('User not found');

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

    // Catalog: list active rewards
    async getCatalog() {
        return this.prisma.reward.findMany({
            where: { isActive: true },
            orderBy: { cost: 'asc' },
        });
    }

    // Redeem a reward
    async redeem(userId: string, rewardId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward) throw new NotFoundException('Reward not found');
        if (reward.stock <= 0) throw new BadRequestException('Reward out of stock');
        if (user.points < reward.cost) throw new BadRequestException('Not enough points');

        const result = await this.prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: reward.cost } },
            });

            // Reduce stock
            await tx.reward.update({
                where: { id: rewardId },
                data: { stock: { decrement: 1 } },
            });

            // Create transaction
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

            // Create redemption request
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

    // Get user's redemption history
    async getRedemptions(userId: string) {
        return this.prisma.redemptionRequest.findMany({
            where: { userId },
            orderBy: { requestedAt: 'desc' },
        });
    }

    // Admin: get all redemptions
    async getAllRedemptions(status?: string) {
        const where: any = {};
        if (status) where.status = status;
        return this.prisma.redemptionRequest.findMany({
            where,
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            orderBy: { requestedAt: 'desc' },
        });
    }

    // Admin: process redemption
    async processRedemption(id: string, status: 'Approved' | 'Rejected', processedBy: string, note?: string) {
        const redemption = await this.prisma.redemptionRequest.findUnique({ where: { id } });
        if (!redemption) throw new NotFoundException('Redemption not found');

        // If rejecting, refund points
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

    // Admin: CRUD rewards
    async createReward(data: { name: string; description?: string; image?: string; cost: number; type: string; stock: number }) {
        return this.prisma.reward.create({ data });
    }

    async updateReward(id: string, data: any) {
        return this.prisma.reward.update({ where: { id }, data });
    }

    async deleteReward(id: string) {
        return this.prisma.reward.update({ where: { id }, data: { isActive: false } });
    }
}
