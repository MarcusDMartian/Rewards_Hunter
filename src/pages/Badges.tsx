// ============================================
// BADGES PAGE - BADGE COLLECTION WITH RARITY
// ============================================

import { useState, useEffect } from 'react';
import { Award, Lock, ChevronDown } from 'lucide-react';
import { getBadges } from '../services/storageService';
import { Badge, BadgeRarity } from '../types';
import usePageTitle from '../hooks/usePageTitle';

const RARITY_ORDER: BadgeRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const RARITY_STYLES: Record<BadgeRarity, { pill: string; border: string; glow: string }> = {
    Common:    { pill: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',       border: 'border-slate-200 dark:border-slate-700',    glow: '' },
    Uncommon:  { pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',         border: 'border-blue-200 dark:border-blue-800',       glow: '' },
    Rare:      { pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800',   glow: 'shadow-purple-200 dark:shadow-purple-900' },
    Epic:      { pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800',   glow: 'shadow-orange-200 dark:shadow-orange-900' },
    Legendary: { pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',     border: 'border-amber-300 dark:border-amber-700',     glow: 'shadow-amber-200 dark:shadow-amber-800' },
};

export default function Badges() {
    usePageTitle('Badge Collection');
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRarities, setExpandedRarities] = useState<Set<BadgeRarity>>(
        new Set(RARITY_ORDER)
    );

    useEffect(() => {
        getBadges().then((data) => {
            setBadges(data);
            setLoading(false);
        });
    }, []);

    const toggleRarity = (rarity: BadgeRarity) => {
        setExpandedRarities((prev) => {
            const next = new Set(prev);
            if (next.has(rarity)) next.delete(rarity);
            else next.add(rarity);
            return next;
        });
    };

    const totalUnlocked = badges.filter((b) => b.unlocked).length;
    const total = badges.length;
    const progressPercent = total > 0 ? Math.round((totalUnlocked / total) * 100) : 0;

    // Group badges by rarity in defined order
    const grouped = RARITY_ORDER.map((rarity) => ({
        rarity,
        badges: badges.filter((b) => (b.rarity ?? 'Common') === rarity),
    })).filter((g) => g.badges.length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card overflow-hidden">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Badge Collection</h1>
                    </div>
                    <p className="text-violet-100 mb-4">
                        Collect badges by contributing ideas, recognizing peers, and maintaining consistency
                    </p>

                    {/* Overall Progress */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Total Unlocked</span>
                            <span className="font-semibold">{totalUnlocked} / {total}</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-700"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Rarity Legend */}
                <div className="px-6 py-3 bg-white/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                    {RARITY_ORDER.map((r) => (
                        <span key={r} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${RARITY_STYLES[r].pill}`}>
                            {r}
                        </span>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    ))}
                </div>
            ) : (
                grouped.map(({ rarity, badges: group }) => {
                    const style = RARITY_STYLES[rarity];
                    const unlockedCount = group.filter((b) => b.unlocked).length;
                    const isExpanded = expandedRarities.has(rarity);

                    return (
                        <div key={rarity} className="space-y-3">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleRarity(rarity)}
                                className="w-full flex items-center justify-between px-1"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${style.pill}`}>
                                        {rarity}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {unlockedCount}/{group.length} unlocked
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                />
                            </button>

                            {isExpanded && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {group.map((badge) => {
                                        const isUnlocked = !!badge.unlocked;
                                        const progressPct = badge.targetCount && badge.targetCount > 0
                                            ? Math.min(Math.round(((badge.progress ?? 0) / badge.targetCount) * 100), 100)
                                            : isUnlocked ? 100 : 0;

                                        return (
                                            <div
                                                key={badge.id}
                                                className={`glass-card p-5 relative border transition-all ${style.border} ${isUnlocked
                                                    ? `hover:scale-[1.02] hover:shadow-lg ${style.glow}`
                                                    : 'opacity-60 grayscale'
                                                    }`}
                                            >
                                                {/* Rarity pill */}
                                                <span className={`absolute top-3 right-3 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${style.pill}`}>
                                                    {rarity}
                                                </span>

                                                {/* Lock icon for locked badges */}
                                                {!isUnlocked && (
                                                    <Lock className="absolute top-3 left-3 w-3.5 h-3.5 text-slate-400" />
                                                )}

                                                {/* Badge Icon */}
                                                <div
                                                    className={`w-16 h-16 rounded-2xl ${badge.color} flex items-center justify-center text-3xl mb-4 ${isUnlocked ? 'shadow-lg' : ''}`}
                                                >
                                                    {badge.icon}
                                                </div>

                                                {/* Badge Info */}
                                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1 pr-8">
                                                    {badge.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                    {badge.description}
                                                </p>

                                                {/* Progress Bar */}
                                                {badge.targetCount && badge.targetCount > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                            <span>Progress</span>
                                                            <span>{badge.progress ?? 0}/{badge.targetCount}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isUnlocked
                                                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                                                    : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                                                                    }`}
                                                                style={{ width: `${progressPct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status */}
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${isUnlocked
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                >
                                                    {isUnlocked ? (
                                                        '✓ Unlocked'
                                                    ) : (
                                                        <>
                                                            <Lock className="w-3 h-3" />
                                                            Locked
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
