// ============================================
// CONSOLE - System Admin Dashboard (Enhanced)
// ============================================

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    BarChart3,
    Settings,
    Globe,
    TrendingUp,
    Activity,
    CheckCircle,
    Clock,
    Loader2,
    Server,
    Database,
    Shield,
    Zap,
    Lightbulb,
    Gift,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Award,
    XCircle
} from 'lucide-react';
import { Organization, User, KaizenIdea } from '../types';
import * as authService from '../services/authService';
import { getIdeas } from '../services/storageService';

type Tab = 'dashboard' | 'users' | 'ideas' | 'rewards' | 'analytics' | 'system';

// Mock data for rewards catalog
const MOCK_REWARDS = [
    { id: 'r1', name: 'Amazon Voucher $50', points: 500, stock: 25, category: 'voucher' },
    { id: 'r2', name: 'Extra Day Off', points: 1000, stock: 10, category: 'benefit' },
    { id: 'r3', name: 'Coffee Voucher', points: 100, stock: 50, category: 'voucher' },
    { id: 'r4', name: 'Lunch with CEO', points: 2000, stock: 3, category: 'experience' },
    { id: 'r5', name: 'Company Merchandise', points: 200, stock: 100, category: 'merchandise' },
];

const MOCK_REDEMPTIONS = [
    { id: 'red1', userId: 'u1', userName: 'Nguyen Van A', rewardId: 'r1', rewardName: 'Amazon Voucher $50', points: 500, status: 'pending', createdAt: '2024-12-25T10:00:00Z' },
    { id: 'red2', userId: 'u2', userName: 'Tran Thi B', rewardId: 'r3', rewardName: 'Coffee Voucher', points: 100, status: 'pending', createdAt: '2024-12-24T15:30:00Z' },
];

