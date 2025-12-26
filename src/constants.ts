// ============================================
// MOCK DATA FOR REWARD HUNTER
// ============================================

import { User, Badge, Mission, KaizenIdea, Kudos, Reward, PointTransaction, Team, ActivityItem, Organization, JoinRequest } from './types';

// ============================================
// BADGES
// ============================================
export const ALL_BADGES: Badge[] = [
    { id: 'b1', name: 'Early Bird', icon: '🌅', color: 'bg-amber-500', description: 'Complete a mission before 9 AM' },
    { id: 'b2', name: 'Idea Machine', icon: '💡', color: 'bg-yellow-500', description: 'Submit 5 Kaizen ideas' },
    { id: 'b3', name: 'Kudos Star', icon: '⭐', color: 'bg-purple-500', description: 'Receive 10 Kudos from colleagues' },
    { id: 'b4', name: 'Top Performer', icon: '🏆', color: 'bg-indigo-500', description: 'Reach top 3 on the monthly leaderboard' },
    { id: 'b5', name: 'Bug Hunter', icon: '🐞', color: 'bg-red-500', description: 'Report or fix 5 technical issues' },
    { id: 'b6', name: 'Team Player', icon: '🤝', color: 'bg-emerald-500', description: 'Send 20 Kudos to your teammates' },
    { id: 'b7', name: 'Streak Master', icon: '🔥', color: 'bg-orange-500', description: 'Maintain a 30-day activity streak' },
    { id: 'b8', name: 'Innovator', icon: '🚀', color: 'bg-blue-500', description: 'Have 3 ideas implemented' },
];

// ============================================
// TEAMS
// ============================================
export const TEAMS: Team[] = [
    { id: 't1', name: 'Engineering' },
    { id: 't2', name: 'Product' },
    { id: 't3', name: 'Design' },
    { id: 't4', name: 'Marketing' },
    { id: 't5', name: 'Sales' },
    { id: 't6', name: 'HR' },
];

// ============================================
// USERS
// ============================================
export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Nguyen Van A',
        email: 'a@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenA',
        role: 'Member',
        team: 'Engineering',
        teamId: 't1',
        position: 'Senior Developer',
        points: 2450,
        monthlyPoints: 580,
        quarterlyPoints: 1200,
        level: 12,
        nextLevelPoints: 3000,
        streak: 7,
        badges: [ALL_BADGES[0], ALL_BADGES[1], ALL_BADGES[5]],
        isActive: true,
    },
    {
        id: 'u2',
        name: 'Tran Thi B',
        email: 'b@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranB',
        role: 'Leader',
        team: 'Product',
        teamId: 't2',
        position: 'Product Manager',
        points: 3200,
        monthlyPoints: 720,
        quarterlyPoints: 1800,
        level: 15,
        nextLevelPoints: 4000,
        streak: 14,
        badges: [ALL_BADGES[0], ALL_BADGES[2], ALL_BADGES[3], ALL_BADGES[7]],
        isActive: true,
    },
    {
        id: 'u3',
        name: 'Le Van C',
        email: 'c@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeC',
        role: 'Member',
        team: 'Design',
        teamId: 't3',
        position: 'UI/UX Designer',
        points: 1800,
        monthlyPoints: 420,
        quarterlyPoints: 950,
        level: 9,
        nextLevelPoints: 2000,
        streak: 3,
        badges: [ALL_BADGES[1], ALL_BADGES[4]],
        isActive: true,
    },
    {
        id: 'u4',
        name: 'Pham Thi D',
        email: 'd@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamD',
        role: 'Admin',
        team: 'HR',
        teamId: 't6',
        position: 'HR Manager',
        points: 2100,
        monthlyPoints: 350,
        quarterlyPoints: 1100,
        level: 11,
        nextLevelPoints: 2500,
        streak: 21,
        badges: [ALL_BADGES[5], ALL_BADGES[6]],
        isActive: true,
    },
    {
        id: 'u5',
        name: 'Hoang Van E',
        email: 'e@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HoangE',
        role: 'Member',
        team: 'Marketing',
        teamId: 't4',
        position: 'Marketing Specialist',
        points: 1500,
        monthlyPoints: 280,
        quarterlyPoints: 700,
        level: 7,
        nextLevelPoints: 1800,
        streak: 5,
        badges: [ALL_BADGES[2]],
        isActive: true,
    },
];

// Current user (logged in user)
export const CURRENT_USER: User = MOCK_USERS[0];

