// ============================================
// AUTH SERVICE - Real API authentication
// ============================================

import api from './apiClient';
import {
    User,
    Organization,
    JoinRequest,
    DomainCheckResult,
    LoginCredentials,
    RegisterOrgData,
    JoinRequestData
} from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';

// ============================================
// PUBLIC API
// ============================================

/**
 * Check if email domain belongs to an existing organization
 */
export const checkDomain = async (email: string): Promise<DomainCheckResult> => {
    try {
        const { data } = await api.post('/auth/check-domain', { email });
        return data;
    } catch (error: any) {
        console.error('Domain check failed:', error);
        return { exists: false, organization: undefined };
    }
};

/**
 * Send OTP to email
 */
export const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await api.post('/auth/send-otp', { email });
        return { success: true };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to send OTP';
        return { success: false, error: message };
    }
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; organization?: Organization; error?: string }> => {
    try {
        const { data } = await api.post('/auth/login', credentials);

        // Store JWT token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);

        // Cache user & org data
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
        if (data.organization) {
            localStorage.setItem(STORAGE_KEYS.AUTH_ORG, JSON.stringify(data.organization));
        }

        return { success: true, user: data.user, organization: data.organization };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        return { success: false, error: message };
    }
};

/**
 * Register new organization (user becomes Superadmin)
 */
export const registerOrganization = async (data: RegisterOrgData): Promise<{ success: boolean; user?: User; organization?: Organization; error?: string }> => {
    try {
        const { data: result } = await api.post('/auth/register-org', data);

        // Store JWT token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.accessToken);

        // Cache user & org data
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
        if (result.organization) {
            localStorage.setItem(STORAGE_KEYS.AUTH_ORG, JSON.stringify(result.organization));
        }

        return { success: true, user: result.user, organization: result.organization };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        return { success: false, error: message };
    }
};

/**
 * Submit join request for existing organization
 */
export const submitJoinRequest = async (data: JoinRequestData): Promise<{ success: boolean; error?: string }> => {
    try {
        await api.post('/auth/join-request', data);
        return { success: true };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to submit join request';
        return { success: false, error: message };
    }
};

/**
 * Get pending join requests for organization (Admin only)
 */
export const getOrgJoinRequests = async (_orgId?: string): Promise<JoinRequest[]> => {
    const { data } = await api.get('/admin/join-requests');
    return data;
};

/**
 * Approve join request (Admin only)
 */
export const approveJoinRequest = async (requestId: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const { data } = await api.post(`/auth/join-requests/${requestId}/approve`);
        return { success: true, user: data.user };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to approve request';
        return { success: false, error: message };
    }
};

/**
 * Reject join request (Admin only)
 */
export const rejectJoinRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await api.post(`/auth/join-requests/${requestId}/reject`);
        return { success: true };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to reject request';
        return { success: false, error: message };
    }
};

/**
 * Logout current user
 */
export const logout = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_ORG);
};

/**
 * Get current authenticated user from API
 */
export const fetchCurrentUser = async (): Promise<{ user: User | null; organization: Organization | null }> => {
    try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return { user: null, organization: null };

        const { data: user } = await api.get('/auth/me');

        // Cache locally
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        // Fetch org if user has one
        let organization: Organization | null = null;
        const cachedOrg = localStorage.getItem(STORAGE_KEYS.AUTH_ORG);
        if (cachedOrg) {
            organization = JSON.parse(cachedOrg);
        }

        return { user, organization };
    } catch {
        // Token expired or invalid
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_ORG);
        return { user: null, organization: null };
    }
};

/**
 * Get current user from local cache (sync, for non-async contexts)
 */
export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
};

/**
 * Get current organization from local cache
 */
export const getCurrentOrganization = (): Organization | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_ORG);
    return data ? JSON.parse(data) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get all organizations (System Admin only)
 */
export const getAllOrganizations = async (): Promise<Organization[]> => {
    const { data } = await api.get('/admin/organizations');
    return data;
};

/**
 * Get all users or users by organization
 */
export const getAllUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
};

/**
 * Get users by organization
 */
export const getUsersByOrg = async (orgId: string): Promise<User[]> => {
    const { data } = await api.get(`/users?orgId=${orgId}`);
    return data;
};

/**
 * Update user
 */
export const updateUser = async (userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const { data } = await api.patch(`/users/${userId}`, updates);

        // Update local cache if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data));
        }

        return { success: true, user: data };
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update user';
        return { success: false, error: message };
    }
};

/**
 * Get platform statistics (System Admin only)
 */
export const getPlatformStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};
