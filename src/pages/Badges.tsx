// ============================================
// BADGES PAGE - BADGE COLLECTION
// ============================================

import { Award, Lock } from 'lucide-react';
import { getCurrentUser } from '../services/storageService';
import { ALL_BADGES } from '../constants';

export default function Badges() {
    const user = getCurrentUser();
    const userBadgeIds = user.badges.map((b) => b.id);

    const totalUnlocked = userBadgeIds.length;
    const progressPercent = (totalUnlocked / ALL_BADGES.length) * 100;

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

                    {/* Progress Bar */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Total Unlocked</span>
                            <span className="font-semibold">{totalUnlocked} / {ALL_BADGES.length}</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ALL_BADGES.map((badge) => {
                    const isUnlocked = userBadgeIds.includes(badge.id);

                    return (
                        <div
                            key={badge.id}
                            className={`glass-card p-5 relative transition-all ${isUnlocked
                                    ? 'hover:scale-[1.02]'
                                    : 'opacity-70 grayscale'
                                }`}
                        >
                            {/* Lock Icon for Locked Badges */}
                            {!isUnlocked && (
                                <div className="absolute top-3 right-3">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                            )}

                            {/* Badge Icon */}
                            <div
                                className={`w-16 h-16 rounded-2xl ${badge.color} flex items-center justify-center text-3xl mb-4 shadow-lg ${isUnlocked ? 'shadow-lg' : ''
                                    }`}
                            >
                                {badge.icon}
                            </div>

                            {/* Badge Info */}
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                                {badge.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                {badge.description}
                            </p>

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
        </div>
    );
}
