// ============================================
// AUTH SERVICE TESTS
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock PrismaService
const mockPrisma = {
  organization: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  joinRequest: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  team: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // checkDomain
  // ============================================

  describe('checkDomain', () => {
    it('should return exists: false for unknown domain', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      const result = await service.checkDomain('test@unknown.com');
      expect(result.exists).toBe(false);
    });

    it('should return exists: true for known domain', async () => {
      const org = { id: 'org1', name: 'Test Org', domain: 'known.com' };
      mockPrisma.organization.findUnique.mockResolvedValue(org);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.checkDomain('test@known.com');
      expect(result.exists).toBe(true);
      expect(result.organization).toEqual(org);
      expect(result.userExists).toBe(false);
    });

    it('should report userExists when user already exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org1',
        domain: 'known.com',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@known.com',
      });

      const result = await service.checkDomain('test@known.com');
      expect(result.exists).toBe(true);
      expect(result.userExists).toBe(true);
    });
  });

  // ============================================
  // login
  // ============================================

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@user.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: hash,
        isActive: true,
        role: 'Member',
        userBadges: [],
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: hash,
        isActive: true,
        role: 'Member',
        name: 'Test User',
        userBadges: [],
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'correct-password',
      });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: hash,
        isActive: false,
        role: 'Member',
        userBadges: [],
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ============================================
  // registerOrg
  // ============================================

  describe('registerOrg', () => {
    it('should throw ConflictException if domain exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
      await expect(
        service.registerOrg({
          email: 'admin@existing.com',
          password: '123456',
          name: 'Admin',
          orgName: 'Existing Org',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user email exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.registerOrg({
          email: 'admin@new.com',
          password: '123456',
          name: 'Admin',
          orgName: 'New Org',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create org and return token on success', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          organization: {
            create: jest.fn().mockResolvedValue({
              id: 'org1',
              name: 'New Org',
              domain: 'new.com',
            }),
          },
          team: {
            create: jest.fn().mockResolvedValue({ id: 't1', name: 'General' }),
          },
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'u1',
              email: 'admin@new.com',
              name: 'Admin',
              role: 'Superadmin',
              passwordHash: 'hash',
            }),
          },
        });
      });

      const result = await service.registerOrg({
        email: 'admin@new.com',
        password: '123456',
        name: 'Admin',
        orgName: 'New Org',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  // ============================================
  // submitJoinRequest
  // ============================================

  describe('submitJoinRequest', () => {
    it('should throw NotFoundException if org not found', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      await expect(
        service.submitJoinRequest({
          email: 'user@test.com',
          password: '123456',
          name: 'User',
          orgId: 'bad-org',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.submitJoinRequest({
          email: 'user@test.com',
          password: '123456',
          name: 'User',
          orgId: 'org1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create join request on success', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.joinRequest.findFirst.mockResolvedValue(null);
      mockPrisma.joinRequest.create.mockResolvedValue({ id: 'jr1' });

      const result = await service.submitJoinRequest({
        email: 'user@test.com',
        password: '123456',
        name: 'User',
        orgId: 'org1',
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // approveJoinRequest
  // ============================================

  describe('approveJoinRequest', () => {
    it('should throw NotFoundException if request not found', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue(null);
      await expect(service.approveJoinRequest('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should approve and create user', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue({
        id: 'jr1',
        email: 'user@test.com',
        name: 'User',
        passwordHash: 'h',
        orgId: 'org1',
      });
      mockPrisma.team.findFirst.mockResolvedValue({ id: 't1' });
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          joinRequest: { update: jest.fn() },
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'u1',
              email: 'user@test.com',
              name: 'User',
              role: 'Member',
              passwordHash: 'h',
            }),
          },
        });
      });

      const result = await service.approveJoinRequest('jr1');
      expect(result.success).toBe(true);
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  // ============================================
  // rejectJoinRequest
  // ============================================

  describe('rejectJoinRequest', () => {
    it('should throw NotFoundException if request not found', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue(null);
      await expect(service.rejectJoinRequest('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject successfully', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue({ id: 'jr1' });
      mockPrisma.joinRequest.update.mockResolvedValue({
        id: 'jr1',
        status: 'REJECTED',
      });

      const result = await service.rejectJoinRequest('jr1');
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // getUserById
  // ============================================

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.getUserById('bad-id');
      expect(result).toBeNull();
    });

    it('should return formatted user without passwordHash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        passwordHash: 'secret',
        role: 'Member',
        userBadges: [],
        team: { name: 'Engineering' },
      });

      const result = await service.getUserById('u1');
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result!.team).toBe('Engineering');
    });
  });
});
