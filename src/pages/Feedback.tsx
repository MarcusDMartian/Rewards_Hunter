// ============================================
// FEEDBACK PAGE - ANONYMOUS FEEDBACK FORM
// ============================================

import { useState } from 'react';
import {
    ShieldCheck,
    Info,
    Send,
    Loader2,
    CheckCircle,
} from 'lucide-react';

type TargetType = 'company' | 'manager' | 'hr';
type TemplateType = 'start_stop_continue' | 'nps' | 'four_l' | 'open';

export default function Feedback() {
    const [target, setTarget] = useState<TargetType>('company');
    const [template, setTemplate] = useState<TemplateType>('nps');
    const [npsScore, setNpsScore] = useState<number | null>(null);
    const [comments, setComments] = useState('');
    const [startDoing, setStartDoing] = useState('');
    const [stopDoing, setStopDoing] = useState('');
    const [continueDoing, setContinueDoing] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate submission
        await new Promise((r) => setTimeout(r, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset after showing success
        setTimeout(() => {
            setIsSubmitted(false);
            setNpsScore(null);
            setComments('');
            setStartDoing('');
            setStopDoing('');
            setContinueDoing('');
        }, 3000);
    };

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

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Your identity is hidden.</strong> This feedback is encrypted and only
                    aggregated data is shown to leadership. Individual responses cannot be traced back to you.
                </div>
            </div>

            {/* Feedback Form */}
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
                {/* Target */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Who is this feedback for?
                    </label>
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Feedback Template
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { id: 'nps', label: 'NPS Score' },
                            { id: 'start_stop_continue', label: 'Start/Stop' },
                            { id: 'four_l', label: '4L Framework' },
                            { id: 'open', label: 'Open' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTemplate(t.id as TemplateType)}
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            How likely are you to recommend our workplace to a friend?
                        </label>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setNpsScore(score)}
                                    className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${npsScore === score
                                        ? score <= 6
                                            ? 'bg-red-500 text-white'
                                            : score <= 8
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Not Likely</span>
                            <span>Very Likely</span>
                        </div>
                    </div>
                )}

                {/* Start/Stop/Continue Template */}
                {template === 'start_stop_continue' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                                🟢 Start Doing
                            </label>
                            <textarea
                                value={startDoing}
                                onChange={(e) => setStartDoing(e.target.value)}
                                placeholder="What should we start doing?"
                                rows={2}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                                🔴 Stop Doing
                            </label>
                            <textarea
                                value={stopDoing}
                                onChange={(e) => setStopDoing(e.target.value)}
                                placeholder="What should we stop doing?"
                                rows={2}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                                🔵 Continue Doing
                            </label>
                            <textarea
                                value={continueDoing}
                                onChange={(e) => setContinueDoing(e.target.value)}
                                placeholder="What should we continue doing?"
                                rows={2}
                                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Comments (for all templates) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {template === 'open' ? 'Your Feedback' : 'Additional Comments'}
                    </label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={template === 'open' ? 'Share your thoughts...' : 'Any additional thoughts? (optional)'}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Anonymously
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
