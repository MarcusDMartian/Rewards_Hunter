// ============================================
// SETTINGS PAGE
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings as SettingsIcon,
    Moon,
    Sun,
    Globe,
    Trash2,
    AlertTriangle,
    Check,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { resetAllData } from '../services/storageService';

export default function Settings() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState('en');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const navigate = useNavigate();

    const handleReset = async () => {
        setIsResetting(true);
        await new Promise((r) => setTimeout(r, 1000));
        resetAllData();
        setIsResetting(false);
        setShowResetConfirm(false);
        navigate('/');
        window.location.reload();
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Settings
                    </h1>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
                    Appearance
                </h2>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        {isDark ? (
                            <Moon className="w-5 h-5 text-indigo-500" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                        )}
                        <div>
                            <div className="font-medium text-slate-800 dark:text-white">
                                Dark Mode
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {isDark ? 'Currently enabled' : 'Currently disabled'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-indigo-500' : 'bg-slate-300'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-8' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Language */}
            <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language
                </h2>

                <div className="space-y-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${language === lang.code
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500'
                                    : 'bg-white/50 dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium text-slate-800 dark:text-white">
                                    {lang.name}
                                </span>
                            </div>
                            {language === lang.code && (
                                <Check className="w-5 h-5 text-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                    Language switching will be available in a future update.
                </p>
            </div>

            {/* Data Management */}
            <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
                    Data Management
                </h2>

                <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                    <div className="text-left">
                        <div className="font-medium">Reset All Data</div>
                        <div className="text-sm opacity-75">
                            Clear all local data and start fresh
                        </div>
                    </div>
                </button>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowResetConfirm(false)}
                    />
                    <div className="relative glass-card w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                    Reset All Data?
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            All your ideas, kudos, transactions, and progress will be permanently deleted.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isResetting}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isResetting ? 'Resetting...' : 'Reset Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
