// ============================================
// SYSTEM CONSTANTS - App configuration & enums
// ============================================
// This file contains ONLY system-level constants.
// Mock/seed data is in src/data/mockData.ts

import { Badge, Team } from './types';

// ============================================
// BADGES
// ============================================
export const ALL_BADGES: Badge[] = [];

// ============================================
// TEAMS
// ============================================
export const TEAMS: Team[] = [];

// ============================================
// CORE VALUES
// ============================================
export const CORE_VALUES: { id: string, name: string, color: string, description: string }[] = [];

// ============================================
// FEEDBACK TEMPLATES
// ============================================
export const FEEDBACK_TEMPLATES: { id: string, name: string, type: 'start_stop_continue' | 'nps' | 'four_l' | 'open' }[] = [];

// ============================================
// IMPACT TYPES
// ============================================
export const IMPACT_TYPES: { id: string, name: string, icon: string, color: string }[] = [];
