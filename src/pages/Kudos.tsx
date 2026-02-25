// ============================================
// KUDOS PAGE - WOW WALL & SEND KUDOS
// ============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Heart,
    Sparkles,
    Send,
    Loader2,
    UserPlus,
    ArrowRight,
} from 'lucide-react';
import { Kudos as KudosType, User } from '../types';
import { getKudos, addKudos, toggleKudosLike, getCurrentUser, updateUserPoints, addTransaction } from '../services/storageService';
import { processGameEvent } from '../services/gamificationService';
import { generateRefinedText, isAIAvailable } from '../services/geminiService';
import { CORE_VALUES } from '../constants';
import UserSelectModal from '../components/UserSelectModal';
import Pagination from '../components/Pagination';
import { useToast } from '../contexts/ToastContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Kudos() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'send' ? 'send' : 'wall';
    const [activeTab, setActiveTab] = useState<'wall' | 'send'>(initialTab);
    usePageTitle(activeTab === 'send' ? 'Send Kudos' : 'Kudos Wall');
    const [kudosList, setKudosList] = useState<KudosType[]>([]);
    const [filter, setFilter] = useState<'global' | 'myteam'>('global');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    const user = getCurrentUser();
    const { addToast } = useToast();

    // Form state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [coreValue, setCoreValue] = useState<KudosType['coreValue']>('Kaizen');
    const [message, setMessage] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadKudos();
    }, []);

    const loadKudos = () => {
        setKudosList(getKudos());
    };

    const handleLike = (kudosId: string) => {
        toggleKudosLike(kudosId, user.id);
        loadKudos();
    };

    const handlePolish = async () => {
        if (!message.trim()) return;
        setIsPolishing(true);
        try {
            const polished = await generateRefinedText(message, 'kudos');
            setMessage(polished);
        } finally {
            setIsPolishing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !message.trim()) return;

        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 500));

        const newKudos: KudosType = {
            id: `k_${Date.now()}`,
            sender: user,
            receiver: selectedUser,
            coreValue,
            message: message.trim(),
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
        };

        addKudos(newKudos);

        // Award points
        updateUserPoints(10); // Sender gets points
        addTransaction({
            id: `pt_${Date.now()}`,
            userId: user.id,
            description: `Sent kudos to ${selectedUser.name}`,
            amount: 10,
            type: 'earn',
            source: 'kudos_sent',
            referenceId: newKudos.id,
            date: new Date().toISOString(),
        });

        // Auto-trigger gamification
        processGameEvent('kudos_sent');

        addToast(`❤️ Kudos sent to ${selectedUser.name}! +10 pts`, 'success');

        // Reset form
        setSelectedUser(null);
        setCoreValue('Kaizen');
        setMessage('');
        setIsSubmitting(false);
        loadKudos();
        setActiveTab('wall');
    };

    // Filter and paginate kudos
    const filteredKudos = kudosList.filter((k) => {
        if (filter === 'myteam') {
            return k.sender.teamId === user.teamId || k.receiver.teamId === user.teamId;
        }
        return true;
    });

    const paginatedKudos = filteredKudos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const getCoreValueColor = (value: string) => {
        const found = CORE_VALUES.find((v) => v.name === value);
        return found?.color || 'bg-rose-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Kudos
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                    Recognize your colleagues and celebrate wins together
                </p>
            </div>

            {/* Tab Switcher (Mobile) */}
            <div className="md:hidden flex gap-2 p-1 glass rounded-xl">
                <button
                    onClick={() => setActiveTab('wall')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'wall'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    Wow Wall
                </button>
                <button
                    onClick={() => setActiveTab('send')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'send'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    Send Kudos
                </button>
            </div>

            {/* Desktop: Side by side layout */}
            <div className="md:grid md:grid-cols-3 md:gap-6">
                {/* Send Kudos Form */}
                <div className={`md:col-span-1 ${activeTab === 'send' || 'hidden md:block'}`}>
                    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-rose-500" />
                            Send Kudos
                        </h3>

                        {/* Recipient */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Who to?
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsUserModalOpen(true)}
                                className="w-full flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/60 transition-colors"
                            >
                                {selectedUser ? (
                                    <>
                                        <img
                                            src={selectedUser.avatar}
                                            alt={selectedUser.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="text-left">
                                            <div className="font-medium text-slate-800 dark:text-white">
                                                {selectedUser.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {selectedUser.team}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            <UserPlus className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <span className="text-slate-400">Select a person...</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Core Value */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Core Value
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {CORE_VALUES.map((value) => (
                                    <button
                                        key={value.id}
                                        type="button"
                                        onClick={() => setCoreValue(value.name as KudosType['coreValue'])}
                                        className={`p-3 rounded-xl border-2 transition-all text-left ${coreValue === value.name
                                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${value.color} mb-2`} />
                                        <div className="font-medium text-sm text-slate-800 dark:text-white">
                                            {value.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Message
                                </label>
                                {isAIAvailable() && (
                                    <button
                                        type="button"
                                        onClick={handlePolish}
                                        disabled={isPolishing || !message.trim()}
                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isPolishing ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        AI Polish
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write something nice..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedUser || !message.trim()}
                            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Heart className="w-5 h-5" />
                                    Send Kudos
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Wow Wall */}
                <div className={`md:col-span-2 space-y-4 ${activeTab === 'wall' || 'hidden md:block'}`}>
                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter('global')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'global'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => setFilter('myteam')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'myteam'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            My Team
                        </button>
                    </div>

                    {/* Kudos Feed */}
                    {filteredKudos.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                                No kudos yet
                            </h3>
                            <p className="text-slate-400 mt-1">
                                Be the first to recognize someone!
                            </p>
                        </div>
                    ) : (
                        paginatedKudos.map((kudos) => {
                            const hasLiked = kudos.likedBy.includes(user.id);
                            return (
                                <div key={kudos.id} className="glass-card p-5">
                                    {/* Sender -> Receiver */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={kudos.sender.avatar}
                                            alt={kudos.sender.name}
                                            className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800"
                                        />
                                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                        <img
                                            src={kudos.receiver.avatar}
                                            alt={kudos.receiver.name}
                                            className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800"
                                        />
                                        <div className="flex-1 ml-2">
                                            <div className="text-slate-800 dark:text-white">
                                                <span className="font-semibold">{kudos.sender.name}</span>
                                                <span className="text-slate-400 mx-1">→</span>
                                                <span className="font-semibold">{kudos.receiver.name}</span>
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 ${getCoreValueColor(kudos.coreValue)} text-white text-xs font-medium rounded-full mt-1`}>
                                                {kudos.coreValue}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl mb-4">
                                        <p className="text-slate-700 dark:text-slate-300 italic">
                                            "{kudos.message}"
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">
                                            {new Date(kudos.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleLike(kudos.id)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${hasLiked
                                                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                                            <span className="font-medium">{kudos.likes}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <Pagination currentPage={page} totalItems={filteredKudos.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
                </div>
            </div>

            {/* User Select Modal */}
            <UserSelectModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSelect={setSelectedUser}
            />
        </div>
    );
}
