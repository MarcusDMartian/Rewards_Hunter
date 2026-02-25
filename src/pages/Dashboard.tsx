// ============================================
// DASHBOARD PAGE - HOME / MAIN VIEW
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Flame,
    Target,
    Zap,
    ChevronRight,
    Award,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getCurrentUser, getMissions, claimMission, getIdeas } from '../services/storageService';
import { processGameEvent } from '../services/gamificationService';
import usePageTitle from '../hooks/usePageTitle';
import { Mission, KaizenIdea } from '../types';

export default function Dashboard() {
    usePageTitle('Dashboard');
    const [user, setUser] = useState(getCurrentUser());
    const [missions, setMissions] = useState<Mission[]>(getMissions());
    const [recentIdeas, setRecentIdeas] = useState<KaizenIdea[]>([]);

    useEffect(() => {
        const ideas = getIdeas().slice(0, 3);
        setRecentIdeas(ideas);
        // Auto-trigger daily login for streak tracking
        processGameEvent('daily_login');
    }, []);

    const handleClaimMission = (missionId: string) => {
        const { missions: updatedMissions } = claimMission(missionId);
        setMissions(updatedMissions);
        setUser(getCurrentUser());
    };

    // XP progress data for pie chart
    const progressPercent = Math.min((user.points / user.nextLevelPoints) * 100, 100);
    const pieData = [
        { value: progressPercent },
        { value: 100 - progressPercent },
    ];

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'Speed':
                return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            case 'Quality':
                return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
            case 'Cost':
                return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
            case 'Safety':
                return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-slate-500 bg-slate-100 dark:bg-slate-900/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            {getTimeOfDay()}, <span className="gradient-text">{user.name.split(' ')[0]}</span>! 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            The war for improvement never ends. Ready to deploy?
                        </p>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                        <Flame className="w-5 h-5" />
                        <span className="font-bold">{user.streak}</span>
                        <span className="text-sm opacity-90">day streak</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Horizontal Scroll on Mobile */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {/* XP Card */}
                <div className="glass-card p-5 min-w-[280px] md:min-w-0 md:flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20">
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
                                    {user.points.toLocaleString()}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">XP</span>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Level {user.level} • {(user.nextLevelPoints - user.points).toLocaleString()} XP to next
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
                    <div className="flex items-center gap-2">
                        {user.badges.slice(0, 3).map((badge) => (
                            <div
                                key={badge.id}
                                className={`w-10 h-10 rounded-xl ${badge.color} flex items-center justify-center text-lg shadow-md`}
                                title={badge.name}
                            >
                                {badge.icon}
                            </div>
                        ))}
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
                                {recentIdeas.length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tactics</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                {user.badges.length}
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
                    {missions.map((mission) => (
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
                                            style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {mission.progress}/{mission.total}
                                    </span>
                                </div>
                            </div>

                            {mission.claimed ? (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium">
                                    ✓ Collected
                                </div>
                            ) : mission.completed ? (
                                <button
                                    onClick={() => handleClaimMission(mission.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium animate-pulse hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                >
                                    Claim +{mission.reward} XP
                                </button>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-sm">
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

                <div className="space-y-3">
                    {recentIdeas.map((idea) => (
                        <Link
                            key={idea.id}
                            to={`/ideas/${idea.id}`}
                            className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <img
                                src={idea.author.avatar}
                                alt={idea.author.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-slate-800 dark:text-white">
                                        {idea.author.name}
                                    </span>
                                    <span className="text-slate-400">submitted</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 truncate mt-0.5">
                                    {idea.title}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getImpactColor(idea.impact)}`}>
                                        {idea.impact}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(idea.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
