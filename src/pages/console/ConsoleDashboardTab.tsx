import { Building2, Lightbulb, CheckCircle, Eye, Clock, Award, Gift, Zap, Database } from 'lucide-react';
import { ConsoleTabProps, MetricCard, StatusBadge } from './consoleTypes';

export default function ConsoleDashboardTab({ organizations, allIdeas, allUsers, redemptions }: ConsoleTabProps) {
    const dashboardMetrics = {
        totalIdeas: allIdeas.length,
        approvedIdeas: allIdeas.filter(i => i.status === 'Approved' || i.status === 'Implemented').length,
        pendingIdeas: allIdeas.filter(i => i.status === 'New' || i.status === 'In Review').length,
        totalKudos: allUsers.reduce((sum, u) => sum + (u.points || 0), 0),
        totalRedemptions: redemptions.length,
        pendingRedemptions: redemptions.filter(r => r.status === 'Pending').length,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard icon={Lightbulb} label="Total Ideas" value={dashboardMetrics.totalIdeas} color="amber" />
                <MetricCard icon={CheckCircle} label="Approved" value={dashboardMetrics.approvedIdeas} color="emerald" />
                <MetricCard icon={Eye} label="Pending Review" value={dashboardMetrics.pendingIdeas} color="blue" />
                <MetricCard icon={Award} label="Total Points" value={dashboardMetrics.totalKudos.toLocaleString()} color="purple" />
                <MetricCard icon={Gift} label="Redemptions" value={dashboardMetrics.totalRedemptions} color="rose" />
                <MetricCard icon={Clock} label="Pending Redeem" value={dashboardMetrics.pendingRedemptions} color="orange" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> Platform Health
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">API Status</span><span className="flex items-center gap-2 text-emerald-500"><CheckCircle className="w-4 h-4" />Operational</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Database</span><span className="flex items-center gap-2 text-emerald-500"><Database className="w-4 h-4" />Healthy</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Uptime</span><span className="text-slate-800 dark:text-white font-medium">99.9%</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Response Time</span><span className="text-slate-800 dark:text-white font-medium">45ms</span></div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-500" /> Organizations ({organizations.length})
                    </h3>
                    <div className="space-y-3">
                        {organizations.slice(0, 4).map(org => (
                            <div key={org.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
                                    <div><p className="font-medium text-slate-800 dark:text-white text-sm">{org.name}</p><p className="text-xs text-slate-500">{org.domain}</p></div>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs">Active</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Recent Ideas
                </h3>
                {allIdeas.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No ideas submitted yet</p>
                ) : (
                    <div className="space-y-3">
                        {allIdeas.slice(0, 5).map(idea => (
                            <div key={idea.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex-1"><p className="font-medium text-slate-800 dark:text-white text-sm truncate">{idea.title}</p><p className="text-xs text-slate-500">{idea.author.name} • {idea.author.team}</p></div>
                                <StatusBadge status={idea.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
