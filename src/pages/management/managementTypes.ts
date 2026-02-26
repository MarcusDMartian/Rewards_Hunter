// ============================================
// MANAGEMENT TYPES - Shared types for Management tabs
// ============================================

import { JoinRequest, User, Mission, Reward, Badge, RedemptionRequest, Organization } from '../../types';

export interface ManagementTabProps {
    organization: Organization | null;
    currentUser: User | null;
    joinRequests: JoinRequest[];
    members: User[];
    missions: Mission[];
    rewards: Reward[];
    badges: Badge[];
    redemptions: RedemptionRequest[];
    // Actions
    onApprove: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onDataReload: () => void;
    actionLoading: string | null;
    // Missions
    setMissions: (missions: Mission[]) => void;
    // Rewards
    setRewards: (rewards: Reward[]) => void;
    // Badges
    setBadges: (badges: Badge[]) => void;
    // Redemptions
    setRedemptions: (redemptions: RedemptionRequest[]) => void;
}
