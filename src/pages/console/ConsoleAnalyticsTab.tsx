import { TrendingUp, Activity } from 'lucide-react';
import { ConsoleTabProps } from './consoleTypes';

export default function ConsoleAnalyticsTab({ organizations, allUsers, allIdeas, redemptions, stats }: ConsoleTabProps) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newOrgs30d = organizations.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).length;
    const newIdeas30d = allIdeas.filter(i => new Date(i.createdAt) >= thirtyDaysAgo).length;
    const approvedIdeas = allIdeas.filter(i => i.status === 'Approved' || i.status === 'Implemented').length;
    const totalKudos = allUsers.reduce((sum, u) => sum + (u.points || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Growth Metrics (Last 30 Days)</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">New Orgs</span><span className="text-emerald-500 font-medium">+{newOrgs30d}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">New Users</span><span className="text-emerald-500 font-medium">+{allUsers.length}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">New Ideas</span><span className="text-emerald-500 font-medium">+{newIdeas30d}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Active Rate</span><span className="text-slate-800 dark:text-white font-medium">{stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%</span></div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Engagement</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Idea Approval Rate</span><span className="text-slate-800 dark:text-white font-medium">{allIdeas.length > 0 ? Math.round((approvedIdeas / allIdeas.length) * 100) : 0}%</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Avg Points/User</span><span className="text-slate-800 dark:text-white font-medium">{allUsers.length > 0 ? Math.round(totalKudos / allUsers.length) : 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Redemption Rate</span><span className="text-slate-800 dark:text-white font-medium">{allUsers.length > 0 ? Math.round((redemptions.length / allUsers.length) * 100) : 0}%</span></div>
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Platform Activity Trend (Last 7 Days)</h3>
                <div className="h-48 flex items-end justify-around gap-2 px-4">
                    {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
                        const dayStr = d.toISOString().split('T')[0];
                        const ideasCount = allIdeas.filter(id => id.createdAt.startsWith(dayStr)).length;
                        const maxH = 140;
                        const barH = Math.max(8, (ideasCount / Math.max(1, allIdeas.length)) * maxH + 8);
                        return (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-xs text-slate-500 font-medium">{ideasCount}</span>
                                <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all" style={{ height: `${barH}px` }} />
                                <span className="text-xs text-slate-400">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
