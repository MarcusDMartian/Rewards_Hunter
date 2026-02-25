// ============================================
// FEEDBACK SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
    feedbackTemplate: { findMany: jest.fn(), findUnique: jest.fn() },
    feedbackEntry: { findMany: jest.fn(), create: jest.fn() },
    feedbackIdentityMap: { create: jest.fn() },
    $transaction: jest.fn(),
};

describe('FeedbackService', () => {
    let service: FeedbackService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeedbackService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<FeedbackService>(FeedbackService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getTemplates', () => {
        it('should return active templates', async () => {
            mockPrisma.feedbackTemplate.findMany.mockResolvedValue([
                { id: 't1', name: 'NPS', type: 'nps', isActive: true },
                { id: 't2', name: 'Start Stop Continue', type: 'start_stop_continue', isActive: true },
            ]);
            const result = await service.getTemplates();
            expect(result).toHaveLength(2);
        });
    });

    describe('submitFeedback', () => {
        it('should throw NotFoundException for bad template', async () => {
            mockPrisma.feedbackTemplate.findUnique.mockResolvedValue(null);
            await expect(service.submitFeedback('u1', {
                templateId: 'bad', targetType: 'company', content: {},
            })).rejects.toThrow(NotFoundException);
        });

        it('should create feedback entry with identity separation', async () => {
            mockPrisma.feedbackTemplate.findUnique.mockResolvedValue({ id: 't1', name: 'NPS' });
            mockPrisma.$transaction.mockImplementation(async (cb) => {
                return cb({
                    feedbackEntry: {
                        create: jest.fn().mockResolvedValue({ id: 'f1' }),
                    },
                    feedbackIdentityMap: {
                        create: jest.fn().mockResolvedValue({}),
                    },
                });
            });

            const result = await service.submitFeedback('u1', {
                templateId: 't1', targetType: 'company', content: { score: 8 }, score: 8,
            });
            expect(result.success).toBe(true);
            expect(result.id).toBe('f1');
        });
    });

    describe('getSummary', () => {
        it('should return aggregated summary without identity', async () => {
            mockPrisma.feedbackEntry.findMany.mockResolvedValue([
                { id: 'f1', targetType: 'company', score: 8, createdAt: new Date(), template: { type: 'nps' } },
                { id: 'f2', targetType: 'company', score: 6, createdAt: new Date(), template: { type: 'nps' } },
                { id: 'f3', targetType: 'team', score: null, createdAt: new Date(), template: { type: 'start_stop_continue' } },
            ]);

            const result = await service.getSummary();
            expect(result.totalEntries).toBe(3);
            expect(result.averageNPS).toBe(7);
            expect(result.byType.company).toBe(2);
            expect(result.byType.team).toBe(1);
            // Verify no identity info is exposed
            result.recentEntries.forEach((entry: any) => {
                expect(entry).not.toHaveProperty('userId');
                expect(entry).not.toHaveProperty('userName');
            });
        });
    });
});
