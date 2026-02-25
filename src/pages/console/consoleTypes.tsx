// Console shared types & helper components
import { Lightbulb } from 'lucide-react';
import { Organization, User, KaizenIdea, RedemptionRequest, Reward } from '../../types';

export interface ConsoleTabProps {
    organizations: Organization[];
    allUsers: User[];
    allIdeas: KaizenIdea[];
    redemptions: RedemptionRequest[];
    rewards: Reward[];
    stats: { totalOrganizations: number; totalUsers: number; activeUsers: number; pendingRequests: number };
    featureToggles: Record<string, boolean>;
    handleIdeaAction: (ideaId: string, status: 'Approved' | 'Rejected') => void;
    handleRedemptionAction: (redId: string, status: 'Approved' | 'Rejected') => void;
    toggleFeature: (name: string) => void;
    formatDate: (dateString: string) => string;
}

export function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Lightbulb; label: string; value: string | number; color: string }) {
    const colorClasses: Record<string, string> = {
        amber: 'from-amber-500 to-orange-600',
        emerald: 'from-emerald-500 to-green-600',
        blue: 'from-blue-500 to-indigo-600',
        purple: 'from-purple-500 to-pink-600',
        rose: 'from-rose-500 to-red-600',
        orange: 'from-orange-500 to-amber-600',
    };
    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-slate-700/50">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        'New': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        'In Review': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        'Approved': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        'Implemented': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        'Rejected': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };
    return <span className={`px-2 py-0.5 text-xs rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function FeatureToggle({ name, enabled, onToggle }: { name: string; enabled: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer" onClick={onToggle}>
            <span className="text-sm text-slate-700 dark:text-slate-300">{name}</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
}
