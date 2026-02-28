// ============================================
// FEEDBACK PAGE - ANONYMOUS FEEDBACK FORM (Enhanced)
// ============================================

import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Info,
    Send,
    Loader2,
    CheckCircle,
    History,
    BarChart3,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/apiClient';

type TargetType = 'company' | 'manager' | 'hr';
type TemplateType = 'start_stop_continue' | 'nps' | 'four_l' | 'open';
type ActiveTab = 'submit' | 'history' | 'summary';

interface FeedbackEntry {
    id: string;
    target: TargetType;
    template: TemplateType;
    npsScore?: number | null;
    comments: string;
    startDoing?: string;
    stopDoing?: string;
    continueDoing?: string;
    liked?: string;
    learned?: string;
    lacked?: string;
    longedFor?: string;
    submittedAt: string;
}

const FEEDBACK_API_ENDPOINT = '/feedback';

async function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'submittedAt'>) {
    const { data } = await api.post(FEEDBACK_API_ENDPOINT, entry);
    return data;
}

async function getFeedbackHistory(): Promise<FeedbackEntry[]> {
    try {
        const { data } = await api.get(FEEDBACK_API_ENDPOINT);
        return data;
    } catch {
        return [];
    }
}

export default function Feedback() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('submit');
    const [target, setTarget] = useState<TargetType>('company');
    const [template, setTemplate] = useState<TemplateType>('nps');
    const [npsScore, setNpsScore] = useState<number | null>(null);
    const [comments, setComments] = useState('');
    const [startDoing, setStartDoing] = useState('');
    const [stopDoing, setStopDoing] = useState('');
    const [continueDoing, setContinueDoing] = useState('');
    const [liked, setLiked] = useState('');
    const [learned, setLearned] = useState('');
    const [lacked, setLacked] = useState('');
    const [longedFor, setLongedFor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [history, setHistory] = useState<FeedbackEntry[]>([]);
    const { addToast } = useToast();
    const { currentUser } = useAuth();

    const isAdminOrHR = currentUser?.role === 'Admin' || currentUser?.role === 'Superadmin' || currentUser?.role === 'SystemAdmin';

    const loadHistory = async () => {
        setHistory(await getFeedbackHistory());
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise((r) => setTimeout(r, 1000));

        const newEntry = {
            target,
            template,
            npsScore: template === 'nps' ? npsScore : undefined,
            comments,
            startDoing: template === 'start_stop_continue' ? startDoing : undefined,
            stopDoing: template === 'start_stop_continue' ? stopDoing : undefined,
            continueDoing: template === 'start_stop_continue' ? continueDoing : undefined,
            liked: template === 'four_l' ? liked : undefined,
            learned: template === 'four_l' ? learned : undefined,
            lacked: template === 'four_l' ? lacked : undefined,
            longedFor: template === 'four_l' ? longedFor : undefined,
        };

        try {
            await saveFeedback(newEntry);
            await loadHistory();
            setIsSubmitted(true);
            addToast('🛡️ Feedback submitted anonymously!', 'success');
        } catch {
            addToast('Failed to submit feedback', 'error');
        } finally {
            setIsSubmitting(false);
        }

        setTimeout(() => {
            setIsSubmitted(false);
            setNpsScore(null);
            setComments('');
            setStartDoing('');
            setStopDoing('');
            setContinueDoing('');
            setLiked('');
            setLearned('');
            setLacked('');
            setLongedFor('');
        }, 3000);
    };

    // Summary calculations for admin
    const allFeedback = history;
    const npsEntries = allFeedback.filter(f => f.template === 'nps' && f.npsScore != null);
    const avgNps = npsEntries.length > 0 ? (npsEntries.reduce((s, f) => s + (f.npsScore || 0), 0) / npsEntries.length).toFixed(1) : 'N/A';
    const promoters = npsEntries.filter(f => (f.npsScore || 0) >= 9).length;
    const detractors = npsEntries.filter(f => (f.npsScore || 0) <= 6).length;
    const npsNetScore = npsEntries.length > 0 ? Math.round(((promoters - detractors) / npsEntries.length) * 100) : 0;

    if (isSubmitted) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Feedback Submitted!
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Thank you for your feedback. Your identity remains anonymous.
                </p>
            </div>
        );
    }

    const tabs: { id: ActiveTab; label: string; icon: typeof Send }[] = [
        { id: 'submit', label: 'Submit', icon: Send },
        { id: 'history', label: 'History', icon: History },
        ...(isAdminOrHR ? [{ id: 'summary' as ActiveTab, label: 'Summary', icon: BarChart3 }] : []),
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Anonymous Feedback
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                    Your voice matters. Help us improve without revealing your identity.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 glass rounded-xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Submit Tab */}
            {activeTab === 'submit' && (
                <>
                    {/* Privacy Notice */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Your identity is hidden.</strong> This feedback is encrypted and only
                            aggregated data is shown to leadership.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
                        {/* Target */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Who is this feedback for?</label>
                            <select
                                value={target}
                                onChange={(e) => setTarget(e.target.value as TargetType)}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="company">Company General</option>
                                <option value="manager">My Direct Manager</option>
                                <option value="hr">HR Team</option>
                            </select>
                        </div>

                        {/* Template Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Feedback Template</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { id: 'nps', label: '📊 NPS Score' },
                                    { id: 'start_stop_continue', label: '🚦 Start/Stop' },
                                    { id: 'four_l', label: '4️⃣ Four L' },
                                    { id: 'open', label: '💬 Open' },
                                ].map((t) => (
                                    <button key={t.id} type="button" onClick={() => setTemplate(t.id as TemplateType)}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${template === t.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NPS Template */}
                        {template === 'nps' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">How likely are you to recommend?</label>
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                        <button key={score} type="button" onClick={() => setNpsScore(score)}
                                            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${npsScore === score
                                                ? score <= 6 ? 'bg-red-500 text-white' : score <= 8 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >{score}</button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-slate-400"><span>Not Likely</span><span>Very Likely</span></div>
                            </div>
                        )}

                        {/* Start/Stop/Continue Template */}
                        {template === 'start_stop_continue' && (
                            <div className="space-y-4">
                                {[
                                    { label: '🟢 Start Doing', value: startDoing, setter: setStartDoing, ring: 'focus:ring-emerald-500' },
                                    { label: '🔴 Stop Doing', value: stopDoing, setter: setStopDoing, ring: 'focus:ring-red-500' },
                                    { label: '🔵 Continue Doing', value: continueDoing, setter: setContinueDoing, ring: 'focus:ring-blue-500' },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                                        <textarea value={field.value} onChange={(e) => field.setter(e.target.value)}
                                            placeholder={`What should we ${field.label.split(' ').slice(1).join(' ').toLowerCase()}?`}
                                            rows={2}
                                            className={`w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${field.ring} resize-none`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Four L Template */}
                        {template === 'four_l' && (
                            <div className="space-y-4">
                                {[
                                    { label: '💚 Liked', placeholder: 'What did you like?', value: liked, setter: setLiked, color: 'focus:ring-emerald-500' },
                                    { label: '📚 Learned', placeholder: 'What did you learn?', value: learned, setter: setLearned, color: 'focus:ring-blue-500' },
                                    { label: '❌ Lacked', placeholder: 'What was lacking?', value: lacked, setter: setLacked, color: 'focus:ring-amber-500' },
                                    { label: '🌟 Longed For', placeholder: 'What do you long for?', value: longedFor, setter: setLongedFor, color: 'focus:ring-purple-500' },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                                        <textarea value={field.value} onChange={(e) => field.setter(e.target.value)}
                                            placeholder={field.placeholder} rows={2}
                                            className={`w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${field.color} resize-none`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comments */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {template === 'open' ? 'Your Feedback' : 'Additional Comments'}
                            </label>
                            <textarea value={comments} onChange={(e) => setComments(e.target.value)}
                                placeholder={template === 'open' ? 'Share your thoughts...' : 'Any additional thoughts? (optional)'}
                                rows={4}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isSubmitting}
                            className="w-full px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Anonymously</>}
                        </button>
                    </form>
                </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No feedback submitted yet</h3>
                        </div>
                    ) : (
                        history.map((entry) => (
                            <div key={entry.id} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full capitalize">{entry.target}</span>
                                        <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">{entry.template.replace(/_/g, ' ')}</span>
                                        {entry.npsScore != null && (
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${entry.npsScore >= 9 ? 'bg-emerald-100 text-emerald-600' : entry.npsScore >= 7 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                                NPS: {entry.npsScore}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(entry.submittedAt).toLocaleDateString()}</span>
                                </div>
                                {entry.comments && <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{entry.comments}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Summary Tab (Admin/HR only) */}
            {activeTab === 'summary' && isAdminOrHR && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 text-center">
                            <p className="text-3xl font-bold text-slate-800 dark:text-white">{allFeedback.length}</p>
                            <p className="text-xs text-slate-500">Total Feedback</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <p className="text-3xl font-bold text-slate-800 dark:text-white">{avgNps}</p>
                            <p className="text-xs text-slate-500">Avg NPS Score</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <p className={`text-3xl font-bold ${npsNetScore > 0 ? 'text-emerald-500' : npsNetScore < 0 ? 'text-red-500' : 'text-slate-500'}`}>{npsNetScore}</p>
                            <p className="text-xs text-slate-500">NPS Net Score</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <p className="text-3xl font-bold text-slate-800 dark:text-white">{npsEntries.length}</p>
                            <p className="text-xs text-slate-500">NPS Responses</p>
                        </div>
                    </div>

                    {/* By Target breakdown */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Feedback by Target</h3>
                        <div className="space-y-3">
                            {(['company', 'manager', 'hr'] as TargetType[]).map((t) => {
                                const count = allFeedback.filter(f => f.target === t).length;
                                const pct = allFeedback.length > 0 ? Math.round((count / allFeedback.length) * 100) : 0;
                                return (
                                    <div key={t} className="flex items-center gap-3">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 w-24 capitalize">{t}</span>
                                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-16 text-right">{count} ({pct}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
