// ============================================
// LEADERBOARD COMPONENT - REUSABLE RANKING LIST
// ============================================

import { Crown, Medal, Trophy } from 'lucide-react';
import { User } from '../types';
import { getCurrentUser } from '../services/storageService';

interface LeaderboardProps {
    users: User[];
    sortBy: 'points' | 'monthlyPoints' | 'quarterlyPoints';
    limit?: number;
    showTeamFilter?: boolean;
    selectedTeam?: string;
    onTeamChange?: (team: string) => void;
}

export default function Leaderboard({
    users,
    sortBy,
    limit = 10,
    showTeamFilter = false,
    selectedTeam = 'all',
    onTeamChange,
}: LeaderboardProps) {
    const currentUser = getCurrentUser();

    // Get unique teams
    const teams = [...new Set(users.map((u) => u.team))];

    // Filter by team
    const filteredUsers =
        selectedTeam === 'all'
            ? users
            : users.filter((u) => u.team === selectedTeam);

    // Sort users
    const sortedUsers = [...filteredUsers]
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, limit);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-5 h-5 text-amber-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-slate-400" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-700" />;
            default:
                return (
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-400">
                        {rank}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Team Filter */}
            {showTeamFilter && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button
                        onClick={() => onTeamChange?.('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTeam === 'all'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
                            }`}
                    >
                        All Teams
                    </button>
                    {teams.map((team) => (
                        <button
                            key={team}
                            onClick={() => onTeamChange?.(team)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTeam === team
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
                                }`}
                        >
                            {team}
                        </button>
                    ))}
                </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2">
                {sortedUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === currentUser.id;

                    return (
                        <div
                            key={user.id}
                            className={`glass-card p-3 flex items-center gap-3 transition-all hover:scale-[1.01] ${isCurrentUser ? 'ring-2 ring-indigo-500' : ''
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>

                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                {rank === 1 && (
                                    <Trophy className="absolute -top-1 -right-1 w-4 h-4 text-amber-500" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-800 dark:text-white truncate">
                                        {user.name}
                                    </span>
                                    {isCurrentUser && (
                                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">
                                            YOU
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span>{user.team}</span>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                                        Lv.{user.level}
                                    </span>
                                </div>
                            </div>

                            {/* Badges (Desktop only) */}
                            <div className="hidden md:flex items-center gap-1">
                                {user.badges.slice(0, 3).map((badge) => (
                                    <div
                                        key={badge.id}
                                        className={`w-6 h-6 rounded-full ${badge.color} flex items-center justify-center text-xs`}
                                        title={badge.name}
                                    >
                                        {badge.icon}
                                    </div>
                                ))}
                            </div>

                            {/* Points */}
                            <div className="text-right">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {user[sortBy].toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                                    pts
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
