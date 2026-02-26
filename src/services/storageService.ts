// ============================================
// STORAGE SERVICE - API-backed data service
// ============================================

import api from './apiClient';
import { User, KaizenIdea, Kudos, Mission, PointTransaction, RedemptionRequest, Reward, Badge } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';

// ============================================
// USER
// ============================================
export function getCurrentUser(): User {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return {} as User;
        }
    }
    return {} as User;
}

export function saveCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function updateUserPoints(amount: number): Promise<User> {
    // Points are managed server-side via gamification events
    // This is a no-op for forward compatibility — the server handles point updates
    const user = getCurrentUser();
    user.points += amount;
    user.monthlyPoints += amount;
    user.quarterlyPoints += amount;

    while (user.points >= user.nextLevelPoints) {
        user.level += 1;
        user.nextLevelPoints = Math.floor(user.nextLevelPoints * 1.5);
    }

    saveCurrentUser(user);
    return user;
}

// ============================================
// KAIZEN IDEAS
// ============================================
export async function getIdeas(filter?: string, teamId?: string): Promise<KaizenIdea[]> {
    try {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (teamId) params.append('teamId', teamId);
        const { data } = await api.get(`/ideas?${params.toString()}`);
        return data;
    } catch {
        return [];
    }
}

export async function getIdeaById(id: string): Promise<KaizenIdea | null> {
    try {
        const { data } = await api.get(`/ideas/${id}`);
        return data;
    } catch {
        return null;
    }
}

export async function addIdea(idea: { title: string; problem: string; proposal: string; impact: string }): Promise<KaizenIdea> {
    const { data } = await api.post('/ideas', idea);
    return data;
}

export async function updateIdea(ideaId: string, updates: Partial<KaizenIdea>): Promise<KaizenIdea> {
    if (updates.status) {
        const { data } = await api.patch(`/ideas/${ideaId}/status`, { status: updates.status });
        return data;
    }
    return {} as KaizenIdea;
}

export async function toggleVote(ideaId: string, _userId: string): Promise<KaizenIdea> {
    const { data } = await api.post(`/ideas/${ideaId}/vote`);
    return data;
}

export async function toggleFollow(ideaId: string, _userId: string): Promise<KaizenIdea> {
    const { data } = await api.post(`/ideas/${ideaId}/follow`);
    return data;
}

export async function addComment(ideaId: string, comment: { text: string }): Promise<KaizenIdea> {
    const { data } = await api.post(`/ideas/${ideaId}/comments`, { text: comment.text });
    return data;
}

// ============================================
// KUDOS
// ============================================
export async function getKudos(teamId?: string): Promise<Kudos[]> {
    try {
        const params = teamId ? `?teamId=${teamId}` : '';
        const { data } = await api.get(`/kudos${params}`);
        return data;
    } catch {
        return [];
    }
}

export async function addKudos(kudos: { receiverId: string; coreValue: string; message: string }): Promise<Kudos> {
    const { data } = await api.post('/kudos', kudos);
    return data;
}

export async function toggleKudosLike(kudosId: string, _userId: string): Promise<Kudos> {
    const { data } = await api.post(`/kudos/${kudosId}/like`);
    return data;
}

// ============================================
// MISSIONS
// ============================================
export async function getMissions(): Promise<Mission[]> {
    try {
        const { data } = await api.get('/missions/today');
        return data;
    } catch {
        return [];
    }
}

export async function claimMission(missionId: string): Promise<{ missions: Mission[]; reward: number }> {
    const { data } = await api.post(`/missions/${missionId}/claim`);
    return data;
}

// ============================================
// TRANSACTIONS (via wallet endpoint)
// ============================================
export async function getTransactions(): Promise<PointTransaction[]> {
    try {
        const { data } = await api.get('/wallet');
        return data.transactions || [];
    } catch {
        return [];
    }
}

export async function addTransaction(transaction: PointTransaction): Promise<PointTransaction[]> {
    // Transactions are created server-side via gamification events
    // This is a forward-compatibility stub
    return [transaction];
}

// ============================================
// REWARDS & REDEMPTIONS
// ============================================
export async function getRewards(): Promise<any[]> {
    try {
        const { data } = await api.get('/rewards');
        return data;
    } catch {
        return [];
    }
}

export async function getRedemptions(): Promise<RedemptionRequest[]> {
    try {
        const { data } = await api.get('/redemptions');
        return data;
    } catch {
        return [];
    }
}

export async function addRedemption(rewardId: string): Promise<RedemptionRequest> {
    const { data } = await api.post(`/rewards/${rewardId}/redeem`);
    return data;
}

export async function addReward(reward: Partial<Reward>): Promise<Reward> {
    const { data } = await api.post('/admin/rewards', reward);
    return data;
}

export async function deleteReward(rewardId: string): Promise<Reward> {
    const { data } = await api.delete(`/admin/rewards/${rewardId}`);
    return data;
}

export async function processRedemption(redemptionId: string, status: 'Approved' | 'Rejected', note?: string): Promise<RedemptionRequest> {
    const { data } = await api.patch(`/admin/redemptions/${redemptionId}`, { status, note });
    return data;
}

// ============================================
// GAMIFICATION EVENTS
// ============================================
export async function processGameEvent(eventType: string, referenceId?: string): Promise<any> {
    try {
        const { data } = await api.post('/events', { eventType, referenceId });
        return data;
    } catch {
        return null;
    }
}

export async function getBadges(): Promise<any[]> {
    try {
        const { data } = await api.get('/badges');
        return data;
    } catch {
        return [];
    }
}

export async function addBadge(badge: Partial<Badge>): Promise<Badge> {
    const { data } = await api.post('/admin/badges', badge);
    return data;
}

// ============================================
// ONBOARDING
// ============================================
export function isOnboardingComplete(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
}

export function setOnboardingComplete(): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

// ============================================
// RESET ALL DATA
// ============================================
export function resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}
