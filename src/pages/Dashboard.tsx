// ============================================
// DASHBOARD PAGE - HOME / MAIN VIEW
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Flame,
    Target,
    Zap,
    ChevronRight,
    Award,
    Sparkles,
    TrendingUp,
    Lightbulb,
    Heart,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getMissions, claimMission, getActivityFeed } from '../services/storageService';
import { processGameEvent } from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { Mission, ActivityItem, User } from '../types';

const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ReactNode> = {
    idea:     <Lightbulb className="w-4 h-4 text-amber-500" />,
    kudos:    <Heart className="w-4 h-4 text-rose-500" />,
    badge:    <Award className="w-4 h-4 text-purple-500" />,
    level_up: <Zap className="w-4 h-4 text-indigo-500" />,
};

const ACTIVITY_BG: Record<ActivityItem['type'], string> = {
    idea:     'bg-amber-100 dark:bg-amber-900/30',
    kudos:    'bg-rose-100 dark:bg-rose-900/30',
    badge:    'bg-purple-100 dark:bg-purple-900/30',
    level_up: 'bg-indigo-100 dark:bg-indigo-900/30',
};

export default function Dashboard() {
    usePageTitle('Dashboard');
    const { currentUser, refreshAuth } = useAuth();
    const user = (currentUser ?? ({} as User));
    const [missions, setMissions] = useState<Mission[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    const loadData = useCallback(async () => {
        const [fetchedMissions, fetchedActivities] = await Promise.all([
            getMissions(),
            getActivityFeed('org', 10),
        ]);
        setMissions(fetchedMissions);
        setActivities(fetchedActivities);
        setActivitiesLoading(false);

        // Daily login is the one event that does NOT have a natural mutation
        // trigger on the server, so the client still emits it explicitly.
        await processGameEvent('daily_login');
        await refreshAuth();
    }, [refreshAuth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleClaimMission = async (missionId: string) => {
        const { missions: updatedMissions } = await claimMission(missionId);
        setMissions(updatedMissions);
        await refreshAuth();
    };

    // XP progress data for pie chart
    const pieData = React.useMemo(() => {
        const progressPercent = Math.min((user.points / Math.max(user.nextLevelPoints, 1)) * 100, 100);
        return [
            { value: progressPercent },
            { value: 100 - progressPercent },
        ];
    }, [user.points, user.nextLevelPoints]);

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            {getTimeOfDay()}, <span className="gradient-text">{user.name?.split(' ')[0] ?? 'there'}</span>! 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            The war for improvement never ends. Ready to deploy?
                        </p>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white shrink-0">
                        <Flame className="w-5 h-5" />
                        <span className="font-bold">{user.streak ?? 0}</span>
                        <span className="text-sm opacity-90">day streak</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Horizontal Scroll on Mobile */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {/* XP Card */}
                <div className="glass-card p-5 min-w-[280px] md:min-w-0 md:flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={28}
                                        outerRadius={38}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="url(#gradient1)" />
                                        <Cell fill="#e2e8f0" className="dark:fill-slate-700" />
                                    </Pie>
                                    <defs>
                                        <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-500" />
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {(user.points ?? 0).toLocaleString()}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">XP</span>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Level {user.level ?? 1} • {((user.nextLevelPoints ?? 100) - (user.points ?? 0)).toLocaleString()} XP to next
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Preview Card */}
                <div className="glass-card p-5 min-w-[200px] md:min-w-0 md:flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-slate-800 dark:text-white">Badges</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(user.badges ?? []).slice(0, 3).map((badge) => (
                            <div
                                key={badge.id}
                                className={`w-10 h-10 rounded-xl ${badge.color} flex items-center justify-center text-lg shadow-md`}
                                title={badge.name}
                            >
                                {badge.icon}
                            </div>
                        ))}
                        {(user.badges ?? []).length === 0 && (
                            <span className="text-sm text-slate-400">No badges yet</span>
                        )}
                        <Link
                            to="/badges"
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* War Stats Card */}
                <div className="glass-card p-5 min-w-[200px] md:min-w-0 md:flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-rose-500" />
                        <span className="font-semibold text-slate-800 dark:text-white">War Stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                {activities.filter((a) => a.type === 'idea').length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tactics</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                {(user.badges ?? []).length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Honor</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Operations (Missions) */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Daily Operations
                        </h2>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {missions.filter((m) => m.claimed).length}/{missions.length} completed
                    </span>
                </div>

                <div className="space-y-3">
                    {missions.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                            No missions available today.
                        </div>
                    ) : missions.map((mission) => (
                        <div
                            key={mission.id}
                            className="flex items-center gap-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl"
                        >
                            <div className="flex-1">
                                <div className="font-medium text-slate-800 dark:text-white">
                                    {mission.title}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                            style={{ width: `${Math.min((mission.progress / Math.max(mission.total, 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                                        {mission.progress}/{mission.total}
                                    </span>
                                </div>
                            </div>

                            {mission.claimed ? (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium shrink-0">
                                    ✓ Collected
                                </div>
                            ) : mission.completed ? (
                                <button
                                    onClick={() => handleClaimMission(mission.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium animate-pulse hover:shadow-lg hover:shadow-indigo-500/30 transition-all shrink-0"
                                >
                                    Claim +{mission.reward} XP
                                </button>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-sm shrink-0">
                                    +{mission.reward} XP
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Field Activity Feed */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Field Activity
                        </h2>
                    </div>
                    <Link
                        to="/ideas"
                        className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {activitiesLoading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No recent activity yet. Be the first to submit an idea!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl"
                            >
                                {/* Icon */}
                                <div className={`w-9 h-9 rounded-xl ${ACTIVITY_BG[activity.type]} flex items-center justify-center shrink-0`}>
                                    {ACTIVITY_ICONS[activity.type]}
                                </div>

                                {/* User Avatar */}
                                {activity.user.avatar ? (
                                    <img
                                        src={activity.user.avatar}
                                        alt={activity.user.name}
                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {activity.user.name?.[0] ?? '?'}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-slate-800 dark:text-white">
                                        <span className="font-semibold">{activity.user.name}</span>
                                        {' '}
                                        <span className="text-slate-500 dark:text-slate-400">{activity.title}</span>
                                    </div>
                                    {activity.description && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                            {activity.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
