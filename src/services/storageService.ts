// ============================================
// STORAGE SERVICE - LOCALSTORAGE PERSISTENCE
// ============================================

import { User, KaizenIdea, Kudos, Mission, PointTransaction, RedemptionRequest } from '../types';
import { CURRENT_USER, MOCK_IDEAS, MOCK_KUDOS, MOCK_MISSIONS, MOCK_TRANSACTIONS } from '../data/mockData';
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
            return CURRENT_USER;
        }
    }
    return CURRENT_USER;
}

export function saveCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function updateUserPoints(amount: number): User {
    const user = getCurrentUser();
    user.points += amount;
    user.monthlyPoints += amount;
    user.quarterlyPoints += amount;

    // Level up check
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
export function getIdeas(): KaizenIdea[] {
    const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return MOCK_IDEAS;
        }
    }
    return MOCK_IDEAS;
}

export function saveIdeas(ideas: KaizenIdea[]): void {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
}

export function addIdea(idea: KaizenIdea): KaizenIdea[] {
    const ideas = getIdeas();
    ideas.unshift(idea);
    saveIdeas(ideas);
    return ideas;
}

export function updateIdea(ideaId: string, updates: Partial<KaizenIdea>): KaizenIdea[] {
    const ideas = getIdeas();
    const index = ideas.findIndex(i => i.id === ideaId);
    if (index !== -1) {
        ideas[index] = { ...ideas[index], ...updates };
        saveIdeas(ideas);
    }
    return ideas;
}

export function toggleVote(ideaId: string, userId: string): KaizenIdea[] {
    const ideas = getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (idea) {
        const hasVoted = idea.votedBy.includes(userId);
        if (hasVoted) {
            idea.votedBy = idea.votedBy.filter(id => id !== userId);
            idea.votes -= 1;
        } else {
            idea.votedBy.push(userId);
            idea.votes += 1;
        }
        saveIdeas(ideas);
    }
    return ideas;
}

export function toggleFollow(ideaId: string, userId: string): KaizenIdea[] {
    const ideas = getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (idea) {
        const isFollowing = idea.followers.includes(userId);
        if (isFollowing) {
            idea.followers = idea.followers.filter(id => id !== userId);
        } else {
            idea.followers.push(userId);
        }
        saveIdeas(ideas);
    }
    return ideas;
}

export function addComment(ideaId: string, comment: { id: string; userId: string; userName: string; userAvatar: string; text: string; createdAt: string }): KaizenIdea[] {
    const ideas = getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (idea) {
        idea.comments.push(comment);
        saveIdeas(ideas);
    }
    return ideas;
}

// ============================================
// KUDOS
// ============================================
export function getKudos(): Kudos[] {
    const stored = localStorage.getItem(STORAGE_KEYS.KUDOS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return MOCK_KUDOS;
        }
    }
    return MOCK_KUDOS;
}

export function saveKudos(kudos: Kudos[]): void {
    localStorage.setItem(STORAGE_KEYS.KUDOS, JSON.stringify(kudos));
}

export function addKudos(kudos: Kudos): Kudos[] {
    const allKudos = getKudos();
    allKudos.unshift(kudos);
    saveKudos(allKudos);
    return allKudos;
}

export function toggleKudosLike(kudosId: string, userId: string): Kudos[] {
    const allKudos = getKudos();
    const kudos = allKudos.find(k => k.id === kudosId);
    if (kudos) {
        const hasLiked = kudos.likedBy.includes(userId);
        if (hasLiked) {
            kudos.likedBy = kudos.likedBy.filter(id => id !== userId);
            kudos.likes -= 1;
        } else {
            kudos.likedBy.push(userId);
            kudos.likes += 1;
        }
        saveKudos(allKudos);
    }
    return allKudos;
}

// ============================================
// MISSIONS
// ============================================
export function getMissions(): Mission[] {
    const stored = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return MOCK_MISSIONS;
        }
    }
    return MOCK_MISSIONS;
}

export function saveMissions(missions: Mission[]): void {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
}

export function claimMission(missionId: string): { missions: Mission[]; reward: number } {
    const missions = getMissions();
    const mission = missions.find(m => m.id === missionId);
    let reward = 0;
    if (mission && mission.completed && !mission.claimed) {
        mission.claimed = true;
        reward = mission.reward;
        saveMissions(missions);
        updateUserPoints(reward);
        addTransaction({
            id: `pt_${Date.now()}`,
            userId: getCurrentUser().id,
            description: `Completed mission: ${mission.title}`,
            amount: reward,
            type: 'earn',
            source: 'mission_completed',
            date: new Date().toISOString(),
        });
    }
    return { missions, reward };
}

export function updateMissionProgress(missionId: string, progress: number): Mission[] {
    const missions = getMissions();
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
        mission.progress = Math.min(progress, mission.total);
        if (mission.progress >= mission.total) {
            mission.completed = true;
        }
        saveMissions(missions);
    }
    return missions;
}

// ============================================
// TRANSACTIONS
// ============================================
export function getTransactions(): PointTransaction[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return MOCK_TRANSACTIONS;
        }
    }
    return MOCK_TRANSACTIONS;
}

export function saveTransactions(transactions: PointTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function addTransaction(transaction: PointTransaction): PointTransaction[] {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return transactions;
}

// ============================================
// REDEMPTIONS
// ============================================
export function getRedemptions(): RedemptionRequest[] {
    const stored = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

export function saveRedemptions(redemptions: RedemptionRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
}

export function addRedemption(redemption: RedemptionRequest): RedemptionRequest[] {
    const redemptions = getRedemptions();
    redemptions.unshift(redemption);
    saveRedemptions(redemptions);
    return redemptions;
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
// AUTH
// ============================================
export function getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
}

export function setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, token);
}

export function clearAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

// ============================================
// RESET ALL DATA
// ============================================
export function resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}
