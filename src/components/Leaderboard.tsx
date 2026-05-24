// ============================================
// LEADERBOARD COMPONENT - PODIUM + RANKING LIST
// ============================================

import { Crown, TrendingUp, TrendingDown, Minus, Star, Lightbulb, Heart, Award } from 'lucide-react';
import { LeaderboardRow } from '../types';
import { getCurrentUser } from '../services/storageService';

interface LeaderboardProps {
    users: LeaderboardRow[];
    sortBy?: 'points' | 'weeklyPoints' | 'monthlyPoints' | 'quarterlyPoints';
    limit?: number;
    showTeamFilter?: boolean;
    selectedTeam?: string;
    onTeamChange?: (team: string) => void;
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'same' | 'new' }) {
    if (trend === 'up') return (
        <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3 h-3" /> up
        </span>
    );
    if (trend === 'down') return (
        <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
            <TrendingDown className="w-3 h-3" /> down
        </span>
    );
    if (trend === 'new') return (
        <span className="flex items-center gap-0.5 text-xs font-medium text-indigo-500">
            <Star className="w-3 h-3" /> new
        </span>
    );
    return <Minus className="w-3 h-3 text-slate-400" />;
}

const PODIUM_STYLES = [
    // 1st place
    {
        order: 'order-2',
        height: 'h-24',
        bg: 'from-amber-400 to-yellow-300',
        ringColor: 'ring-amber-400',
        crownColor: 'text-amber-500',
        rankBg: 'bg-amber-500',
        avatarSize: 'w-16 h-16',
    },
    // 2nd place
    {
        order: 'order-1',
        height: 'h-16',
        bg: 'from-slate-400 to-slate-300',
        ringColor: 'ring-slate-400',
        crownColor: 'text-slate-400',
        rankBg: 'bg-slate-400',
        avatarSize: 'w-14 h-14',
    },
    // 3rd place
    {
        order: 'order-3',
        height: 'h-10',
        bg: 'from-amber-700 to-amber-600',
        ringColor: 'ring-amber-700',
        crownColor: 'text-amber-700',
        rankBg: 'bg-amber-700',
        avatarSize: 'w-12 h-12',
    },
];

export default function Leaderboard({
    users,
    limit = 20,
    showTeamFilter = false,
    selectedTeam = 'all',
    onTeamChange,
}: LeaderboardProps) {
    const currentUser = getCurrentUser();

    // Get unique teams
    const teams = [...new Set(users.map((u) => u.team).filter(Boolean))];

    // Filter by team
    const filteredUsers =
        selectedTeam === 'all'
            ? users
            : users.filter((u) => u.team === selectedTeam);

    const displayUsers = filteredUsers.slice(0, limit);
    const podiumUsers = displayUsers.slice(0, 3);
    const listUsers = displayUsers.slice(3);

    // Re-order podium: 2nd, 1st, 3rd
    const podiumOrder = podiumUsers.length === 3
        ? [podiumUsers[1], podiumUsers[0], podiumUsers[2]]
        : podiumUsers;

    return (
        <div className="space-y-6">
            {/* Team Filter */}
            {showTeamFilter && teams.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button
                        onClick={() => onTeamChange?.('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTeam === 'all'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80'
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
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80'
                                }`}
                        >
                            {team}
                        </button>
                    ))}
                </div>
            )}

            {/* Podium — top 3 */}
            {podiumOrder.length > 0 && (
                <div className="flex items-end justify-center gap-4 pt-4 pb-2">
                    {podiumOrder.map((user, idx) => {
                        const originalRank = podiumOrder === podiumUsers
                            ? idx + 1
                            : [2, 1, 3][idx]; // after reorder: positions are 2nd,1st,3rd
                        const actualRank = user?.rank ?? originalRank;
                        const style = PODIUM_STYLES[actualRank - 1] ?? PODIUM_STYLES[2];
                        const isCurrentUser = user?.id === currentUser.id;

                        if (!user) return null;

                        return (
                            <div key={user.id} className={`flex flex-col items-center gap-2 ${style.order}`}>
                                {/* Crown for 1st */}
                                {actualRank === 1 && (
                                    <Crown className={`w-6 h-6 ${style.crownColor}`} />
                                )}

                                {/* Avatar */}
                                <div className="relative">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className={`${style.avatarSize} rounded-full ring-4 ${style.ringColor} object-cover`}
                                        />
                                    ) : (
                                        <div className={`${style.avatarSize} rounded-full ring-4 ${style.ringColor} bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg`}>
                                            {user.name?.[0] ?? '?'}
                                        </div>
                                    )}
                                    {isCurrentUser && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white" />
                                    )}
                                </div>

                                {/* Name & Points */}
                                <div className="text-center max-w-[80px]">
                                    <div className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {(user.periodPoints ?? user.points).toLocaleString()} pts
                                    </div>
                                    <div className="mt-1 flex justify-center">
                                        <TrendBadge trend={user.trend ?? 'same'} />
                                    </div>
                                </div>

                                {/* Podium Block */}
                                <div className={`w-20 ${style.height} rounded-t-xl bg-gradient-to-b ${style.bg} flex items-start justify-center pt-2`}>
                                    <span className="text-white font-bold text-lg">{actualRank}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rest of the leaderboard */}
            {listUsers.length > 0 && (
                <div className="space-y-2">
                    {listUsers.map((user) => {
                        const isCurrentUser = user.id === currentUser.id;

                        return (
                            <div
                                key={user.id}
                                className={`glass-card p-3 flex items-center gap-3 transition-all hover:scale-[1.01] ${isCurrentUser ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-8 text-center">
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        {user.rank}
                                    </span>
                                </div>

                                {/* Trend */}
                                <div className="w-8 flex justify-center">
                                    <TrendBadge trend={user.trend ?? 'same'} />
                                </div>

                                {/* Avatar */}
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                        {user.name?.[0] ?? '?'}
                                    </div>
                                )}

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
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                                            Lv.{user.level}
                                        </span>
                                        {user.team && <span>{user.team}</span>}
                                    </div>
                                </div>

                                {/* Stats — Desktop only */}
                                <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1" title="Ideas">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{user.ideasCount ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="Kudos">
                                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                                        <span>{user.kudosCount ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="Badges">
                                        <Award className="w-3.5 h-3.5 text-purple-500" />
                                        <span>{user.badgesCount ?? 0}</span>
                                    </div>
                                </div>

                                {/* Points */}
                                <div className="text-right shrink-0">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {(user.periodPoints ?? user.points).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        pts
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {displayUsers.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    No rankings available yet.
                </div>
            )}
        </div>
    );
}
