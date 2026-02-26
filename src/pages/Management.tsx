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
    Building2,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JoinRequest, User, Mission, Reward, Badge, RedemptionRequest } from '../types';
import * as authService from '../services/authService';
import * as storageService from '../services/storageService';
import { STORAGE_KEYS } from '../constants/storageKeys';

// Sub-components
import ManagementRequestsTab from './management/ManagementRequestsTab';
import ManagementMembersTab from './management/ManagementMembersTab';
import ManagementMissionsTab from './management/ManagementMissionsTab';
import ManagementRewardsTab from './management/ManagementRewardsTab';
import ManagementBadgesTab from './management/ManagementBadgesTab';
import ManagementSettingsTab from './management/ManagementSettingsTab';

type Tab = 'requests' | 'members' | 'missions' | 'rewards' | 'badges' | 'settings';

const Management: React.FC = () => {
    const { organization, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('requests');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);

    useEffect(() => { loadData(); }, [organization]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (organization) {
                const [requests, orgUsers] = await Promise.all([
                    authService.getOrgJoinRequests(organization.id),
                    authService.getUsersByOrg(organization.id),
                ]);
                setJoinRequests(requests);
                setMembers(orgUsers.filter(u => u.id !== currentUser?.id));
            }
            setMissions(await storageService.getMissions());
            setRewards(JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARDS) || '[]'));
            setBadges(storageService.getCurrentUser().badges || []);
            setRedemptions(await storageService.getRedemptions());
        } catch (err) {
            console.error('Failed to load management data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        setActionLoading(requestId);
        const result = await authService.approveJoinRequest(requestId);
        if (result.success) loadData();
        setActionLoading(null);
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(requestId);
        const result = await authService.rejectJoinRequest(requestId);
        if (result.success) loadData();
        setActionLoading(null);
    };

    const tabs = [
        { id: 'requests' as Tab, label: 'Member Requests', icon: UserPlus, count: joinRequests.filter(r => r.status === 'PENDING').length },
        { id: 'members' as Tab, label: 'Members', icon: Users, count: members.length },
        { id: 'missions' as Tab, label: 'Missions', icon: Target },
        { id: 'rewards' as Tab, label: 'Rewards', icon: Gift },
        { id: 'badges' as Tab, label: 'Badges', icon: Award },
        { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    ];

    const tabProps = {
        organization, currentUser, joinRequests, members, missions, rewards, badges, redemptions,
        onApprove: handleApprove, onReject: handleReject, onDataReload: loadData, actionLoading,
        setMissions, setRewards, setBadges, setRedemptions,
    };

    const tabComponents: Record<Tab, React.ReactNode> = {
        requests: <ManagementRequestsTab {...tabProps} />,
        members: <ManagementMembersTab {...tabProps} />,
        missions: <ManagementMissionsTab {...tabProps} />,
        rewards: <ManagementRewardsTab {...tabProps} />,
        badges: <ManagementBadgesTab {...tabProps} />,
        settings: <ManagementSettingsTab {...tabProps} />,
    };

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
                                <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-indigo-500 text-white'}`}>
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
                tabComponents[activeTab]
            )}
        </div>
    );
};

export default Management;
