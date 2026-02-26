// ============================================
// AUTH SERVICE TESTS
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORAGE_KEYS } from '../../constants/storageKeys';

// Mock the apiClient module — vi.mock is hoisted above imports
vi.mock('../apiClient', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: 'http://localhost:3000/api', headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    };
    return { default: mockInstance };
});

import api from '../apiClient';
import {
    login,
    registerOrganization,
    fetchCurrentUser,
    checkDomain,
    logout,
} from '../authService';

const mockApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
};

const mockUser = {
    id: 'user_1',
    name: 'Test User',
    email: 'test@company.com',
    role: 'Member',
    team: 'Engineering',
    teamId: 'team_1',
    points: 100,
    level: 2,
    nextLevelPoints: 200,
    streak: 3,
    badges: [],
};

const mockOrg = { id: 'org_1', name: 'Company', domain: 'company.com' };

describe('authService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    // ---- login ----
    it('login() should return success with user on valid credentials', async () => {
        mockApi.post.mockResolvedValue({
            data: { accessToken: 'mock-jwt-token', user: mockUser, organization: mockOrg },
        });

        const result = await login({ email: 'test@company.com', password: 'password123' });

        expect(result.success).toBe(true);
        expect(result.user?.email).toBe('test@company.com');
    });

    it('login() should store token in localStorage', async () => {
        mockApi.post.mockResolvedValue({
            data: { accessToken: 'mock-jwt-token', user: mockUser, organization: mockOrg },
        });

        await login({ email: 'test@company.com', password: 'password123' });

        expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('mock-jwt-token');
    });

    it('login() should store user in localStorage', async () => {
        mockApi.post.mockResolvedValue({
            data: { accessToken: 'mock-jwt-token', user: mockUser, organization: mockOrg },
        });

        await login({ email: 'test@company.com', password: 'password123' });

        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!).email).toBe('test@company.com');
    });

    it('login() should return success:false on API error', async () => {
        mockApi.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

        const result = await login({ email: 'wrong@test.com', password: 'wrong' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
    });

    // ---- registerOrganization ----
    it('registerOrganization() should return success with user', async () => {
        mockApi.post.mockResolvedValue({
            data: { accessToken: 'mock-jwt-token', user: mockUser, organization: mockOrg },
        });

        const result = await registerOrganization({
            email: 'admin@company.com',
            password: 'password123',
            name: 'Admin User',
            orgName: 'My Company',
        });

        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
    });

    it('registerOrganization() should store token in localStorage', async () => {
        mockApi.post.mockResolvedValue({
            data: { accessToken: 'mock-jwt-token', user: mockUser, organization: mockOrg },
        });

        await registerOrganization({
            email: 'admin@company.com',
            password: 'password123',
            name: 'Admin User',
            orgName: 'My Company',
        });

        expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('mock-jwt-token');
    });

    // ---- fetchCurrentUser ----
    it('fetchCurrentUser() should return user when token exists', async () => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token');
        mockApi.get.mockResolvedValue({ data: mockUser });

        const result = await fetchCurrentUser();

        expect(result.user).toBeTruthy();
        expect(result.user?.email).toBe('test@company.com');
    });

    it('fetchCurrentUser() should return null user when no token', async () => {
        const result = await fetchCurrentUser();

        expect(result.user).toBeNull();
        expect(result.organization).toBeNull();
    });

    // ---- checkDomain ----
    it('checkDomain() should return org data', async () => {
        mockApi.post.mockResolvedValue({
            data: { exists: true, organization: mockOrg },
        });

        const result = await checkDomain('user@company.com');

        expect(result.exists).toBe(true);
        expect(result.organization.domain).toBe('company.com');
    });

    // ---- logout ----
    it('logout() should clear all auth data from localStorage', () => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'some-token');
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, '{"id":"1"}');
        localStorage.setItem(STORAGE_KEYS.AUTH_ORG, '{"id":"org_1"}');

        logout();

        expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
        expect(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)).toBeNull();
        expect(localStorage.getItem(STORAGE_KEYS.AUTH_ORG)).toBeNull();
    });
});
