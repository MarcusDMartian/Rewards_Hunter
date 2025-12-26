// ============================================
// ROLE GUARD - Route protection by role
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface RoleGuardProps {
    roles: User['role'][];
    children: React.ReactNode;
    redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
    roles,
    children,
    redirectTo = '/login'
}) => {
    const { currentUser, isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !currentUser) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check if user has required role
    if (!roles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
