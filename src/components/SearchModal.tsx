// ============================================
// GLOBAL SEARCH MODAL - Cmd+K
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lightbulb, User, Heart, X } from 'lucide-react';
import { getIdeas, getKudos } from '../services/storageService';
import * as authService from '../services/authService';
import { KaizenIdea, User as UserType, Kudos } from '../types';

interface SearchResult {
    type: 'idea' | 'user' | 'kudos';
    id: string;
    title: string;
    subtitle: string;
    path: string;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const search = useCallback((q: string) => {
        if (!q.trim()) { setResults([]); return; }
        const lower = q.toLowerCase();
        const found: SearchResult[] = [];

        // Search ideas
        const ideas: KaizenIdea[] = getIdeas();
        ideas.filter(i => i.title.toLowerCase().includes(lower) || i.problem.toLowerCase().includes(lower))
            .slice(0, 5)
            .forEach(i => found.push({ type: 'idea', id: i.id, title: i.title, subtitle: `${i.status} • ${i.author.name}`, path: `/ideas/${i.id}` }));

        // Search users
        const users: UserType[] = authService.getAllUsers();
        users.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower))
            .slice(0, 5)
            .forEach(u => found.push({ type: 'user', id: u.id, title: u.name, subtitle: `${u.email} • ${u.team}`, path: '/leaderboard' }));

        // Search kudos
        const kudos: Kudos[] = getKudos();
        kudos.filter(k => k.message.toLowerCase().includes(lower) || k.sender.name.toLowerCase().includes(lower))
            .slice(0, 3)
            .forEach(k => found.push({ type: 'kudos', id: k.id, title: `${k.sender.name} → ${k.receiver.name}`, subtitle: k.message.slice(0, 60), path: '/kudos' }));

        setResults(found);
        setSelectedIndex(0);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => search(query), 150);
        return () => clearTimeout(timer);
    }, [query, search]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && results[selectedIndex]) {
            navigate(results[selectedIndex].path);
            onClose();
        }
        if (e.key === 'Escape') onClose();
    };

    const iconMap = { idea: Lightbulb, user: User, kudos: Heart };
    const colorMap = { idea: 'text-amber-500', user: 'text-indigo-500', kudos: 'text-rose-500' };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search ideas, users, kudos..."
                        className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-lg"
                    />
                    <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded border border-slate-200 dark:border-slate-600">
                        ESC
                    </kbd>
                    <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>

                {/* Results */}
                {results.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {results.map((r, i) => {
                            const Icon = iconMap[r.type];
                            return (
                                <button
                                    key={`${r.type}-${r.id}`}
                                    onClick={() => { navigate(r.path); onClose(); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${colorMap[r.type]} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 dark:text-white truncate">{r.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{r.subtitle}</p>
                                    </div>
                                    <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full capitalize">{r.type}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : query.trim() ? (
                    <div className="p-8 text-center">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">No results for "{query}"</p>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-400 text-sm">
                        Start typing to search across ideas, users, and kudos
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs text-slate-400">
                    <span>↑↓ to navigate</span>
                    <span>↵ to select</span>
                    <span>esc to close</span>
                </div>
            </div>
        </div>
    );
}
