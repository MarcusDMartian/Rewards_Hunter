// ============================================
// SYSTEM CONSTANTS - App configuration & enums
// ============================================
// This file contains ONLY system-level constants.
// Mock/seed data is in src/data/mockData.ts

import { Badge, Team, CoreValueDef } from './types';

// ============================================
// BADGES
// ============================================
export const ALL_BADGES: Badge[] = [];

// ============================================
// TEAMS
// ============================================
export const TEAMS: Team[] = [];

// ============================================
// CORE VALUES — 6 values confirmed 2026-05-24
// Note: authoritative source is DB (CoreValue model).
// This constant is used as UI fallback when API is unavailable.
// ============================================
export const CORE_VALUES: CoreValueDef[] = [
    { key: 'ownership',     label: 'Ownership',      color: '#F97316', icon: '🎯', order: 0 },
    { key: 'customerFirst', label: 'Customer-first', color: '#0070CE', icon: '🌟', order: 1 },
    { key: 'kaizen',        label: 'Kaizen',         color: '#0070CE', icon: '♻️',  order: 2 },
    { key: 'teamUp',        label: 'Team-up',        color: '#8B5CF6', icon: '🤝', order: 3 },
    { key: 'integrity',     label: 'Integrity',      color: '#0D9488', icon: '🛡️', order: 4 },
    { key: 'biasForSpeed',  label: 'Bias for speed', color: '#10B981', icon: '⚡', order: 5 },
];

// ============================================
// FEEDBACK TEMPLATES
// ============================================
export const FEEDBACK_TEMPLATES: { id: string, name: string, type: 'start_stop_continue' | 'nps' | 'four_l' | 'open' }[] = [];

// ============================================
// IMPACT TYPES
// ============================================
export const IMPACT_TYPES: { id: string, name: string, icon: string, color: string }[] = [];
