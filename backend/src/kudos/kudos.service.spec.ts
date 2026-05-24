// ============================================
// KUDOS SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { KudosService } from './kudos.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

const mockKudos = {
  id: 'k1',
  senderId: 'u1',
  receiverId: 'u2',
  coreValue: 'Kaizen',
  message: 'Great work!',
  createdAt: new Date(),
  sender: {
    id: 'u1',
    name: 'Sender',
    avatar: 'a1.png',
    role: 'Member',
    teamId: 't1',
  },
  receiver: {
    id: 'u2',
    name: 'Receiver',
    avatar: 'a2.png',
    role: 'Member',
    teamId: 't1',
  },
  likes: [{ userId: 'u3' }],
};

const mockPrisma = {
  kudos: {
    findMany: jest.fn().mockResolvedValue([mockKudos]),
    create: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  kudosLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockGamification = {
  processEvent: jest.fn().mockResolvedValue({ points: 10 }),
};

describe('KudosService', () => {
  let service: KudosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KudosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GamificationService, useValue: mockGamification },
      ],
    }).compile();

    service = module.get<KudosService>(KudosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return formatted kudos list', async () => {
      mockPrisma.kudos.findMany.mockResolvedValue([mockKudos]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].likes).toBe(1);
      expect(result[0].likedBy).toContain('u3');
      expect(result[0].sender.name).toBe('Sender');
    });

    it('should filter by team if teamId given', async () => {
      mockPrisma.kudos.findMany.mockResolvedValue([mockKudos]);
      const result = await service.findAll('t1');
      expect(result).toHaveLength(1);

      const result2 = await service.findAll('nonexistent-team');
      expect(result2).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create and return formatted kudos', async () => {
      mockPrisma.kudos.create.mockResolvedValue({ ...mockKudos, likes: [] });
      const result = await service.create({
        senderId: 'u1',
        receiverId: 'u2',
        coreValue: 'Kaizen',
        message: 'Great!',
      });
      expect(result.coreValue).toBe('Kaizen');
      expect(result.likes).toBe(0);
    });

    it('should award points to both sender and receiver', async () => {
      mockPrisma.kudos.create.mockResolvedValue({ ...mockKudos, likes: [] });
      await service.create({
        senderId: 'u1',
        receiverId: 'u2',
        coreValue: 'Kaizen',
        message: 'Great!',
      });
      expect(mockGamification.processEvent).toHaveBeenCalledWith(
        'u1',
        'kudos_sent',
        'k1',
      );
      expect(mockGamification.processEvent).toHaveBeenCalledWith(
        'u2',
        'kudos_received',
        'k1',
      );
    });

    it('should reject self-kudos', async () => {
      await expect(
        service.create({
          senderId: 'u1',
          receiverId: 'u1',
          coreValue: 'Kaizen',
          message: 'Self praise',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleLike', () => {
    it('should add like when not exists', async () => {
      mockPrisma.kudosLike.findUnique.mockResolvedValue(null);
      mockPrisma.kudosLike.create.mockResolvedValue({});
      const result = await service.toggleLike('k1', 'u1');
      expect(result.liked).toBe(true);
    });

    it('should remove like when exists', async () => {
      mockPrisma.kudosLike.findUnique.mockResolvedValue({ id: 'l1' });
      mockPrisma.kudosLike.delete.mockResolvedValue({});
      const result = await service.toggleLike('k1', 'u1');
      expect(result.liked).toBe(false);
    });
  });
});