// ============================================
// MISSIONS
// ============================================
export const MOCK_MISSIONS: Mission[] = [
    {
        id: 'm1',
        title: 'Submit a Kaizen Idea',
        description: 'Share one improvement idea today',
        progress: 0,
        total: 1,
        reward: 50,
        completed: false,
        claimed: false,
        type: 'daily',
    },
    {
        id: 'm2',
        title: 'Send 2 Kudos',
        description: 'Recognize your teammates',
        progress: 1,
        total: 2,
        reward: 30,
        completed: false,
        claimed: false,
        type: 'daily',
    },
    {
        id: 'm3',
        title: 'Vote on 3 Ideas',
        description: 'Support great ideas from others',
        progress: 3,
        total: 3,
        reward: 20,
        completed: true,
        claimed: false,
        type: 'daily',
    },
    {
        id: 'm4',
        title: 'Weekly Streak',
        description: 'Stay active for 7 days',
        progress: 5,
        total: 7,
        reward: 100,
        completed: false,
        claimed: false,
        type: 'weekly',
    },
];

// ============================================
// KAIZEN IDEAS
// ============================================
export const MOCK_IDEAS: KaizenIdea[] = [
    {
        id: 'i1',
        title: 'Automate daily report generation',
        problem: 'We spend 2 hours daily compiling reports manually from multiple sources.',
        proposal: 'Create an automated script that pulls data from all sources and generates a formatted report automatically.',
        impact: 'Speed',
        status: 'Implemented',
        votes: 24,
        votedBy: ['u2', 'u3', 'u4'],
        author: MOCK_USERS[1],
        teamId: 't2',
        createdAt: '2024-12-20T09:00:00Z',
        updatedAt: '2024-12-23T14:00:00Z',
        comments: [
            { id: 'c1', userId: 'u3', userName: 'Le Van C', userAvatar: MOCK_USERS[2].avatar, text: 'Great idea! This would save so much time.', createdAt: '2024-12-20T10:30:00Z' },
            { id: 'c2', userId: 'u4', userName: 'Pham Thi D', userAvatar: MOCK_USERS[3].avatar, text: 'Already implemented and working great!', createdAt: '2024-12-23T14:00:00Z' },
        ],
        followers: ['u1', 'u3'],
    },
    {
        id: 'i2',
        title: 'Improve onboarding documentation',
        problem: 'New employees take 2 weeks to get up to speed due to scattered documentation.',
        proposal: 'Create a centralized, well-organized documentation hub with step-by-step guides and video tutorials.',
        impact: 'Quality',
        status: 'Approved',
        votes: 18,
        votedBy: ['u1', 'u4', 'u5'],
        author: MOCK_USERS[3],
        teamId: 't6',
        createdAt: '2024-12-22T11:00:00Z',
        updatedAt: '2024-12-24T09:00:00Z',
        comments: [
            { id: 'c3', userId: 'u1', userName: 'Nguyen Van A', userAvatar: MOCK_USERS[0].avatar, text: 'I can help with the technical docs!', createdAt: '2024-12-22T14:00:00Z' },
        ],
        followers: ['u2'],
    },
    {
        id: 'i3',
        title: 'Reduce meeting time by 25%',
        problem: 'Meetings often run over time and lack clear agendas.',
        proposal: 'Implement mandatory agenda templates and 5-minute buffer between meetings.',
        impact: 'Speed',
        status: 'In Review',
        votes: 12,
        votedBy: ['u2'],
        author: MOCK_USERS[0],
        teamId: 't1',
        createdAt: '2024-12-24T08:00:00Z',
        updatedAt: '2024-12-24T08:00:00Z',
        comments: [],
        followers: [],
    },
    {
        id: 'i4',
        title: 'Implement code review checklist',
        problem: 'Code reviews are inconsistent and sometimes miss important issues.',
        proposal: 'Create a standardized checklist for code reviews covering security, performance, and best practices.',
        impact: 'Quality',
        status: 'New',
        votes: 5,
        votedBy: [],
        author: MOCK_USERS[2],
        teamId: 't3',
        createdAt: '2024-12-25T07:00:00Z',
        updatedAt: '2024-12-25T07:00:00Z',
        comments: [],
        followers: [],
    },
];

