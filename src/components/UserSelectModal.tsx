// ============================================
// USER SELECT MODAL - SEARCH & SELECT USER
// ============================================

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { getCurrentUser } from '../services/storageService';

interface UserSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (user: User) => void;
    excludeCurrentUser?: boolean;
}

export default function UserSelectModal({
    isOpen,
    onClose,
    onSelect,
    excludeCurrentUser = true,
}: UserSelectModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const currentUser = getCurrentUser();

    // Filter users
    const filteredUsers = MOCK_USERS.filter((user) => {
        if (excludeCurrentUser && user.id === currentUser.id) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.team.toLowerCase().includes(searchLower) ||
            user.position.toLowerCase().includes(searchLower)
        );
    });

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Select a Person
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, team, or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No users found
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        onSelect(user);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors text-left"
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-800 dark:text-white truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {user.position} • {user.team}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
