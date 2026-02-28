// ============================================
// CORE TYPES FOR REWARD HUNTER
// ============================================

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'Member' | 'Leader' | 'Admin' | 'Superadmin' | 'SystemAdmin';
    team: string;
    teamId: string;
    position: string;
    points: number;
    monthlyPoints: number;
    quarterlyPoints: number;
    level: number;
    nextLevelPoints: number;
    streak: number;
    badges: Badge[];
    isActive: boolean;
    orgId?: string;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    unlocked?: boolean;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    progress: number;
    total: number;
    reward: number;
    completed: boolean;
    claimed: boolean;
    type: 'daily' | 'weekly';
}

export interface KaizenIdea {
    id: string;
    title: string;
    problem: string;
    proposal: string;
    impact: 'Cost' | 'Quality' | 'Speed' | 'Safety';
    status: 'New' | 'In Review' | 'Approved' | 'Implemented' | 'Rejected';
    votes: number;
    votedBy: string[];
    author: User;
    teamId: string;
    createdAt: string;
    updatedAt: string;
    comments: Comment[];
    followers: string[];
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
}

export interface Kudos {
    id: string;
    sender: User;
    receiver: User;
    coreValue: 'Kaizen' | 'Collaboration' | 'Ownership' | 'Customer First';
    message: string;
    createdAt: string;
    likes: number;
    likedBy: string[];
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    image: string;
    cost: number;
    type: 'Voucher' | 'DayOff' | 'Merch';
    stock: number;
    isActive: boolean;
}

export interface PointTransaction {
    id: string;
    userId: string;
    description: string;
    amount: number;
    type: 'earn' | 'spend';
    source: 'idea_created' | 'idea_approved' | 'idea_implemented' | 'kudos_sent' | 'kudos_received' | 'redeem' | 'mission_completed' | 'streak_bonus' | 'admin_adjust';
    referenceId?: string;
    date: string;
}

export interface RedemptionRequest {
    id: string;
    userId: string;
    rewardId: string;
    rewardName: string;
    pointsCost: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
    requestedAt: string;
    processedAt?: string;
    processedBy?: string;
    note?: string;
}

export interface Organization {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
}

export interface JoinRequest {
    id: string;
    email: string;
    name: string;
    orgId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    parentTeamId?: string;
}

export interface FeedbackTemplate {
    id: string;
    name: string;
    type: 'start_stop_continue' | 'nps' | 'four_l' | 'open';
}

export interface FeedbackEntry {
    id: string;
    templateId: string;
    targetType: 'user' | 'team' | 'company';
    targetId?: string;
    content: Record<string, unknown>;
    score?: number;
    createdAt: string;
}

// Activity feed item
export interface ActivityItem {
    id: string;
    type: 'idea' | 'kudos' | 'badge' | 'level_up';
    user: User;
    title: string;
    description: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthState {
    currentUser: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterOrgData {
    email: string;
    password: string;
    name: string;
    orgName: string;
    otp?: string;
}

export interface JoinRequestData {
    email: string;
    password: string;
    name: string;
    orgId: string;
    otp?: string;
}

export interface DomainCheckResult {
    exists: boolean;
    organization?: Organization;
    userExists?: boolean;
}
