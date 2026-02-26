// ============================================
// LEADERBOARD PAGE - RANKINGS
// ============================================

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import LeaderboardComponent from '../components/Leaderboard';

type Period = 'month' | 'quarter' | 'all';

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>('month');
    const [selectedTeam, setSelectedTeam] = useState('all');

    const getSortBy = () => {
        switch (period) {
            case 'month':
                return 'monthlyPoints' as const;
            case 'quarter':
                return 'quarterlyPoints' as const;
            default:
                return 'points' as const;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Hall of Fame</h1>
                    </div>
                    <p className="text-indigo-100">
                        Recognizing our top contributors and continuous improvers
                    </p>
                </div>
            </div>

            {/* Period Toggle */}
            <div className="flex gap-2 p-1 glass rounded-xl">
                <button
                    onClick={() => setPeriod('month')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${period === 'month'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    This Month
                </button>
                <button
                    onClick={() => setPeriod('quarter')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${period === 'quarter'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    This Quarter
                </button>
                <button
                    onClick={() => setPeriod('all')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${period === 'all'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    All Time
                </button>
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-6">
                <LeaderboardComponent
                    users={MOCK_USERS}
                    sortBy={getSortBy()}
                    limit={20}
                    showTeamFilter
                    selectedTeam={selectedTeam}
                    onTeamChange={setSelectedTeam}
                />
            </div>
        </div>
    );
}
