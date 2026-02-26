// ============================================
// APP.TSX - MAIN APPLICATION WITH ROUTING
// ============================================

import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isOnboardingComplete } from './services/storageService';
import ErrorBoundary from './components/ErrorBoundary';

// Layout (always loaded)
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const KaizenIdeas = React.lazy(() => import('./pages/KaizenIdeas'));
const IdeaDetail = React.lazy(() => import('./pages/IdeaDetail'));
const Kudos = React.lazy(() => import('./pages/Kudos'));
const Feedback = React.lazy(() => import('./pages/Feedback'));
const Rewards = React.lazy(() => import('./pages/Rewards'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const Badges = React.lazy(() => import('./pages/Badges'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Login = React.lazy(() => import('./pages/Login'));
const Management = React.lazy(() => import('./pages/Management'));
const Console = React.lazy(() => import('./pages/Console'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading fallback
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading while checking auth
    if (isLoading) {
        return <PageLoader />;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if onboarding is complete
    if (!isOnboardingComplete()) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Management Dashboard - Superadmin/Admin only */}
                <Route
                    path="/management/*"
                    element={
                        <RoleGuard roles={['Superadmin', 'Admin']}>
                            <Layout>
                                <Management />
                            </Layout>
                        </RoleGuard>
                    }
                />

                {/* System Console - SystemAdmin only */}
                <Route
                    path="/console/*"
                    element={
                        <RoleGuard roles={['SystemAdmin']}>
                            <Layout>
                                <Console />
                            </Layout>
                        </RoleGuard>
                    }
                />

                {/* Protected Routes with Layout */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/ideas" element={<KaizenIdeas />} />
                                    <Route path="/ideas/:id" element={<IdeaDetail />} />
                                    <Route path="/kudos" element={<Kudos />} />
                                    <Route path="/feedback" element={<Feedback />} />
                                    <Route path="/rewards" element={<Rewards />} />
                                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                                    <Route path="/badges" element={<Badges />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/settings" element={<Settings />} />

                                    {/* Fallback */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <HashRouter>
                            <AppRoutes />
                        </HashRouter>
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
