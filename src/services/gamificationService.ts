// ============================================
// GAMIFICATION SERVICE - Backend API delegate
// ============================================
// Delegates gamification events to the backend API.
// Server handles mission progress, badge unlocking, and streak tracking.

import api from './apiClient';

export type GameEvent = 'idea_created' | 'kudos_sent' | 'kudos_received' | 'daily_login' | 'idea_approved' | 'redeem';

/**
 * Process a gamification event via the backend API.
 * Returns a summary of what happened for potential toast notification.
 */
export async function processGameEvent(eventType: GameEvent, referenceId?: string): Promise<{
    missionsUpdated: string[];
    badgesUnlocked: string[];
    streakUpdated: boolean;
}> {
    try {
        const { data } = await api.post('/events', { eventType, referenceId });
        return {
            missionsUpdated: data.missionsUpdated || [],
            badgesUnlocked: data.badgesUnlocked || [],
            streakUpdated: data.streakUpdated || false,
        };
    } catch {
        return { missionsUpdated: [], badgesUnlocked: [], streakUpdated: false };
    }
}
