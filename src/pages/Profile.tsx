// ============================================
// PROFILE PAGE - USER PROFILE & NAVIGATION
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Settings,
    Lightbulb,
    Heart,
    Trophy,
    Gift,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Zap,
    Flame,
} from 'lucide-react';
import { getCurrentUser, getMissions } from '../services/storageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { Mission } from '../types';

export default function Profile() {
    const user = getCurrentUser();
    const [missions, setMissions] = useState<Mission[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getMissions().then(data => setMissions(data));
    }, []);

    const activeMissions = missions.filter((m: Mission) => !m.claimed).slice(0, 3);
    const progressPercent = (user.points / user.nextLevelPoints) * 100;

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        navigate('/');
    };

    const menuItems = [
        { path: '/ideas', icon: Lightbulb, label: 'Tactics', sublabel: 'Kaizen Ideas', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
        { path: '/kudos', icon: Heart, label: 'Honor', sublabel: 'Recognition', color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
        { path: '/leaderboard', icon: Trophy, label: 'Rankings', sublabel: 'Leaderboard', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
        { path: '/rewards', icon: Gift, label: 'Loot', sublabel: 'Rewards Shop', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
        { path: '/feedback', icon: ShieldCheck, label: 'Intel Report', sublabel: 'Anonymous Feedback', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    ];

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="glass-card overflow-hidden">
                {/* Cover */}
                <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />

                {/* User Info */}
                <div className="px-6 pb-6 -mt-12">
                    <div className="flex items-end justify-between mb-4">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-slate-800 shadow-lg"
                        />
                        <Link
                            to="/settings"
                            className="p-2 glass rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors"
                        >
                            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {user.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {user.position} • {user.team}
                    </p>

                    {/* Level Badge */}
                    <div className="inline-flex items-center gap-1 px-3 py-1 mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full">
                        <Zap className="w-4 h-4" />
                        Level {user.level}
                    </div>
                </div>
            </div>

            {/* Level Progress */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                        Next Milestone
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Level {user.level + 1}
                    </span>
                </div>

                <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {user.points.toLocaleString()}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500 dark:text-slate-400">
                        {user.nextLevelPoints.toLocaleString()} XP
                    </span>
                </div>

                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {(user.nextLevelPoints - user.points).toLocaleString()} XP needed to level up
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 text-center">
                    <Zap className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {user.points.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total XP</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {user.streak}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Day Streak</div>
                </div>
            </div>

            {/* Active Missions */}
            {activeMissions.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Active Missions
                        </h3>
                        <Link to="/" className="text-sm text-indigo-500 hover:text-indigo-600">
                            View Dashboard
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {activeMissions.map((mission) => (
                            <div key={mission.id} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-800 dark:text-white">
                                        {mission.title}
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {mission.progress}/{mission.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badge Collection Preview */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                        Badge Collection
                    </h3>
                    <Link
                        to="/badges"
                        className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                        See All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {user.badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`w-14 h-14 rounded-xl ${badge.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}
                            title={badge.name}
                        >
                            {badge.icon}
                        </div>
                    ))}
                    {user.badges.length === 0 && (
                        <div className="text-slate-400 text-sm">
                            No badges earned yet
                        </div>
                    )}
                </div>
            </div>

            {/* Dossier Access (Navigation Menu) */}
            <div className="glass-card p-4">
                <h3 className="font-semibold text-slate-800 dark:text-white px-2 mb-2">
                    Dossier Access
                </h3>

                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-slate-800 dark:text-white">
                                    {item.label}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {item.sublabel}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 glass-card text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-2xl font-medium"
            >
                <LogOut className="w-5 h-5" />
                Abort Mission (Sign Out)
            </button>
        </div>
    );
}
