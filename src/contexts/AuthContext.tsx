// ============================================
// AUTH CONTEXT - Global authentication state
// ============================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, AuthState } from '../types';
import * as authService from '../services/authService';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    registerOrganization: (data: { email: string; password: string; name: string; orgName: string }) => Promise<{ success: boolean; error?: string }>;
    submitJoinRequest: (data: { email: string; password: string; name: string; orgId: string }) => Promise<{ success: boolean; error?: string }>;
    checkDomain: (email: string) => Promise<{ exists: boolean; organization?: Organization; userExists?: boolean }>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state — restore session from JWT token
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { user, organization: org } = await authService.fetchCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    setOrganization(org);
                    setIsAuthenticated(true);
                }
            } catch {
                // Token invalid or expired, stay logged out
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const refreshAuth = async () => {
        try {
            const { user, organization: org } = await authService.fetchCurrentUser();
            if (user) {
                setCurrentUser(user);
                setOrganization(org);
                setIsAuthenticated(true);
            } else {
                setCurrentUser(null);
                setOrganization(null);
                setIsAuthenticated(false);
            }
        } catch {
            setCurrentUser(null);
            setOrganization(null);
            setIsAuthenticated(false);
        }
    };

    const login = async (email: string, password: string) => {
        const result = await authService.login({ email, password });

        if (result.success && result.user) {
            setCurrentUser(result.user);
            setOrganization(result.organization || null);
            setIsAuthenticated(true);
            return { success: true };
        }

        return { success: false, error: result.error };
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
        setOrganization(null);
        setIsAuthenticated(false);
    };

    const registerOrganization = async (data: { email: string; password: string; name: string; orgName: string }) => {
        const result = await authService.registerOrganization(data);

        if (result.success && result.user) {
            setCurrentUser(result.user);
            setOrganization(result.organization || null);
            setIsAuthenticated(true);
            return { success: true };
        }

        return { success: false, error: result.error };
    };

    const submitJoinRequest = async (data: { email: string; password: string; name: string; orgId: string }) => {
        return authService.submitJoinRequest(data);
    };

    const checkDomain = async (email: string) => {
        return authService.checkDomain(email);
    };

    const value: AuthContextType = {
        currentUser,
        organization,
        isAuthenticated,
        isLoading,
        login,
        logout,
        registerOrganization,
        submitJoinRequest,
        checkDomain,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
