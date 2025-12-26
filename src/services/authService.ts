// ============================================
// AUTH SERVICE - Mock authentication logic
// ============================================

import {
    User,
    Organization,
    JoinRequest,
    DomainCheckResult,
    LoginCredentials,
    RegisterOrgData,
    JoinRequestData
} from '../types';
import {
    ALL_USERS,
    MOCK_ORGANIZATIONS,
    MOCK_JOIN_REQUESTS,
    ALL_BADGES
} from '../constants';

// Storage keys
const STORAGE_KEYS = {
    AUTH_USER: 'reward_hunter_auth_user',
    AUTH_ORG: 'reward_hunter_auth_org',
    ORGANIZATIONS: 'reward_hunter_organizations',
    JOIN_REQUESTS: 'reward_hunter_join_requests',
    USERS: 'reward_hunter_users',
};

// Initialize mock data in localStorage if not exists
const initializeMockData = () => {
    if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS)) {
        localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(MOCK_ORGANIZATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(MOCK_JOIN_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(ALL_USERS));
    }
};

// Get data from localStorage
const getOrganizations = (): Organization[] => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
    return data ? JSON.parse(data) : [];
};

const getJoinRequests = (): JoinRequest[] => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
    return data ? JSON.parse(data) : [];
};

const getUsers = (): User[] => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
};

const saveOrganizations = (orgs: Organization[]) => {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
};

const saveJoinRequests = (requests: JoinRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Extract domain from email
const extractDomain = (email: string): string => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : '';
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Check if email domain belongs to an existing organization
 */
export const checkDomain = (email: string): DomainCheckResult => {
    const domain = extractDomain(email);
    const orgs = getOrganizations();
    const users = getUsers();

    // Find org by domain
    const org = orgs.find(o => o.domain.toLowerCase() === domain);

    if (!org) {
        return { exists: false };
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    return {
        exists: true,
        organization: org,
        userExists: !!existingUser,
    };
};

/**
 * Login with email and password
 */
export const login = (credentials: LoginCredentials): { success: boolean; user?: User; organization?: Organization; error?: string } => {
    const users = getUsers();
    const orgs = getOrganizations();

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // In mock mode, accept any password (or check for simple password like "password123")
    // For demo purposes, we'll accept any non-empty password
    if (!credentials.password || credentials.password.length < 1) {
        return { success: false, error: 'Invalid password' };
    }

    if (!user.isActive) {
        return { success: false, error: 'Account is not active. Please wait for approval.' };
    }

    // Find organization
    const org = user.orgId ? orgs.find(o => o.id === user.orgId) : undefined;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    if (org) {
        localStorage.setItem(STORAGE_KEYS.AUTH_ORG, JSON.stringify(org));
    }

    return { success: true, user, organization: org };
};

/**
 * Register new organization (user becomes Superadmin)
 */
export const registerOrganization = (data: RegisterOrgData): { success: boolean; user?: User; organization?: Organization; error?: string } => {
    const orgs = getOrganizations();
    const users = getUsers();
    const domain = extractDomain(data.email);

    // Check if domain already exists
    if (orgs.find(o => o.domain.toLowerCase() === domain)) {
        return { success: false, error: 'Organization with this domain already exists' };
    }

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: 'User with this email already exists' };
    }

    // Create new organization
    const newOrg: Organization = {
        id: `org_${Date.now()}`,
        name: data.orgName,
        domain: domain,
        createdAt: new Date().toISOString(),
    };

    // Create new Superadmin user
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s/g, '')}`,
        role: 'Superadmin',
        team: 'Management',
        teamId: 't0',
        position: 'Organization Owner',
        points: 0,
        monthlyPoints: 0,
        quarterlyPoints: 0,
        level: 1,
        nextLevelPoints: 100,
        streak: 0,
        badges: [],
        isActive: true,
        orgId: newOrg.id,
    };

    // Save to storage
    orgs.push(newOrg);
    users.push(newUser);
    saveOrganizations(orgs);
    saveUsers(users);

    // Auto login
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_ORG, JSON.stringify(newOrg));

    return { success: true, user: newUser, organization: newOrg };
};

/**
 * Submit join request for existing organization
 */
export const submitJoinRequest = (data: JoinRequestData): { success: boolean; error?: string } => {
    const requests = getJoinRequests();
    const users = getUsers();

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: 'User with this email already exists' };
    }

    // Check if request already exists
    if (requests.find(r => r.email.toLowerCase() === data.email.toLowerCase() && r.status === 'PENDING')) {
        return { success: false, error: 'A pending request already exists for this email' };
    }

    // Create new join request
    const newRequest: JoinRequest = {
        id: `jr_${Date.now()}`,
        email: data.email,
        name: data.name,
        orgId: data.orgId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    saveJoinRequests(requests);

    return { success: true };
};

/**
 * Get pending join requests for organization (Superadmin only)
 */
export const getOrgJoinRequests = (orgId: string): JoinRequest[] => {
    const requests = getJoinRequests();
    return requests.filter(r => r.orgId === orgId);
};

/**
 * Approve join request (Superadmin only)
 */
export const approveJoinRequest = (requestId: string): { success: boolean; user?: User; error?: string } => {
    const requests = getJoinRequests();
    const users = getUsers();
    const orgs = getOrganizations();

    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        return { success: false, error: 'Request not found' };
    }

    const request = requests[requestIndex];
    const org = orgs.find(o => o.id === request.orgId);

    if (!org) {
        return { success: false, error: 'Organization not found' };
    }

    // Create new user
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: request.name,
        email: request.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name.replace(/\s/g, '')}`,
        role: 'Member',
        team: 'General',
        teamId: 't1',
        position: 'Team Member',
        points: 0,
        monthlyPoints: 0,
        quarterlyPoints: 0,
        level: 1,
        nextLevelPoints: 100,
        streak: 0,
        badges: [ALL_BADGES[0]], // Give Early Bird badge as welcome gift
        isActive: true,
        orgId: org.id,
    };

    // Update request status
    requests[requestIndex].status = 'APPROVED';

    // Add user
    users.push(newUser);

    saveJoinRequests(requests);
    saveUsers(users);

    return { success: true, user: newUser };
};

