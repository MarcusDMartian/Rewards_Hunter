// ============================================
// LAYOUT COMPONENT - MAIN NAVIGATION & STRUCTURE
// ============================================

import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Lightbulb,
    Heart,
    Trophy,
    Award,
    Gift,
    User,
    Bell,
    Plus,
    Moon,
    Sun,
    Building2,
    Server,
    LogOut,
    Search,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SearchModal from './SearchModal';

interface LayoutProps {
    children: ReactNode;
}

const NAV_ITEMS = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/ideas', icon: Lightbulb, label: 'Kaizen' },
    { path: '/kudos', icon: Heart, label: 'Kudos' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranking' },
    { path: '/badges', icon: Award, label: 'Badges' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { currentUser, logout } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Cmd+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get nav items based on user role
    const getNavItems = () => {
        const items = [...NAV_ITEMS.slice(0, 6)];

        // Add Management for Superadmin/Admin
        if (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') {
            items.push({ path: '/management', icon: Building2, label: 'Manage' });
        }

        // Add Console for SystemAdmin
        if (currentUser?.role === 'SystemAdmin') {
            items.push({ path: '/console', icon: Server, label: 'Console' });
        }

        return items;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 transition-colors duration-300">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="blob absolute top-0 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 opacity-70 animate-blob" />
                <div className="blob absolute top-0 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 opacity-70 animate-blob animation-delay-2000" />
                <div className="blob absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 opacity-70 animate-blob animation-delay-4000" />
            </div>

            {/* Desktop Top Navigation */}
            <nav className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="glass rounded-full px-6 py-3 flex items-center gap-6 shadow-lg">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">Reward Hunter</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                            title="Search (⌘K)"
                        >
                            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>

                        <button className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors relative">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <Link to="/profile" className="flex items-center gap-2">
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser?.name || 'User'}
                                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50 object-cover bg-white"
                                    onError={(e) => {
                                        // Hide the broken image and show the fallback sibling
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling) {
                                            e.currentTarget.nextElementSibling.classList.remove('hidden');
                                        }
                                    }}
                                />
                            ) : null}
                            <div className={`w-8 h-8 rounded-full ring-2 ring-indigo-500/50 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${currentUser?.avatar ? 'hidden' : ''}`}>
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-500 hover:text-red-500"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">Reward Hunter</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>

                        <button className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors relative">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <Link to="/profile">
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser?.name || 'User'}
                                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50 object-cover bg-white"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling) {
                                            e.currentTarget.nextElementSibling.classList.remove('hidden');
                                        }
                                    }}
                                />
                            ) : null}
                            <div className={`w-8 h-8 rounded-full ring-2 ring-indigo-500/50 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${currentUser?.avatar ? 'hidden' : ''}`}>
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-8 px-4 max-w-6xl mx-auto">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                <div className="glass rounded-2xl px-2 py-2 flex items-center justify-around shadow-lg">
                    <NavItem path="/" icon={Home} label="Home" isActive={isActive('/')} />
                    <NavItem path="/ideas" icon={Lightbulb} label="Kaizen" isActive={isActive('/ideas')} />

                    {/* Create Button */}
                    <Link
                        to="/ideas?tab=create"
                        className="relative -top-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105"
                    >
                        <Plus className="w-7 h-7 text-white" />
                    </Link>

                    <NavItem path="/kudos" icon={Heart} label="Kudos" isActive={isActive('/kudos')} />

                    {/* Show Management/Console for special roles, otherwise Profile */}
                    {currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' ? (
                        <NavItem path="/management" icon={Building2} label="Manage" isActive={isActive('/management')} />
                    ) : currentUser?.role === 'SystemAdmin' ? (
                        <NavItem path="/console" icon={Server} label="Console" isActive={isActive('/console')} />
                    ) : (
                        <NavItem path="/profile" icon={User} label="Profile" isActive={isActive('/profile')} />
                    )}
                </div>
            </nav>

            {/* Global Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}

// Mobile Navigation Item
function NavItem({
    path,
    icon: Icon,
    label,
    isActive,
}: {
    path: string;
    icon: typeof Home;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            to={path}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}