const Console: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allIdeas, setAllIdeas] = useState<KaizenIdea[]>([]);
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        totalUsers: 0,
        activeUsers: 0,
        pendingRequests: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setIsLoading(true);
        const orgs = authService.getAllOrganizations();
        const users = authService.getAllUsers();
        const platformStats = authService.getPlatformStats();
        const ideas = getIdeas();

        setOrganizations(orgs.filter(o => o.id !== 'platform'));
        setAllUsers(users.filter(u => u.role !== 'SystemAdmin'));
        setAllIdeas(ideas);
        setStats(platformStats);
        setIsLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const tabs = [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
        { id: 'users' as Tab, label: 'Users & Teams', icon: Users },
        { id: 'ideas' as Tab, label: 'Kaizen Ideas', icon: Lightbulb },
        { id: 'rewards' as Tab, label: 'Rewards', icon: Gift },
        { id: 'analytics' as Tab, label: 'Analytics', icon: TrendingUp },
        { id: 'system' as Tab, label: 'System', icon: Settings },
    ];

    // Calculate dashboard metrics
    const dashboardMetrics = {
        totalIdeas: allIdeas.length,
        approvedIdeas: allIdeas.filter(i => i.status === 'Approved' || i.status === 'Implemented').length,
        pendingIdeas: allIdeas.filter(i => i.status === 'New' || i.status === 'In Review').length,
        totalKudos: allUsers.reduce((sum, u) => sum + (u.points || 0), 0),
        totalRedemptions: MOCK_REDEMPTIONS.length,
        pendingRedemptions: MOCK_REDEMPTIONS.filter(r => r.status === 'pending').length,
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

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-400 text-sm">Organizations</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-400 text-sm">Total Users</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-slate-400 text-sm">Ideas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dashboardMetrics.totalIdeas}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-rose-400" />
                            <span className="text-slate-400 text-sm">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
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
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <MetricCard icon={Lightbulb} label="Total Ideas" value={dashboardMetrics.totalIdeas} color="amber" />
                                <MetricCard icon={CheckCircle} label="Approved" value={dashboardMetrics.approvedIdeas} color="emerald" />
                                <MetricCard icon={Eye} label="Pending Review" value={dashboardMetrics.pendingIdeas} color="blue" />
                                <MetricCard icon={Award} label="Total Points" value={dashboardMetrics.totalKudos.toLocaleString()} color="purple" />
                                <MetricCard icon={Gift} label="Redemptions" value={dashboardMetrics.totalRedemptions} color="rose" />
                                <MetricCard icon={Clock} label="Pending Redeem" value={dashboardMetrics.pendingRedemptions} color="orange" />
                            </div>

                            {/* Platform Health & Recent Activity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Platform Health */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        Platform Health
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">API Status</span>
                                            <span className="flex items-center gap-2 text-emerald-500">
                                                <CheckCircle className="w-4 h-4" />
                                                Operational
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Database</span>
                                            <span className="flex items-center gap-2 text-emerald-500">
                                                <Database className="w-4 h-4" />
                                                Healthy
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Uptime</span>
                                            <span className="text-slate-800 dark:text-white font-medium">99.9%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Response Time</span>
                                            <span className="text-slate-800 dark:text-white font-medium">45ms</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Organizations Overview */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-indigo-500" />
                                        Organizations ({organizations.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {organizations.slice(0, 4).map(org => (
                                            <div key={org.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white text-sm">{org.name}</p>
                                                        <p className="text-xs text-slate-500">{org.domain}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs">
                                                    Active
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Ideas */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                    Recent Ideas
                                </h3>
                                {allIdeas.length === 0 ? (
                                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No ideas submitted yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {allIdeas.slice(0, 5).map(idea => (
                                            <div key={idea.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{idea.title}</p>
                                                    <p className="text-xs text-slate-500">{idea.author.name} • {idea.author.team}</p>
                                                </div>
                                                <StatusBadge status={idea.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    All Platform Users ({allUsers.length})
                                </h2>
                            </div>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                {allUsers.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-slate-500 dark:text-slate-400">No users yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {allUsers.map((user) => {
                                            const org = organizations.find(o => o.id === user.orgId);
                                            const roleClass = user.role === 'Superadmin'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                : user.role === 'Admin'
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : user.role === 'Leader'
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
                                            return (
                                                <div
                                                    key={user.id}
                                                    className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-slate-800 dark:text-white">{user.name}</h3>
                                                                <span className={`px-2 py-0.5 text-xs rounded-full ${roleClass}`}>
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                                <span>{user.email}</span>
                                                                {org && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 className="w-3 h-3" />
                                                                        {org.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.points} pts</p>
                                                            <p className="text-xs text-slate-500">Level {user.level}</p>
                                                        </div>
                                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ideas Tab */}
                    {activeTab === 'ideas' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Kaizen Ideas Pipeline ({allIdeas.length})
                                </h2>
                            </div>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                {allIdeas.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-slate-500 dark:text-slate-400">No ideas submitted yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {allIdeas.map((idea) => (
                                            <div
                                                key={idea.id}
                                                className="p-4 hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium text-slate-800 dark:text-white">{idea.title}</h3>
                                                            <StatusBadge status={idea.status} />
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{idea.problem}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <img src={idea.author.avatar} alt="" className="w-4 h-4 rounded-full" />
                                                                {idea.author.name}
                                                            </span>
                                                            <span>{idea.author.team}</span>
                                                            <span>{formatDate(idea.createdAt)}</span>
                                                            <span className="flex items-center gap-1">
                                                                <ThumbsUp className="w-3 h-3" />
                                                                {idea.votes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Approve">
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Reject">
                                                            <ThumbsDown className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors" title="View">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rewards Tab */}
                    {activeTab === 'rewards' && (
                        <div className="space-y-6">
                            {/* Pending Redemptions */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    Pending Redemptions ({MOCK_REDEMPTIONS.filter(r => r.status === 'pending').length})
                                </h2>
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                    {MOCK_REDEMPTIONS.filter(r => r.status === 'pending').length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Gift className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                            <p className="text-slate-500 dark:text-slate-400">No pending redemptions</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {MOCK_REDEMPTIONS.filter(r => r.status === 'pending').map(redemption => (
                                                <div key={redemption.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{redemption.userName}</p>
                                                        <p className="text-sm text-slate-500">{redemption.rewardName} • {redemption.points} pts</p>
                                                        <p className="text-xs text-slate-400">{formatDate(redemption.createdAt)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reward Catalog */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-purple-500" />
                                    Reward Catalog ({MOCK_REWARDS.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {MOCK_REWARDS.map(reward => (
                                        <div key={reward.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                    <Gift className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400 capitalize">
                                                    {reward.category}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">{reward.name}</h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-amber-500 font-bold">{reward.points} pts</span>
                                                <span className="text-sm text-slate-500">Stock: {reward.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Growth Metrics */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        Growth Metrics
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">New Orgs (30d)</span>
                                            <span className="text-emerald-500 font-medium">+{organizations.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">New Users (30d)</span>
                                            <span className="text-emerald-500 font-medium">+{allUsers.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">New Ideas (30d)</span>
                                            <span className="text-emerald-500 font-medium">+{allIdeas.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Active Rate</span>
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Engagement */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        Engagement
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Idea Approval Rate</span>
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {allIdeas.length > 0 ? Math.round((dashboardMetrics.approvedIdeas / allIdeas.length) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Avg Points/User</span>
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {allUsers.length > 0 ? Math.round(dashboardMetrics.totalKudos / allUsers.length) : 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Redemption Rate</span>
                                            <span className="text-slate-800 dark:text-white font-medium">12%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Chart Placeholder */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                    Platform Activity Trend
                                </h3>
                                <div className="h-48 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-slate-500 dark:text-slate-400">📊 Chart visualization coming soon</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Security */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-indigo-500" />
                                        Security Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">2FA Enabled</span>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs">On</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Session Timeout</span>
                                            <span className="text-slate-800 dark:text-white">30 minutes</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Password Policy</span>
                                            <span className="text-slate-800 dark:text-white">Strong</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Integrations */}
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        Integrations
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="text-slate-700 dark:text-slate-300">SSO (Google)</span>
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full text-xs">Pending</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="text-slate-700 dark:text-slate-300">Slack</span>
                                            <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-xs">Not Connected</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="text-slate-700 dark:text-slate-300">Email (SMTP)</span>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs">Connected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-500" />
                                    Feature Toggles
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FeatureToggle name="Kaizen Ideas" enabled={true} />
                                    <FeatureToggle name="Kudos" enabled={true} />
                                    <FeatureToggle name="Rewards" enabled={true} />
                                    <FeatureToggle name="Leaderboard" enabled={true} />
                                    <FeatureToggle name="Feedback" enabled={true} />
                                    <FeatureToggle name="Missions" enabled={false} />
                                    <FeatureToggle name="AI Assistant" enabled={false} />
                                    <FeatureToggle name="Badges" enabled={true} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Helper Components
function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Lightbulb; label: string; value: string | number; color: string }) {
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

function StatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        'New': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        'In Review': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        'Approved': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        'Implemented': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        'Rejected': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
}

function FeatureToggle({ name, enabled }: { name: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <span className="text-sm text-slate-700 dark:text-slate-300">{name}</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
}

export default Console;
