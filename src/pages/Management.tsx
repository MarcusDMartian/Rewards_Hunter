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
    Plus,
    Trash2,
    Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JoinRequest, User, Mission, Reward, Badge, RedemptionRequest } from '../types';
import * as authService from '../services/authService';
import * as storageService from '../services/storageService';

type Tab = 'requests' | 'members' | 'missions' | 'rewards' | 'badges' | 'settings';

const Management: React.FC = () => {
    const { organization, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('requests');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Phase 2: New state for Missions, Rewards, Badges, Settings
    const [missions, setMissions] = useState<Mission[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
    const [showMissionForm, setShowMissionForm] = useState(false);
    const [showRewardForm, setShowRewardForm] = useState(false);
    const [showBadgeForm, setShowBadgeForm] = useState(false);
    const [newMission, setNewMission] = useState({ title: '', type: 'daily' as 'daily' | 'weekly', total: 1, reward: 10 });
    const [newReward, setNewReward] = useState({ name: '', description: '', cost: 100, type: 'Voucher' as 'Voucher' | 'DayOff' | 'Merch', stock: 10 });
    const [newBadge, setNewBadge] = useState({ name: '', icon: '🏆', color: 'bg-indigo-100' });
    const [orgName, setOrgName] = useState('');
    const [pointRules, setPointRules] = useState({ idea_created: 50, kudos_sent: 10, kudos_received: 15, daily_login: 5 });
    const [settingsSaved, setSettingsSaved] = useState(false);

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
            setOrgName(organization.name);
        }
        // Load missions, rewards, badges, redemptions from localStorage
        setMissions(storageService.getMissions());
        const allRewards: Reward[] = JSON.parse(localStorage.getItem('rh_rewards') || '[]');
        setRewards(allRewards);
        setBadges(storageService.getCurrentUser().badges || []);
        setRedemptions(storageService.getRedemptions());
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

                    {/* Missions Tab */}
                    {activeTab === 'missions' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Missions ({missions.length})</h2>
                                <button onClick={() => setShowMissionForm(!showMissionForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium">
                                    <Plus className="w-4 h-4" /> New Mission
                                </button>
                            </div>

                            {showMissionForm && (
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Create Mission</h3>
                                    <input value={newMission.title} onChange={e => setNewMission({ ...newMission, title: e.target.value })} placeholder="Mission title" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                    <div className="grid grid-cols-3 gap-4">
                                        <select value={newMission.type} onChange={e => setNewMission({ ...newMission, type: e.target.value as any })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                        <input type="number" value={newMission.total} onChange={e => setNewMission({ ...newMission, total: parseInt(e.target.value) || 1 })} placeholder="Target count" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        <input type="number" value={newMission.reward} onChange={e => setNewMission({ ...newMission, reward: parseInt(e.target.value) || 10 })} placeholder="XP reward" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                    </div>
                                    <button onClick={() => { if (newMission.title.trim()) { const m: Mission = { id: `m_${Date.now()}`, title: newMission.title, description: '', progress: 0, total: newMission.total, reward: newMission.reward, completed: false, claimed: false, type: newMission.type }; const updated = [...missions, m]; setMissions(updated); storageService.saveMissions(updated); setNewMission({ title: '', type: 'daily', total: 1, reward: 10 }); setShowMissionForm(false); } }} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                                        Create
                                    </button>
                                </div>
                            )}

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                {missions.length === 0 ? (
                                    <div className="p-8 text-center"><Target className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No missions created yet</p></div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {missions.map(mission => (
                                            <div key={mission.id} className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mission.completed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                                        <Target className={`w-5 h-5 ${mission.completed ? 'text-emerald-500' : 'text-indigo-500'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{mission.title}</p>
                                                        <p className="text-xs text-slate-500">{mission.type} • {mission.progress}/{mission.total} • {mission.reward} XP</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { const updated = missions.filter(m => m.id !== mission.id); setMissions(updated); storageService.saveMissions(updated); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                    Pending Redemptions ({redemptions.filter(r => r.status === 'Pending').length})
                                </h2>
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                                    {redemptions.filter(r => r.status === 'Pending').length === 0 ? (
                                        <div className="p-8 text-center"><Gift className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No pending redemptions</p></div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {redemptions.filter(r => r.status === 'Pending').map(r => (
                                                <div key={r.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{r.rewardName}</p>
                                                        <p className="text-sm text-slate-500">{r.pointsCost} pts • {new Date(r.requestedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { const updated = redemptions.map(red => red.id === r.id ? { ...red, status: 'Approved' as const, processedAt: new Date().toISOString() } : red); setRedemptions(updated); storageService.saveRedemptions(updated); }} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" /> Approve
                                                        </button>
                                                        <button onClick={() => { const updated = redemptions.map(red => red.id === r.id ? { ...red, status: 'Rejected' as const, processedAt: new Date().toISOString() } : red); setRedemptions(updated); storageService.saveRedemptions(updated); }} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" /> Reject
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
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-purple-500" /> Reward Catalog ({rewards.length})
                                    </h2>
                                    <button onClick={() => setShowRewardForm(!showRewardForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all text-sm font-medium">
                                        <Plus className="w-4 h-4" /> Add Reward
                                    </button>
                                </div>

                                {showRewardForm && (
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4 mb-4">
                                        <h3 className="font-semibold text-slate-800 dark:text-white">Add Reward</h3>
                                        <input value={newReward.name} onChange={e => setNewReward({ ...newReward, name: e.target.value })} placeholder="Reward name" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        <input value={newReward.description} onChange={e => setNewReward({ ...newReward, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input type="number" value={newReward.cost} onChange={e => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 100 })} placeholder="Cost (pts)" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                            <select value={newReward.type} onChange={e => setNewReward({ ...newReward, type: e.target.value as any })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                                                <option value="Voucher">Voucher</option>
                                                <option value="DayOff">Day Off</option>
                                                <option value="Merch">Merchandise</option>
                                            </select>
                                            <input type="number" value={newReward.stock} onChange={e => setNewReward({ ...newReward, stock: parseInt(e.target.value) || 1 })} placeholder="Stock" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        </div>
                                        <button onClick={() => { if (newReward.name.trim()) { const r: Reward = { id: `rw_${Date.now()}`, ...newReward, image: '', isActive: true }; const updated = [...rewards, r]; setRewards(updated); localStorage.setItem('rh_rewards', JSON.stringify(updated)); setNewReward({ name: '', description: '', cost: 100, type: 'Voucher', stock: 10 }); setShowRewardForm(false); } }} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                                            Create
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rewards.map(reward => (
                                        <div key={reward.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                    <Gift className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${reward.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                        {reward.isActive ? 'Active' : 'Hidden'}
                                                    </span>
                                                    <button onClick={() => { const updated = rewards.filter(r => r.id !== reward.id); setRewards(updated); localStorage.setItem('rh_rewards', JSON.stringify(updated)); }} className="p-1 text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">{reward.name}</h3>
                                            {reward.description && <p className="text-sm text-slate-500 mt-1">{reward.description}</p>}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-amber-500 font-bold">{reward.cost} pts</span>
                                                <span className="text-sm text-slate-500">Stock: {reward.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Badges Tab */}
                    {activeTab === 'badges' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Badges ({badges.length})</h2>
                                <button onClick={() => setShowBadgeForm(!showBadgeForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all text-sm font-medium">
                                    <Plus className="w-4 h-4" /> New Badge
                                </button>
                            </div>

                            {showBadgeForm && (
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Create Badge</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })} placeholder="Badge name" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        <input value={newBadge.icon} onChange={e => setNewBadge({ ...newBadge, icon: e.target.value })} placeholder="Icon emoji" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        <select value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                                            <option value="bg-indigo-100">Indigo</option>
                                            <option value="bg-purple-100">Purple</option>
                                            <option value="bg-amber-100">Amber</option>
                                            <option value="bg-emerald-100">Emerald</option>
                                            <option value="bg-rose-100">Rose</option>
                                            <option value="bg-blue-100">Blue</option>
                                        </select>
                                    </div>
                                    <button onClick={() => { if (newBadge.name.trim()) { const b: Badge = { id: `b_${Date.now()}`, description: '', ...newBadge, unlocked: false }; const user = storageService.getCurrentUser(); user.badges = [...(user.badges || []), b]; storageService.saveCurrentUser(user); setBadges(user.badges); setNewBadge({ name: '', icon: '🏆', color: 'bg-indigo-100' }); setShowBadgeForm(false); } }} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                                        Create
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {badges.map((badge, idx) => (
                                    <div key={idx} className={`${badge.color} dark:bg-slate-800/60 rounded-2xl p-4 text-center border border-white/20 dark:border-slate-700/50 ${!badge.unlocked ? 'opacity-60' : ''}`}>
                                        <div className="text-3xl mb-2">{badge.icon}</div>
                                        <p className="font-medium text-slate-800 dark:text-white text-sm">{badge.name}</p>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${badge.unlocked ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {badge.unlocked ? 'Unlocked' : 'Locked'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-500" /> Organization
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Organization Name</label>
                                        <input value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full mt-1 px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-amber-500" /> Point Rules (XP per action)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(pointRules).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{key.replace(/_/g, ' ')}</label>
                                            <input type="number" value={value} onChange={e => setPointRules({ ...pointRules, [key]: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => { localStorage.setItem('rh_point_rules', JSON.stringify(pointRules)); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-medium">
                                <Save className="w-5 h-5" />
                                {settingsSaved ? 'Saved ✓' : 'Save Settings'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Management;
