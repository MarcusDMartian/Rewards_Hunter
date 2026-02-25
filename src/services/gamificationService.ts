// ============================================
// GAMIFICATION SERVICE - Frontend Auto-trigger
// ============================================
// Processes events locally via localStorage to update
// mission progress, badge unlocking, and streak tracking.

import { getMissions, saveMissions, getCurrentUser, saveCurrentUser } from './storageService';
import { User } from '../types';

export type GameEvent = 'idea_created' | 'kudos_sent' | 'kudos_received' | 'daily_login' | 'idea_approved' | 'redeem';

const BADGE_CRITERIA: Record<string, (user: User) => boolean> = {
    'First Idea': (u) => {
        const ideas = JSON.parse(localStorage.getItem('rh_ideas') || '[]');
        return ideas.some((i: any) => i.author?.id === u.id);
    },
    'Early Bird': (u) => u.streak >= 3,
    'Star Player': (u) => u.points >= 500,
    'Champion': (u) => u.points >= 1000,
    'Team Player': () => {
        const kudos = JSON.parse(localStorage.getItem('rh_kudos') || '[]');
        return kudos.length >= 5;
    },
};

/**
 * Process a gamification event: update mission progress + check badge unlocks.
 * Returns a summary of what happened for potential toast notification.
 */
export function processGameEvent(eventType: GameEvent): {
    missionsUpdated: string[];
    badgesUnlocked: string[];
    streakUpdated: boolean;
} {
    const result = { missionsUpdated: [] as string[], badgesUnlocked: [] as string[], streakUpdated: false };

    // 1) Mission progress
    const missions = getMissions();
    const eventToMissionKeyword: Record<string, string[]> = {
        idea_created: ['idea', 'kaizen', 'submit'],
        kudos_sent: ['kudos', 'recognize', 'send'],
        kudos_received: ['kudos', 'receive'],
        daily_login: ['login', 'active', 'daily'],
        idea_approved: ['idea', 'approve'],
        redeem: ['redeem', 'reward'],
    };

    const keywords = eventToMissionKeyword[eventType] || [];
    missions.forEach((mission) => {
        if (mission.completed) return;
        const titleLower = mission.title.toLowerCase();
        const matches = keywords.some(kw => titleLower.includes(kw));
        if (matches) {
            mission.progress = Math.min(mission.progress + 1, mission.total);
            if (mission.progress >= mission.total) {
                mission.completed = true;
            }
            result.missionsUpdated.push(mission.title);
        }
    });
    saveMissions(missions);

    // 2) Badge unlocking
    const user = getCurrentUser();
    const currentBadges = user.badges || [];
    currentBadges.forEach((badge) => {
        if (badge.unlocked) return;
        const checker = BADGE_CRITERIA[badge.name];
        if (checker && checker(user)) {
            badge.unlocked = true;
            result.badgesUnlocked.push(badge.name);
        }
    });
    user.badges = currentBadges;

    // 3) Streak tracking (on daily_login)
    if (eventType === 'daily_login') {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('rh_last_active_date');
        if (lastActive !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastActive === yesterday) {
                user.streak += 1;
            } else if (lastActive) {
                user.streak = 1; // reset
            } else {
                user.streak = 1;
            }
            localStorage.setItem('rh_last_active_date', today);
            result.streakUpdated = true;
        }
    }

    saveCurrentUser(user);
    return result;
}