// ============================================
// KUDOS
// ============================================
export const MOCK_KUDOS: Kudos[] = [
    {
        id: 'k1',
        sender: MOCK_USERS[0],
        receiver: MOCK_USERS[1],
        coreValue: 'Kaizen',
        message: 'Thank you for the amazing work on the automation project! Your dedication to continuous improvement is truly inspiring. 🚀',
        createdAt: '2024-12-25T10:00:00Z',
        likes: 8,
        likedBy: ['u3', 'u4', 'u5'],
    },
    {
        id: 'k2',
        sender: MOCK_USERS[1],
        receiver: MOCK_USERS[2],
        coreValue: 'Collaboration',
        message: 'Great teamwork on the new design system! The collaboration between design and engineering was seamless. 🤝',
        createdAt: '2024-12-24T15:30:00Z',
        likes: 12,
        likedBy: ['u1', 'u4'],
    },
    {
        id: 'k3',
        sender: MOCK_USERS[3],
        receiver: MOCK_USERS[0],
        coreValue: 'Ownership',
        message: 'Impressed by how you took full ownership of the critical bug fix over the weekend. True dedication! 💪',
        createdAt: '2024-12-23T09:00:00Z',
        likes: 15,
        likedBy: ['u2', 'u5'],
    },
    {
        id: 'k4',
        sender: MOCK_USERS[4],
        receiver: MOCK_USERS[3],
        coreValue: 'Customer First',
        message: 'Your quick response to the client feedback made all the difference. Always putting customers first! ⭐',
        createdAt: '2024-12-22T14:00:00Z',
        likes: 6,
        likedBy: ['u1', 'u2'],
    },
];

// ============================================
// REWARDS
// ============================================
export const MOCK_REWARDS: Reward[] = [
    {
        id: 'r1',
        name: 'Grab Voucher 100K',
        description: 'Grab food/ride voucher worth 100,000 VND',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
        cost: 500,
        type: 'Voucher',
        stock: 50,
        isActive: true,
    },
    {
        id: 'r2',
        name: 'Extra Day Off',
        description: 'One additional paid day off to use anytime',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
        cost: 2000,
        type: 'DayOff',
        stock: 10,
        isActive: true,
    },
    {
        id: 'r3',
        name: 'Company Hoodie',
        description: 'Premium quality hoodie with company logo',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=200&fit=crop',
        cost: 800,
        type: 'Merch',
        stock: 25,
        isActive: true,
    },
    {
        id: 'r4',
        name: 'Amazon Gift Card $20',
        description: 'Amazon.com digital gift card',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=200&fit=crop',
        cost: 1000,
        type: 'Voucher',
        stock: 30,
        isActive: true,
    },
    {
        id: 'r5',
        name: 'Coffee Machine Time',
        description: '30 minutes with the premium coffee machine',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop',
        cost: 100,
        type: 'Merch',
        stock: 999,
        isActive: true,
    },
    {
        id: 'r6',
        name: 'Wireless Earbuds',
        description: 'High-quality wireless earbuds',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=200&fit=crop',
        cost: 1500,
        type: 'Merch',
        stock: 8,
        isActive: true,
    },
];

// ============================================
// POINT TRANSACTIONS
// ============================================
export const MOCK_TRANSACTIONS: PointTransaction[] = [
    { id: 'pt1', userId: 'u1', description: 'Submitted Kaizen idea', amount: 50, type: 'earn', source: 'idea_created', date: '2024-12-25T08:00:00Z' },
    { id: 'pt2', userId: 'u1', description: 'Received kudos from Tran Thi B', amount: 20, type: 'earn', source: 'kudos_received', date: '2024-12-24T15:00:00Z' },
    { id: 'pt3', userId: 'u1', description: 'Completed daily mission', amount: 30, type: 'earn', source: 'mission_completed', date: '2024-12-24T12:00:00Z' },
    { id: 'pt4', userId: 'u1', description: 'Redeemed Grab Voucher', amount: -500, type: 'spend', source: 'redeem', date: '2024-12-23T10:00:00Z' },
    { id: 'pt5', userId: 'u1', description: 'Idea approved', amount: 100, type: 'earn', source: 'idea_approved', date: '2024-12-22T16:00:00Z' },
    { id: 'pt6', userId: 'u1', description: '7-day streak bonus', amount: 50, type: 'earn', source: 'streak_bonus', date: '2024-12-21T00:00:00Z' },
];

// ============================================
// ACTIVITY FEED
// ============================================
export const MOCK_ACTIVITIES: ActivityItem[] = [
    {
        id: 'a1',
        type: 'idea',
        user: MOCK_USERS[0],
        title: 'New Kaizen Idea',
        description: 'submitted "Reduce meeting time by 25%"',
        createdAt: '2024-12-25T08:00:00Z',
        metadata: { ideaId: 'i3', impact: 'Speed' },
    },
    {
        id: 'a2',
        type: 'kudos',
        user: MOCK_USERS[0],
        title: 'Kudos Sent',
        description: 'recognized Tran Thi B for Kaizen',
        createdAt: '2024-12-25T10:00:00Z',
    },
    {
        id: 'a3',
        type: 'badge',
        user: MOCK_USERS[1],
        title: 'Badge Earned',
        description: 'unlocked "Innovator" badge',
        createdAt: '2024-12-24T14:00:00Z',
        metadata: { badgeId: 'b8' },
    },
];

