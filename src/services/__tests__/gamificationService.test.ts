// ============================================
// GAMIFICATION SERVICE TESTS
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the apiClient module
vi.mock('../apiClient', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: 'http://localhost:3000/api', headers: {}, timeout: 15000 },
        interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    };
    return { default: mockInstance };
});

import api from '../apiClient';
import { processGameEvent } from '../gamificationService';

const mockApi = api as unknown as { post: ReturnType<typeof vi.fn> };

describe('gamificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('processGameEvent() should call POST /events and return result', async () => {
        mockApi.post.mockResolvedValue({
            data: { missionsUpdated: ['Submit 3 ideas'], badgesUnlocked: [], streakUpdated: false },
        });

        const result = await processGameEvent('idea_created');

        expect(mockApi.post).toHaveBeenCalledWith('/events', { eventType: 'idea_created', referenceId: undefined });
        expect(result.missionsUpdated).toEqual(['Submit 3 ideas']);
        expect(result.badgesUnlocked).toEqual([]);
        expect(result.streakUpdated).toBe(false);
    });

    it('processGameEvent() should pass referenceId when provided', async () => {
        mockApi.post.mockResolvedValue({
            data: { missionsUpdated: [], badgesUnlocked: ['First Idea'], streakUpdated: false },
        });

        const result = await processGameEvent('kudos_sent', 'ref_123');

        expect(mockApi.post).toHaveBeenCalledWith('/events', { eventType: 'kudos_sent', referenceId: 'ref_123' });
        expect(result.badgesUnlocked).toEqual(['First Idea']);
    });

    it('processGameEvent() should return defaults on error', async () => {
        mockApi.post.mockRejectedValue(new Error('Network error'));

        const result = await processGameEvent('daily_login');
        expect(result).toEqual({ missionsUpdated: [], badgesUnlocked: [], streakUpdated: false });
    });
});
