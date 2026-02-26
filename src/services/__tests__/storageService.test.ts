// ============================================
// STORAGE SERVICE TESTS
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORAGE_KEYS } from '../../constants/storageKeys';

// Mock the apiClient module — vi.mock is hoisted above imports
vi.mock('../apiClient', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: 'http://localhost:3000/api', headers: {}, timeout: 15000 },
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    };
    return { default: mockInstance };
});

// Static imports — vi.mock is hoisted so these get the mocked version
import api from '../apiClient';
import {
    getCurrentUser,
    saveCurrentUser,
    getIdeas,
    addIdea,
    getKudos,
    addKudos,
    getMissions,
    getTransactions,
    getRedemptions,
    addRedemption,
    updateUserPoints,
} from '../storageService';

// Helper to type the mock
const mockApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
};

const mockUser = {
    id: 'user_1',
    name: 'Test User',
    email: 'test@company.com',
    points: 100,
    monthlyPoints: 50,
    quarterlyPoints: 100,
    level: 2,
    nextLevelPoints: 200,
    streak: 3,
    badges: [],
};

const mockIdeas = [
    { id: 'idea_1', title: 'Improve CI/CD pipeline', problem: 'Builds take too long', proposal: 'Use caching', impact: 'Speed', status: 'New', votes: 5, votedBy: [], author: mockUser, teamId: 'team_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [], followers: [] },
];

const mockKudos = [
    { id: 'kudos_1', sender: mockUser, receiver: { ...mockUser, id: 'user_2', name: 'Jane' }, coreValue: 'Kaizen', message: 'Great work!', createdAt: new Date().toISOString(), likes: 2, likedBy: [] },
];

const mockMissions = [
    { id: 'mission_1', title: 'Submit 3 ideas', description: '', progress: 1, total: 3, reward: 50, completed: false, claimed: false, type: 'weekly' },
];

const mockTransactions = [
    { id: 'tx_1', userId: 'user_1', description: 'Submitted idea', amount: 50, type: 'earn', source: 'idea_created', referenceId: 'idea_1', date: new Date().toISOString() },
];

describe('storageService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    // ---- getCurrentUser ----
    it('getCurrentUser() should return stored user from localStorage', () => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockUser));
        const user = getCurrentUser();
        expect(user.id).toBe('user_1');
        expect(user.name).toBe('Test User');
    });

    it('getCurrentUser() should return empty object when no stored user', () => {
        const user = getCurrentUser();
        expect(user).toBeDefined();
    });

    // ---- saveCurrentUser ----
    it('saveCurrentUser() should persist user to localStorage', () => {
        saveCurrentUser(mockUser as any);
        const stored = getCurrentUser();
        expect(stored.id).toBe('user_1');
    });

    // ---- getIdeas ----
    it('getIdeas() should fetch ideas from API', async () => {
        mockApi.get.mockResolvedValue({ data: mockIdeas });
        const ideas = await getIdeas();
        expect(ideas.length).toBe(1);
        expect(ideas[0].title).toBe('Improve CI/CD pipeline');
    });

    it('getIdeas() should return empty array on API error', async () => {
        mockApi.get.mockRejectedValue(new Error('Network error'));
        const ideas = await getIdeas();
        expect(ideas).toEqual([]);
    });

    // ---- addIdea ----
    it('addIdea() should post idea to API', async () => {
        mockApi.post.mockResolvedValue({ data: mockIdeas[0] });
        const idea = await addIdea({ title: 'New', problem: 'Test', proposal: 'Fix', impact: 'Speed' });
        expect(idea.title).toBe('Improve CI/CD pipeline');
        expect(mockApi.post).toHaveBeenCalledWith('/ideas', expect.objectContaining({ title: 'New' }));
    });

    // ---- getKudos ----
    it('getKudos() should fetch kudos from API', async () => {
        mockApi.get.mockResolvedValue({ data: mockKudos });
        const kudos = await getKudos();
        expect(kudos.length).toBe(1);
        expect(kudos[0].coreValue).toBe('Kaizen');
    });

    // ---- addKudos ----
    it('addKudos() should post kudos to API', async () => {
        mockApi.post.mockResolvedValue({ data: mockKudos[0] });
        const kudos = await addKudos({ receiverId: 'user_2', coreValue: 'Teamwork', message: 'Thanks!' });
        expect(kudos).toBeDefined();
        expect(mockApi.post).toHaveBeenCalledWith('/kudos', expect.objectContaining({ receiverId: 'user_2' }));
    });

    // ---- getMissions ----
    it('getMissions() should fetch missions from API', async () => {
        mockApi.get.mockResolvedValue({ data: mockMissions });
        const missions = await getMissions();
        expect(missions.length).toBe(1);
        expect(missions[0].title).toBe('Submit 3 ideas');
    });

    // ---- getTransactions ----
    it('getTransactions() should fetch transactions from API', async () => {
        mockApi.get.mockResolvedValue({ data: { transactions: mockTransactions } });
        const txs = await getTransactions();
        expect(txs.length).toBe(1);
        expect(txs[0].amount).toBe(50);
    });

    // ---- getRedemptions ----
    it('getRedemptions() should fetch redemptions from API', async () => {
        mockApi.get.mockResolvedValue({ data: [] });
        const redemptions = await getRedemptions();
        expect(Array.isArray(redemptions)).toBe(true);
    });

    // ---- addRedemption ----
    it('addRedemption() should post redemption to API', async () => {
        mockApi.post.mockResolvedValue({ data: { id: 'red_1', status: 'Pending' } });
        const result = await addRedemption('reward_1');
        expect(result.status).toBe('Pending');
    });

    // ---- updateUserPoints ----
    it('updateUserPoints() should update local user points', async () => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockUser));
        await updateUserPoints(50);
        const user = getCurrentUser();
        expect(user.points).toBe(150);
    });
});
