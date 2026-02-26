// ============================================
// SYSTEM CONSTANTS - App configuration & enums
// ============================================
// This file contains ONLY system-level constants.
// Mock/seed data is in src/data/mockData.ts

import { Badge, Team } from './types';

// ============================================
// BADGES
// ============================================
export const ALL_BADGES: Badge[] = [
    { id: 'b1', name: 'Early Bird', icon: '🌅', color: 'bg-amber-500', description: 'Complete a mission before 9 AM' },
    { id: 'b2', name: 'Idea Machine', icon: '💡', color: 'bg-yellow-500', description: 'Submit 5 Kaizen ideas' },
    { id: 'b3', name: 'Kudos Star', icon: '⭐', color: 'bg-purple-500', description: 'Receive 10 Kudos from colleagues' },
    { id: 'b4', name: 'Top Performer', icon: '🏆', color: 'bg-indigo-500', description: 'Reach top 3 on the monthly leaderboard' },
    { id: 'b5', name: 'Bug Hunter', icon: '🐞', color: 'bg-red-500', description: 'Report or fix 5 technical issues' },
    { id: 'b6', name: 'Team Player', icon: '🤝', color: 'bg-emerald-500', description: 'Send 20 Kudos to your teammates' },
    { id: 'b7', name: 'Streak Master', icon: '🔥', color: 'bg-orange-500', description: 'Maintain a 30-day activity streak' },
    { id: 'b8', name: 'Innovator', icon: '🚀', color: 'bg-blue-500', description: 'Have 3 ideas implemented' },
];

// ============================================
// TEAMS
// ============================================
export const TEAMS: Team[] = [
    { id: 't1', name: 'Engineering' },
    { id: 't2', name: 'Product' },
    { id: 't3', name: 'Design' },
    { id: 't4', name: 'Marketing' },
    { id: 't5', name: 'Sales' },
    { id: 't6', name: 'HR' },
];

// ============================================
// CORE VALUES
// ============================================
export const CORE_VALUES = [
    { id: 'cv1', name: 'Kaizen', color: 'bg-indigo-500', description: 'Continuous improvement' },
    { id: 'cv2', name: 'Collaboration', color: 'bg-emerald-500', description: 'Working together' },
    { id: 'cv3', name: 'Ownership', color: 'bg-amber-500', description: 'Taking responsibility' },
    { id: 'cv4', name: 'Customer First', color: 'bg-rose-500', description: 'Putting customers first' },
];

// ============================================
// FEEDBACK TEMPLATES
// ============================================
export const FEEDBACK_TEMPLATES = [
    { id: 'ft1', name: 'Start/Stop/Continue', type: 'start_stop_continue' as const },
    { id: 'ft2', name: 'NPS Score', type: 'nps' as const },
    { id: 'ft3', name: '4L Framework', type: 'four_l' as const },
    { id: 'ft4', name: 'Open Feedback', type: 'open' as const },
];

// ============================================
// IMPACT TYPES
// ============================================
export const IMPACT_TYPES = [
    { id: 'cost', name: 'Cost Saving', icon: '💰', color: 'text-emerald-600 bg-emerald-100' },
    { id: 'quality', name: 'Quality Improvement', icon: '✨', color: 'text-purple-600 bg-purple-100' },
    { id: 'speed', name: 'Speed/Efficiency', icon: '⚡', color: 'text-blue-600 bg-blue-100' },
    { id: 'safety', name: 'Safety', icon: '🛡️', color: 'text-red-600 bg-red-100' },
];
