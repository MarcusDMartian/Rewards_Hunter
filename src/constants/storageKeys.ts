// ============================================
// STORAGE KEYS - Centralized localStorage keys
// ============================================

export const STORAGE_KEYS = {
    // Auth & Users
    USERS: 'rh_users',
    CURRENT_USER: 'rh_current_user',
    AUTH_SESSION: 'rh_auth_session',
    ORGANIZATIONS: 'rh_organizations',

    // Features
    IDEAS: 'rh_kaizen_ideas',
    KUDOS: 'rh_kudos',
    REWARDS: 'rh_rewards',
    REDEMPTIONS: 'rh_redemptions',
    TRANSACTIONS: 'rh_transactions',
    MISSIONS: 'rh_missions',
    BADGES: 'rh_badges',
    FEEDBACK: 'rh_feedback_history',

    // Settings
    THEME: 'rh_theme',
    FEATURE_TOGGLES: 'rh_feature_toggles',
    ONBOARDING_COMPLETE: 'rh_onboarding_complete',
    DAILY_LOGIN: 'rh_daily_login',

    // Legacy keys (for migration)
    LEGACY_USERS: 'reward_hunter_users',
    LEGACY_ORGANIZATIONS: 'reward_hunter_organizations',
    LEGACY_SESSION: 'reward_hunter_session',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
