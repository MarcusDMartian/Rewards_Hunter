// ============================================
// GAMIFICATION SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    pointTransaction: { create: jest.fn() },
    mission: { findMany: jest.fn() },
    userMission: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    badge: { findMany: jest.fn() },
    userBadge: { findMany: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
};

describe('GamificationService', () => {
    let service: GamificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamificationService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<GamificationService>(GamificationService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processEvent', () => {
        beforeEach(() => {
            // Mock all dependencies to avoid cascading calls
            mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1', points: 100, level: 1, nextLevelPoints: 200, streak: 0,
                lastActiveDate: null,
                kaizenIdeas: [], kudosSent: [], kudosReceived: [], userBadges: [],
            });
            mockPrisma.user.update.mockResolvedValue({});
            mockPrisma.pointTransaction.create.mockResolvedValue({});
            mockPrisma.userMission.findMany.mockResolvedValue([]);
            mockPrisma.badge.findMany.mockResolvedValue([]);
            mockPrisma.userBadge.findMany.mockResolvedValue([]);
        });

        it('should award 50 points for idea_created', async () => {
            const result = await service.processEvent('u1', 'idea_created');
            expect(result.points).toBe(50);
            expect(result.eventType).toBe('idea_created');
        });

        it('should award 10 points for kudos_sent', async () => {
            const result = await service.processEvent('u1', 'kudos_sent');
            expect(result.points).toBe(10);
        });

        it('should award 5 points for daily_login', async () => {
            const result = await service.processEvent('u1', 'daily_login');
            expect(result.points).toBe(5);
        });

        it('should award 0 points for unknown event', async () => {
            const result = await service.processEvent('u1', 'unknown_event');
            expect(result.points).toBe(0);
        });
    });

    describe('getUserMissions', () => {
        it('should return missions for today', async () => {
            mockPrisma.userMission.findMany.mockResolvedValue([{
                progress: 1,
                completed: false,
                claimed: false,
                mission: {
                    id: 'm1', title: 'Submit an idea', description: '', targetCount: 3,
                    rewardPoints: 50, type: 'daily',
                },
            }]);

            const result = await service.getUserMissions('u1');
            expect(result).toHaveLength(1);
            expect(result[0].progress).toBe(1);
            expect(result[0].total).toBe(3);
        });

        it('should assign missions if none exist for today', async () => {
            // First call returns empty (no missions today) -> second call returns created missions
            mockPrisma.userMission.findMany
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{
                    progress: 0, completed: false, claimed: false,
                    mission: { id: 'm1', title: 'Created', description: '', targetCount: 1, rewardPoints: 10, type: 'daily' },
                }]);

            mockPrisma.mission.findMany.mockResolvedValue([
                { id: 'm1', title: 'Created', type: 'daily', isActive: true },
            ]);
            mockPrisma.userMission.create.mockResolvedValue({});

            const result = await service.getUserMissions('u1');
            expect(result).toHaveLength(1);
        });
    });

    describe('claimMission', () => {
        it('should throw NotFoundException if mission not claimable', async () => {
            mockPrisma.userMission.findFirst.mockResolvedValue(null);
            await expect(service.claimMission('u1', 'bad'))
                .rejects.toThrow(NotFoundException);
        });

        it('should claim reward points', async () => {
            mockPrisma.userMission.findFirst.mockResolvedValue({
                id: 'um1', completed: true, claimed: false,
                mission: { id: 'm1', rewardPoints: 50 },
            });
            mockPrisma.userMission.update.mockResolvedValue({});
            mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1', points: 100, level: 1, nextLevelPoints: 200,
            });

            const result = await service.claimMission('u1', 'm1');
            expect(result.reward).toBe(50);
        });
    });

    describe('getAllBadges', () => {
        it('should return badges with unlock status', async () => {
            mockPrisma.badge.findMany.mockResolvedValue([
                { id: 'b1', name: 'Early Bird', icon: '🐦', color: 'bg-blue-100', description: '' },
                { id: 'b2', name: 'Star', icon: '⭐', color: 'bg-yellow-100', description: '' },
            ]);
            mockPrisma.userBadge.findMany.mockResolvedValue([{ badgeId: 'b1' }]);

            const result = await service.getAllBadges('u1');
            expect(result).toHaveLength(2);
            expect(result[0].unlocked).toBe(true);
            expect(result[1].unlocked).toBe(false);
        });
    });
});
