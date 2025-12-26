// ============================================
// APP.TSX - MAIN APPLICATION WITH ROUTING
// ============================================

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isOnboardingComplete } from './services/storageService';

// Layout
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

// Pages
import Dashboard from './pages/Dashboard';
import KaizenIdeas from './pages/KaizenIdeas';
import IdeaDetail from './pages/IdeaDetail';
import Kudos from './pages/Kudos';
import Feedback from './pages/Feedback';
import Rewards from './pages/Rewards';
import LeaderboardPage from './pages/LeaderboardPage';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Management from './pages/Management';
import Console from './pages/Console';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
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
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
