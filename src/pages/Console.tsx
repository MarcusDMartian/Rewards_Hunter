// ============================================
// CONSOLE - System Admin Dashboard (Refactored)
// ============================================

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Lightbulb,
    Gift,
    TrendingUp,
    Settings,
    Server,
    Building2,
    Clock,
    Loader2,
} from 'lucide-react';
import { Organization, User, KaizenIdea, RedemptionRequest, Reward } from '../types';
import * as authService from '../services/authService';
import { getIdeas, updateIdea, getRedemptions } from '../services/storageService';


// Sub-components
import ConsoleDashboardTab from './console/ConsoleDashboardTab';
import ConsoleUsersTab from './console/ConsoleUsersTab';
import ConsoleIdeasTab from './console/ConsoleIdeasTab';
import ConsoleRewardsTab from './console/ConsoleRewardsTab';
import ConsoleAnalyticsTab from './console/ConsoleAnalyticsTab';
import ConsoleSystemTab from './console/ConsoleSystemTab';

type Tab = 'dashboard' | 'users' | 'ideas' | 'rewards' | 'analytics' | 'system';

const Console: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allIdeas, setAllIdeas] = useState<KaizenIdea[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
        'Kaizen Ideas': true, 'Kudos': true, 'Rewards': true, 'Leaderboard': true,
        'Feedback': true, 'Missions': false, 'AI Assistant': false, 'Badges': true,
    });
    const [stats, setStats] = useState({ totalOrganizations: 0, totalUsers: 0, activeUsers: 0, pendingRequests: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [orgs, users, statsData] = await Promise.all([
                authService.getAllOrganizations(),
                authService.getAllUsers(),
                authService.getPlatformStats(),
            ]);
            setOrganizations(orgs.filter(o => o.id !== 'platform'));
            setAllUsers(users.filter(u => u.role !== 'SystemAdmin'));
            setAllIdeas(await getIdeas());
            setRedemptions(await getRedemptions());
            // setRewards(JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARDS) || '[]'));
            setRewards([]); // Should fetch from API
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load console data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load feature toggles from API
    useEffect(() => {
        const loadToggles = async () => {
            try {
                // TODO: Replace with actual API call to settings/flags when available
                // const { data } = await api.get('/settings/flags');
                // if (data) setFeatureToggles(data);
            } catch (err) {
                console.error('Failed to load feature toggles:', err);
            }
        };
        loadToggles();
    }, []);

    const handleIdeaAction = async (ideaId: string, status: 'Approved' | 'Rejected') => {
        await updateIdea(ideaId, { status });
        setAllIdeas(await getIdeas());
    };

    const handleRedemptionAction = (redId: string, status: 'Approved' | 'Rejected') => {
        const updated = redemptions.map(r => r.id === redId ? { ...r, status: status as RedemptionRequest['status'], processedAt: new Date().toISOString() } : r);
        setRedemptions(updated);
        // TODO: API call to process redemption on backend
    };

    const toggleFeature = async (name: string) => {
        const updated = { ...featureToggles, [name]: !featureToggles[name] };
        setFeatureToggles(updated);
        try {
            // TODO: API call to save settings/flags
            // await api.post('/settings/flags', updated);
        } catch (err) {
            console.error('Failed to save toggle state:', err);
            // Revert state if necessary...
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const tabs = [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
        { id: 'users' as Tab, label: 'Users & Teams', icon: Users },
        { id: 'ideas' as Tab, label: 'Kaizen Ideas', icon: Lightbulb },
        { id: 'rewards' as Tab, label: 'Rewards', icon: Gift },
        { id: 'analytics' as Tab, label: 'Analytics', icon: TrendingUp },
        { id: 'system' as Tab, label: 'System', icon: Settings },
    ];

    const tabProps = { organizations, allUsers, allIdeas, redemptions, rewards, stats, featureToggles, handleIdeaAction, handleRedemptionAction, toggleFeature, formatDate };

    const tabComponents: Record<Tab, React.ReactNode> = {
        dashboard: <ConsoleDashboardTab {...tabProps} />,
        users: <ConsoleUsersTab {...tabProps} />,
        ideas: <ConsoleIdeasTab {...tabProps} />,
        rewards: <ConsoleRewardsTab {...tabProps} />,
        analytics: <ConsoleAnalyticsTab {...tabProps} />,
        system: <ConsoleSystemTab {...tabProps} />,
    };

    return (
        <div className="min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                        <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Console</h1>
                        <p className="text-slate-400 text-sm">KaizenHub Platform Administration</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                        { icon: Building2, label: 'Organizations', value: stats.totalOrganizations, color: 'text-indigo-400' },
                        { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-emerald-400' },
                        { icon: Lightbulb, label: 'Ideas', value: allIdeas.length, color: 'text-amber-400' },
                        { icon: Clock, label: 'Pending', value: stats.pendingRequests, color: 'text-rose-400' },
                    ].map((s) => (
                        <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                                <span className="text-slate-400 text-sm">{s.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${isActive
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-white/10 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
            ) : (
                tabComponents[activeTab]
            )}
        </div>
    );
};

export default Console;