// ============================================
// CORE VALUES
// ============================================
export const CORE_VALUES = [
    { id: 'cv1', name: 'Kaizen', color: 'bg-indigo-500', description: 'Continuous improvement' },
    { id: 'cv2', name: 'Collaboration', color: 'bg-emerald-500', description: 'Working together' },
    { id: 'cv3', name: 'Ownership', color: 'bg-amber-500', description: 'Taking responsibility' },
    { id: 'cv4', name: 'Customer First', color: 'bg-rose-500', description: 'Putting customers first' },
];

// ============================================
// FEEDBACK TEMPLATES
// ============================================
export const FEEDBACK_TEMPLATES = [
    { id: 'ft1', name: 'Start/Stop/Continue', type: 'start_stop_continue' as const },
    { id: 'ft2', name: 'NPS Score', type: 'nps' as const },
    { id: 'ft3', name: '4L Framework', type: 'four_l' as const },
    { id: 'ft4', name: 'Open Feedback', type: 'open' as const },
];

// ============================================
// IMPACT TYPES
// ============================================
export const IMPACT_TYPES = [
    { id: 'cost', name: 'Cost Saving', icon: '💰', color: 'text-emerald-600 bg-emerald-100' },
    { id: 'quality', name: 'Quality Improvement', icon: '✨', color: 'text-purple-600 bg-purple-100' },
    { id: 'speed', name: 'Speed/Efficiency', icon: '⚡', color: 'text-blue-600 bg-blue-100' },
    { id: 'safety', name: 'Safety', icon: '🛡️', color: 'text-red-600 bg-red-100' },
];

// ============================================
// ORGANIZATIONS
// ============================================
export const MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'org1', name: 'ACME Corporation', domain: 'company.com', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'org2', name: 'TechStart Inc', domain: 'techstart.io', createdAt: '2024-06-15T00:00:00Z' },
];

// ============================================
// JOIN REQUESTS
// ============================================
export const MOCK_JOIN_REQUESTS: JoinRequest[] = [
    { id: 'jr1', email: 'newuser1@company.com', name: 'Nguyen Van X', orgId: 'org1', status: 'PENDING', createdAt: '2024-12-25T08:00:00Z' },
    { id: 'jr2', email: 'newuser2@company.com', name: 'Tran Van Y', orgId: 'org1', status: 'PENDING', createdAt: '2024-12-24T10:00:00Z' },
    { id: 'jr3', email: 'test@techstart.io', name: 'Le Thi Z', orgId: 'org2', status: 'PENDING', createdAt: '2024-12-23T15:00:00Z' },
];

// ============================================
// SUPERADMIN USER (Owner of org1)
// ============================================
export const SUPERADMIN_USER: User = {
    id: 'superadmin1',
    name: 'Owner Admin',
    email: 'owner@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OwnerAdmin',
    role: 'Superadmin',
    team: 'Management',
    teamId: 't0',
    position: 'Organization Owner',
    points: 5000,
    monthlyPoints: 1000,
    quarterlyPoints: 3000,
    level: 20,
    nextLevelPoints: 6000,
    streak: 30,
    badges: [ALL_BADGES[0], ALL_BADGES[1], ALL_BADGES[2], ALL_BADGES[3]],
    isActive: true,
    orgId: 'org1',
};

// ============================================
// SYSTEM ADMIN USER (Platform-level)
// ============================================
export const SYSTEM_ADMIN_USER: User = {
    id: 'sysadmin',
    name: 'System Administrator',
    email: 'admin@rewardhunter.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin',
    role: 'SystemAdmin',
    team: 'Platform',
    teamId: 'platform',
    position: 'System Administrator',
    points: 0,
    monthlyPoints: 0,
    quarterlyPoints: 0,
    level: 99,
    nextLevelPoints: 99999,
    streak: 0,
    badges: [],
    isActive: true,
};

// ============================================
// ALL USERS (including special users)
// ============================================
export const ALL_USERS: User[] = [
    ...MOCK_USERS.map(u => ({ ...u, orgId: 'org1' })),
    SUPERADMIN_USER,
    SYSTEM_ADMIN_USER,
];
