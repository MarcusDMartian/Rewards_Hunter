// ============================================
// CORE VALUES — canonical definition
// 6 values confirmed by product owner 2026-05-24
// ============================================

export interface CoreValueDef {
  key: string;
  label: string;
  color: string;
  icon: string;
  order: number;
}

export const CORE_VALUE_KEYS = [
  'ownership',
  'customerFirst',
  'kaizen',
  'teamUp',
  'integrity',
  'biasForSpeed',
] as const;

export type CoreValueKey = (typeof CORE_VALUE_KEYS)[number];

export const DEFAULT_CORE_VALUES: CoreValueDef[] = [
  { key: 'ownership',    label: 'Ownership',      color: '#F97316', icon: '🎯', order: 0 },
  { key: 'customerFirst',label: 'Customer-first', color: '#0070CE', icon: '🌟', order: 1 },
  { key: 'kaizen',       label: 'Kaizen',         color: '#0070CE', icon: '♻️',  order: 2 },
  { key: 'teamUp',       label: 'Team-up',        color: '#8B5CF6', icon: '🤝', order: 3 },
  { key: 'integrity',    label: 'Integrity',      color: '#0D9488', icon: '🛡️', order: 4 },
  { key: 'biasForSpeed', label: 'Bias for speed', color: '#10B981', icon: '⚡', order: 5 },
];
