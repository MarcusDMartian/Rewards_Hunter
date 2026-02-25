// ============================================
// REWARDS SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
    user: { findUnique: jest.fn() },
    reward: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    pointTransaction: { findMany: jest.fn(), create: jest.fn() },
    redemptionRequest: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    $transaction: jest.fn(),
};

describe('RewardsService', () => {
    let service: RewardsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RewardsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<RewardsService>(RewardsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getWallet', () => {
        it('should throw NotFoundException for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.getWallet('bad-id')).rejects.toThrow(NotFoundException);
        });

        it('should return balance and transactions', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ points: 500 });
            mockPrisma.pointTransaction.findMany.mockResolvedValue([
                { id: 't1', userId: 'u1', amount: 50, type: 'earn', source: 'idea_created', description: 'Test', createdAt: new Date() },
            ]);

            const result = await service.getWallet('u1');
            expect(result.balance).toBe(500);
            expect(result.transactions).toHaveLength(1);
        });
    });

    describe('getCatalog', () => {
        it('should return active rewards', async () => {
            mockPrisma.reward.findMany.mockResolvedValue([
                { id: 'r1', name: 'Coffee', cost: 100, stock: 5, isActive: true },
            ]);
            const result = await service.getCatalog();
            expect(result).toHaveLength(1);
        });
    });

    describe('redeem', () => {
        it('should throw NotFoundException for bad user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.redeem('bad', 'r1')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException for bad reward', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', points: 500 });
            mockPrisma.reward.findUnique.mockResolvedValue(null);
            await expect(service.redeem('u1', 'bad')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if out of stock', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', points: 500 });
            mockPrisma.reward.findUnique.mockResolvedValue({ id: 'r1', cost: 100, stock: 0 });
            await expect(service.redeem('u1', 'r1')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if not enough points', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', points: 50 });
            mockPrisma.reward.findUnique.mockResolvedValue({ id: 'r1', cost: 100, stock: 5 });
            await expect(service.redeem('u1', 'r1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('processRedemption', () => {
        it('should throw NotFoundException for bad redemption', async () => {
            mockPrisma.redemptionRequest.findUnique.mockResolvedValue(null);
            await expect(service.processRedemption('bad', 'Approved', 'admin'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('createReward', () => {
        it('should create reward', async () => {
            mockPrisma.reward.create.mockResolvedValue({ id: 'r1', name: 'New', cost: 200 });
            const result = await service.createReward({
                name: 'New', cost: 200, type: 'Voucher', stock: 10,
            });
            expect(result.name).toBe('New');
        });
    });

    describe('deleteReward', () => {
        it('should soft-delete reward', async () => {
            mockPrisma.reward.update.mockResolvedValue({ id: 'r1', isActive: false });
            const result = await service.deleteReward('r1');
            expect(result.isActive).toBe(false);
        });
    });
});
