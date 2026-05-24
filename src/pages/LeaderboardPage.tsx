// ============================================
// LEADERBOARD PAGE - HALL OF FAME
// ============================================

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import LeaderboardComponent from '../components/Leaderboard';
import { getLeaderboard } from '../services/storageService';
import { LeaderboardRow } from '../types';
import usePageTitle from '../hooks/usePageTitle';

type Period = 'week' | 'month' | 'quarter' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    all: 'All Time',
};

export default function LeaderboardPage() {
    usePageTitle('Hall of Fame');
    const [period, setPeriod] = useState<Period>('week');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [users, setUsers] = useState<LeaderboardRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const data = await getLeaderboard(period, selectedTeam);
            setUsers(data as LeaderboardRow[]);
            setLoading(false);
        };
        loadLeaderboard();
    }, [period, selectedTeam]);

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
            <div className="flex gap-1 p-1 glass rounded-xl overflow-x-auto scrollbar-hide">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${period === p
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {PERIOD_LABELS[p]}
                    </button>
                ))}
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-6">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <LeaderboardComponent
                        users={users}
                        limit={20}
                        showTeamFilter
                        selectedTeam={selectedTeam}
                        onTeamChange={setSelectedTeam}
                    />
                )}
            </div>
        </div>
    );
}
