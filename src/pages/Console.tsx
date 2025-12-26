// ============================================
// CONSOLE - System Admin Dashboard
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
    ChevronRight,
    Loader2,
    Server,
    Database,
    Shield,
    Zap
} from 'lucide-react';
import { Organization, User } from '../types';
import * as authService from '../services/authService';

type Tab = 'organizations' | 'users' | 'analytics' | 'settings';

const Console: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('organizations');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
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

        setOrganizations(orgs);
        setAllUsers(users.filter(u => u.role !== 'SystemAdmin'));
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

    const getUserCountForOrg = (orgId: string) => {
        return allUsers.filter(u => u.orgId === orgId).length;
    };

    const tabs = [
        { id: 'organizations' as Tab, label: 'Organizations', icon: Building2 },
        { id: 'users' as Tab, label: 'All Users', icon: Users },
        { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
        { id: 'settings' as Tab, label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                        <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Console</h1>
                        <p className="text-slate-400 text-sm">Platform Administration</p>
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
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-400 text-sm">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-400" />
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
                    {/* Organizations Tab */}
                    {activeTab === 'organizations' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    All Organizations ({organizations.length})
                                </h2>
                            </div>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                {organizations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-slate-500 dark:text-slate-400">No organizations yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {organizations.map((org) => (
                                            <div
                                                key={org.id}
                                                className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                        <Building2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 dark:text-white">{org.name}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                                                <Globe className="w-3 h-3" />
                                                                {org.domain}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                                                <Users className="w-3 h-3" />
                                                                {getUserCountForOrg(org.id)} users
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                                                            Active
                                                        </span>
                                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                            Since {formatDate(org.createdAt)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                </div>
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

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                </div>

                                {/* Growth */}
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
                                            <span className="text-slate-600 dark:text-slate-400">Active Rate</span>
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Chart Placeholder */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                    Platform Activity
                                </h3>
                                <div className="h-48 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-slate-500 dark:text-slate-400">Chart visualization coming soon</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 dark:border-slate-700/50">
                            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">System Settings</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Advanced configuration options will be available in a future update.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Console;
