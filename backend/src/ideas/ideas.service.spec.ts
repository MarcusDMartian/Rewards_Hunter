// ============================================
// IDEAS SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { IdeasService } from './ideas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockIdea = {
  id: 'idea1',
  title: 'Test Idea',
  problem: 'Test problem',
  proposal: 'Test proposal',
  impact: 'Cost',
  status: 'New',
  creatorId: 'u1',
  teamId: 't1',
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: {
    id: 'u1',
    name: 'User',
    avatar: 'avatar.png',
    role: 'Member',
    teamId: 't1',
  },
  votes: [{ voterId: 'u2' }],
  comments: [
    {
      id: 'c1',
      userId: 'u2',
      text: 'Great idea',
      createdAt: new Date(),
      user: { id: 'u2', name: 'User 2', avatar: 'a2.png' },
    },
  ],
  follows: [{ userId: 'u3' }],
};

const mockPrisma = {
  kaizenIdea: {
    findMany: jest.fn().mockResolvedValue([mockIdea]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  kaizenVote: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  kaizenFollow: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  kaizenComment: {
    create: jest.fn(),
  },
};

describe('IdeasService', () => {
  let service: IdeasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IdeasService>(IdeasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return formatted ideas', async () => {
      mockPrisma.kaizenIdea.findMany.mockResolvedValue([mockIdea]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].votes).toBe(1);
      expect(result[0].author.name).toBe('User');
      expect(result[0].comments).toHaveLength(1);
      expect(result[0].followers).toContain('u3');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing idea', async () => {
      mockPrisma.kaizenIdea.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return formatted idea', async () => {
      mockPrisma.kaizenIdea.findUnique.mockResolvedValue(mockIdea);
      const result = await service.findOne('idea1');
      expect(result.id).toBe('idea1');
      expect(result.votedBy).toContain('u2');
    });
  });

  describe('create', () => {
    it('should create and return idea', async () => {
      const newIdea = {
        ...mockIdea,
        votes: [],
        comments: [],
        follows: [],
      };
      mockPrisma.kaizenIdea.create.mockResolvedValue(newIdea);

      const result = await service.create({
        title: 'Test',
        problem: 'P',
        proposal: 'S',
        impact: 'Cost',
        creatorId: 'u1',
      });
      expect(result.title).toBe('Test Idea');
      expect(result.votes).toBe(0);
    });
  });

  describe('toggleVote', () => {
    it('should add vote when not exists', async () => {
      mockPrisma.kaizenVote.findUnique.mockResolvedValue(null);
      mockPrisma.kaizenVote.create.mockResolvedValue({});
      const result = await service.toggleVote('idea1', 'u1');
      expect(result.voted).toBe(true);
    });

    it('should remove vote when exists', async () => {
      mockPrisma.kaizenVote.findUnique.mockResolvedValue({ id: 'v1' });
      mockPrisma.kaizenVote.delete.mockResolvedValue({});
      const result = await service.toggleVote('idea1', 'u1');
      expect(result.voted).toBe(false);
    });
  });

  describe('toggleFollow', () => {
    it('should add follow when not exists', async () => {
      mockPrisma.kaizenFollow.findUnique.mockResolvedValue(null);
      mockPrisma.kaizenFollow.create.mockResolvedValue({});
      const result = await service.toggleFollow('idea1', 'u1');
      expect(result.following).toBe(true);
    });

    it('should remove follow when exists', async () => {
      mockPrisma.kaizenFollow.findUnique.mockResolvedValue({ id: 'f1' });
      mockPrisma.kaizenFollow.delete.mockResolvedValue({});
      const result = await service.toggleFollow('idea1', 'u1');
      expect(result.following).toBe(false);
    });
  });

  describe('addComment', () => {
    it('should create comment and return formatted data', async () => {
      mockPrisma.kaizenComment.create.mockResolvedValue({
        id: 'c1',
        ideaId: 'idea1',
        userId: 'u1',
        text: 'Nice!',
        createdAt: new Date('2026-01-01'),
        user: { id: 'u1', name: 'User', avatar: 'a.png' },
      });

      const result = await service.addComment('idea1', 'u1', 'Nice!');
      expect(result.text).toBe('Nice!');
      expect(result.userName).toBe('User');
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update idea status', async () => {
      mockPrisma.kaizenIdea.update.mockResolvedValue({
        id: 'idea1',
        status: 'Approved',
      });
      const result = await service.updateStatus('idea1', 'Approved');
      expect(result.status).toBe('Approved');
    });
  });
});
