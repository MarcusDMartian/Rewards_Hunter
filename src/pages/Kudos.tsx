// ============================================
// KUDOS PAGE - WOW WALL & SEND KUDOS
// ============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Heart,
    Send,
    Loader2,
    UserPlus,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import { Kudos as KudosType, User, KudosQuota } from '../types';
import {
    getKudos,
    addKudos,
    toggleKudosLike,
    getCurrentUser,
    getKudosQuota,
} from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { CORE_VALUES } from '../constants';

import api from '../services/apiClient';
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
    const { refreshAuth } = useAuth();

    // Quota
    const [quota, setQuota] = useState<KudosQuota>({ used: 0, limit: 7, remaining: 7 });

    // Form state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [coreValue, setCoreValue] = useState<string>(CORE_VALUES[0]?.label ?? 'Kaizen');
    const [message, setMessage] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Core values from API (fallback to constant)
    const [coreValuesList, setCoreValuesList] = useState<
        { id: string; name: string; color: string; description: string }[]
    >([]);

    useEffect(() => {
        loadKudos();
        loadCoreValues();
        loadQuota();
    }, []);

    const loadQuota = async () => {
        const q = await getKudosQuota();
        setQuota(q);
    };

    const loadCoreValues = async () => {
        try {
            const { data } = await api.get('/settings/core-values');
            if (data && Array.isArray(data) && data.length > 0) {
                setCoreValuesList(data);
                setCoreValue(data[0].name);
            } else {
                // Fallback: use CORE_VALUES constant
                const fallback = CORE_VALUES.map((cv) => ({
                    id: cv.key,
                    name: cv.label,
                    color: cv.color,
                    description: cv.label,
                }));
                setCoreValuesList(fallback);
                setCoreValue(fallback[0]?.name ?? 'Kaizen');
            }
        } catch {
            const fallback = CORE_VALUES.map((cv) => ({
                id: cv.key,
                name: cv.label,
                color: cv.color,
                description: cv.label,
            }));
            setCoreValuesList(fallback);
            setCoreValue(fallback[0]?.name ?? 'Kaizen');
        }
    };

    const loadKudos = async () => {
        const data = await getKudos();
        setKudosList(data);
    };

    const handleLike = async (kudosId: string) => {
        await toggleKudosLike(kudosId, user.id);
        loadKudos();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !message.trim()) return;
        if (quota.remaining <= 0) {
            addToast('Weekly kudos limit reached (7/week)', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addKudos({
                receiverId: selectedUser.id,
                coreValue,
                message: message.trim(),
            });
            await refreshAuth();
            await loadQuota();

            addToast(`Kudos sent to ${selectedUser.name}! +10 pts`, 'success');

            // Reset form
            setSelectedUser(null);
            setCoreValue(coreValuesList[0]?.name ?? 'Kaizen');
            setMessage('');
            setIsSubmitting(false);
            loadKudos();
            setActiveTab('wall');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Failed to send kudos';
            addToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter and paginate kudos
    const filteredKudos = kudosList.filter((k) => {
        if (filter === 'myteam') {
            return k.sender.teamId === user.teamId || k.receiver.teamId === user.teamId;
        }
        return true;
    });

    const paginatedKudos = filteredKudos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const getCoreValueHex = (value: string) => {
        const found = coreValuesList.find((v) => v.name === value);
        if (found?.color?.startsWith('#')) return found.color;
        const cv = CORE_VALUES.find((c) => c.label === value || c.key === value);
        return cv?.color ?? '#6366f1';
    };

    const quotaPercent = quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0;
    const quotaColorClass = quota.remaining === 0
        ? 'bg-red-500'
        : quota.remaining <= 2
            ? 'bg-amber-500'
            : 'bg-emerald-500';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kudos</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Recognize your colleagues and celebrate wins together
                            </p>
                        </div>
                    </div>

                    {/* Weekly Quota Badge */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weekly quota</span>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {Array.from({ length: quota.limit }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${i < quota.used ? 'bg-rose-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${quotaColorClass}`}>
                                {quota.remaining}/{quota.limit}
                            </span>
                        </div>
                    </div>
                </div>
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Send className="w-5 h-5 text-rose-500" />
                                Send Kudos
                            </h3>

                            {/* Quota in form */}
                            {quota.remaining === 0 && (
                                <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Limit reached
                                </div>
                            )}
                        </div>

                        {/* Quota progress */}
                        <div>
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Weekly kudos</span>
                                <span className="font-medium">{quota.used}/{quota.limit} used</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${quotaColorClass}`}
                                    style={{ width: `${quotaPercent}%` }}
                                />
                            </div>
                        </div>

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
                                        {selectedUser.avatar ? (
                                            <img
                                                src={selectedUser.avatar}
                                                alt={selectedUser.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {selectedUser.name?.[0]}
                                            </div>
                                        )}
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
                                {coreValuesList.length === 0 ? (
                                    <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400 py-2">
                                        Loading core values...
                                    </div>
                                ) : (
                                    coreValuesList.map((value) => {
                                        const isHex = value.color?.startsWith('#');
                                        return (
                                            <button
                                                key={value.id}
                                                type="button"
                                                onClick={() => setCoreValue(value.name)}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${coreValue === value.name
                                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div
                                                    className="w-6 h-6 rounded-full mb-2"
                                                    style={isHex ? { backgroundColor: value.color } : undefined}
                                                />
                                                <div className="font-medium text-sm text-slate-800 dark:text-white">
                                                    {value.name}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Message
                            </label>
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
                            disabled={isSubmitting || !selectedUser || !message.trim() || quota.remaining <= 0}
                            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Heart className="w-5 h-5" />
                                    {quota.remaining <= 0 ? 'No kudos remaining' : 'Send Kudos'}
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
                            onClick={() => { setFilter('global'); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'global'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => { setFilter('myteam'); setPage(1); }}
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
                            const valueHex = getCoreValueHex(kudos.coreValue);
                            return (
                                <div key={kudos.id} className="glass-card p-5">
                                    {/* Sender -> Receiver */}
                                    <div className="flex items-center gap-3 mb-4">
                                        {kudos.sender.avatar ? (
                                            <img
                                                src={kudos.sender.avatar}
                                                alt={kudos.sender.name}
                                                className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {kudos.sender.name?.[0]}
                                            </div>
                                        )}
                                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                                        {kudos.receiver.avatar ? (
                                            <img
                                                src={kudos.receiver.avatar}
                                                alt={kudos.receiver.name}
                                                className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                                                {kudos.receiver.name?.[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 ml-2 min-w-0">
                                            <div className="text-slate-800 dark:text-white truncate">
                                                <span className="font-semibold">{kudos.sender.name}</span>
                                                <span className="text-slate-400 mx-1">→</span>
                                                <span className="font-semibold">{kudos.receiver.name}</span>
                                            </div>
                                            <span
                                                className="inline-block px-2 py-0.5 text-white text-xs font-medium rounded-full mt-1"
                                                style={{ backgroundColor: valueHex }}
                                            >
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

                    <Pagination
                        currentPage={page}
                        totalItems={filteredKudos.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setPage}
                    />
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