/**
 * Reject join request (Superadmin only)
 */
export const rejectJoinRequest = (requestId: string): { success: boolean; error?: string } => {
    const requests = getJoinRequests();

    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        return { success: false, error: 'Request not found' };
    }

    requests[requestIndex].status = 'REJECTED';
    saveJoinRequests(requests);

    return { success: true };
};

/**
 * Logout current user
 */
export const logout = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_ORG);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
};

/**
 * Get current organization
 */
export const getCurrentOrganization = (): Organization | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_ORG);
    return data ? JSON.parse(data) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getCurrentUser();
};

/**
 * Get all organizations (System Admin only)
 */
export const getAllOrganizations = (): Organization[] => {
    return getOrganizations();
};

/**
 * Get all users (System Admin only)
 */
export const getAllUsers = (): User[] => {
    return getUsers();
};

/**
 * Get users by organization
 */
export const getUsersByOrg = (orgId: string): User[] => {
    const users = getUsers();
    return users.filter(u => u.orgId === orgId);
};

/**
 * Update user
 */
export const updateUser = (userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { success: false, error: 'User not found' };
    }

    users[index] = { ...users[index], ...updates };
    saveUsers(users);

    // Update current user if it's the same
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(users[index]));
    }

    return { success: true, user: users[index] };
};

/**
 * Get platform statistics (System Admin only)
 */
export const getPlatformStats = () => {
    const orgs = getOrganizations();
    const users = getUsers();
    const requests = getJoinRequests();

    return {
        totalOrganizations: orgs.length,
        totalUsers: users.filter(u => u.role !== 'SystemAdmin').length,
        activeUsers: users.filter(u => u.isActive && u.role !== 'SystemAdmin').length,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
    };
};
