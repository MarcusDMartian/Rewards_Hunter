// ============================================
// MANAGEMENT DASHBOARD - Owner/Superadmin Panel
// ============================================

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Target,
    Gift,
    Award,
    Settings,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Mail,
    Calendar,
    ChevronRight,
    Loader2,
    Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JoinRequest, User } from '../types';
import * as authService from '../services/authService';

type Tab = 'requests' | 'members' | 'missions' | 'rewards' | 'badges' | 'settings';

const Management: React.FC = () => {
    const { organization, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('requests');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [organization]);

    const loadData = () => {
        setIsLoading(true);
        if (organization) {
            const requests = authService.getOrgJoinRequests(organization.id);
            const users = authService.getUsersByOrg(organization.id);
            setJoinRequests(requests);
            setMembers(users.filter(u => u.id !== currentUser?.id));
        }
        setIsLoading(false);
    };

    const handleApprove = async (requestId: string) => {
        setActionLoading(requestId);
        const result = authService.approveJoinRequest(requestId);
        if (result.success) {
            loadData();
        }
        setActionLoading(null);
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(requestId);
        const result = authService.rejectJoinRequest(requestId);
        if (result.success) {
            loadData();
        }
        setActionLoading(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const tabs = [
        { id: 'requests' as Tab, label: 'Member Requests', icon: UserPlus, count: joinRequests.filter(r => r.status === 'PENDING').length },
        { id: 'members' as Tab, label: 'Members', icon: Users, count: members.length },
        { id: 'missions' as Tab, label: 'Missions', icon: Target },
        { id: 'rewards' as Tab, label: 'Rewards', icon: Gift },
        { id: 'badges' as Tab, label: 'Badges', icon: Award },
        { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    ];

    const pendingRequests = joinRequests.filter(r => r.status === 'PENDING');
    const processedRequests = joinRequests.filter(r => r.status !== 'PENDING');

    return (
        <div className="min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Management Dashboard</h1>
                        <p className="text-white/70 text-sm">{organization?.name || 'Organization'}</p>
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
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white/10 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-indigo-500 text-white'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Member Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-6">
                            {/* Pending Requests */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    Pending Requests ({pendingRequests.length})
                                </h2>

                                {pendingRequests.length === 0 ? (
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 dark:border-slate-700/50">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                            <UserPlus className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400">No pending requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {request.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 dark:text-white">{request.name}</h3>
                                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                                                <Mail className="w-3 h-3" />
                                                                <span>{request.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>Requested {formatDate(request.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={actionLoading === request.id}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            {actionLoading === request.id ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={actionLoading === request.id}
                                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {actionLoading === request.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Approve</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Processed Requests */}
                            {processedRequests.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                        Request History
                                    </h2>
                                    <div className="space-y-2">
                                        {processedRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 border border-white/10 dark:border-slate-700/30 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
                                                        {request.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{request.name}</p>
                                                        <p className="text-slate-500 dark:text-slate-500 text-xs">{request.email}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'APPROVED'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {request.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                {members.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-slate-500 dark:text-slate-400">No members yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {members.map((member) => {
                                            const roleClass = member.role === 'Superadmin'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                : member.role === 'Admin'
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-slate-800 dark:text-white">{member.name}</h3>
                                                                {member.role !== 'Member' && (
                                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${roleClass}`}>
                                                                        {member.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.points} pts</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500">Level {member.level}</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other tabs - Coming Soon */}
                    {(activeTab === 'missions' || activeTab === 'rewards' || activeTab === 'badges' || activeTab === 'settings') && (
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 dark:border-slate-700/50">
                            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Coming Soon</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                This feature is under development and will be available soon.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Management;
