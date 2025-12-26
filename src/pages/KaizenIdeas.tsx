// ============================================
// KAIZEN IDEAS PAGE - LIST & CREATE
// ============================================

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Lightbulb,
    ChevronUp,
    MessageCircle,
    Sparkles,
    Send,
    Loader2,
    Filter,
} from 'lucide-react';
import { KaizenIdea } from '../types';
import { getIdeas, addIdea, toggleVote, getCurrentUser, updateUserPoints, addTransaction } from '../services/storageService';
import { generateRefinedText, isAIAvailable } from '../services/geminiService';
import { IMPACT_TYPES } from '../constants';

type FilterType = 'latest' | 'top' | 'implemented' | 'myteam';

export default function KaizenIdeas() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'browse' | 'create'>(
        searchParams.get('tab') === 'create' ? 'create' : 'browse'
    );
    const [ideas, setIdeas] = useState<KaizenIdea[]>([]);
    const [filter, setFilter] = useState<FilterType>('latest');
    const user = getCurrentUser();

    // Form state
    const [title, setTitle] = useState('');
    const [problem, setProblem] = useState('');
    const [proposal, setProposal] = useState('');
    const [impact, setImpact] = useState<'Cost' | 'Quality' | 'Speed' | 'Safety'>('Speed');
    const [isPolishing, setIsPolishing] = useState<'problem' | 'proposal' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadIdeas();
    }, []);

    const loadIdeas = () => {
        setIdeas(getIdeas());
    };

    const handleTabChange = (tab: 'browse' | 'create') => {
        setActiveTab(tab);
        setSearchParams(tab === 'create' ? { tab: 'create' } : {});
    };

    const handleVote = (ideaId: string) => {
        toggleVote(ideaId, user.id);
        loadIdeas();
    };

    const handlePolish = async (field: 'problem' | 'proposal') => {
        const text = field === 'problem' ? problem : proposal;
        if (!text.trim()) return;

        setIsPolishing(field);
        try {
            const polished = await generateRefinedText(text, 'kaizen');
            if (field === 'problem') {
                setProblem(polished);
            } else {
                setProposal(polished);
            }
        } finally {
            setIsPolishing(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !problem.trim() || !proposal.trim()) return;

        setIsSubmitting(true);

        // Simulate delay
        await new Promise((r) => setTimeout(r, 500));

        const newIdea: KaizenIdea = {
            id: `i_${Date.now()}`,
            title: title.trim(),
            problem: problem.trim(),
            proposal: proposal.trim(),
            impact,
            status: 'New',
            votes: 0,
            votedBy: [],
            author: user,
            teamId: user.teamId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            followers: [],
        };

        addIdea(newIdea);
        updateUserPoints(50);
        addTransaction({
            id: `pt_${Date.now()}`,
            userId: user.id,
            description: 'Submitted Kaizen idea',
            amount: 50,
            type: 'earn',
            source: 'idea_created',
            referenceId: newIdea.id,
            date: new Date().toISOString(),
        });

        // Reset form
        setTitle('');
        setProblem('');
        setProposal('');
        setImpact('Speed');
        setIsSubmitting(false);
        loadIdeas();
        handleTabChange('browse');
    };

    // Filter ideas
    const filteredIdeas = [...ideas]
        .filter((idea) => {
            if (filter === 'implemented') return idea.status === 'Implemented';
            if (filter === 'myteam') return idea.teamId === user.teamId;
            return true;
        })
        .sort((a, b) => {
            if (filter === 'top') return b.votes - a.votes;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Implemented':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Approved':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'In Review':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Rejected':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getImpactIcon = (impactType: string) => {
        const found = IMPACT_TYPES.find((i) => i.name.toLowerCase().includes(impactType.toLowerCase()));
        return found?.icon || '💡';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Kaizen Ideas
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                    Share improvement ideas and help make our workplace better
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 glass rounded-xl">
                <button
                    onClick={() => handleTabChange('browse')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'browse'
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    Browse Ideas
                </button>
                <button
                    onClick={() => handleTabChange('create')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'create'
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    Submit New
                </button>
            </div>

            {/* Browse Ideas Tab */}
            {activeTab === 'browse' && (
                <>
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {(['latest', 'top', 'implemented', 'myteam'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
                                    }`}
                            >
                                {f === 'latest' && 'Latest'}
                                {f === 'top' && 'Top Voted'}
                                {f === 'implemented' && 'Implemented'}
                                {f === 'myteam' && 'My Team'}
                            </button>
                        ))}
                    </div>

                    {/* Ideas List */}
                    <div className="space-y-4">
                        {filteredIdeas.length === 0 ? (
                            <div className="glass-card p-12 text-center">
                                <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                                    No ideas found
                                </h3>
                                <p className="text-slate-400 dark:text-slate-500 mt-1">
                                    Be the first to submit an idea!
                                </p>
                            </div>
                        ) : (
                            filteredIdeas.map((idea) => {
                                const hasVoted = idea.votedBy.includes(user.id);
                                return (
                                    <Link
                                        key={idea.id}
                                        to={`/ideas/${idea.id}`}
                                        className="block glass-card p-5 hover:scale-[1.01] transition-transform"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Impact Icon */}
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg flex-shrink-0">
                                                {getImpactIcon(idea.impact)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                                        {idea.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                                                        {idea.status}
                                                    </span>
                                                </div>

                                                {/* Problem */}
                                                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg mb-2">
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                                        Problem
                                                    </span>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                                        {idea.problem}
                                                    </p>
                                                </div>

                                                {/* Proposal */}
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-3">
                                                    <span className="text-xs font-medium text-indigo-500 block mb-1">
                                                        Proposal
                                                    </span>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                                        {idea.proposal}
                                                    </p>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={idea.author.avatar}
                                                            alt={idea.author.name}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                                            {idea.author.name}
                                                        </span>
                                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                                        <span className="text-sm text-slate-400">
                                                            {new Date(idea.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleVote(idea.id);
                                                            }}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${hasVoted
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                                                                }`}
                                                        >
                                                            <ChevronUp className={`w-4 h-4 ${hasVoted ? 'text-indigo-500' : ''}`} />
                                                            <span className="font-medium">{idea.votes}</span>
                                                        </button>

                                                        <div className="flex items-center gap-1 text-slate-400">
                                                            <MessageCircle className="w-4 h-4" />
                                                            <span className="text-sm">{idea.comments.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* Create Idea Tab */}
            {activeTab === 'create' && (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your idea a clear title..."
                            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Impact Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Impact Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {IMPACT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setImpact(type.name.split(' ')[0] as typeof impact)}
                                    className={`p-3 rounded-xl border-2 transition-all ${impact.toLowerCase().includes(type.id)
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <span className="text-xl block mb-1">{type.icon}</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {type.name.split(' ')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Problem */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Problem *
                            </label>
                            {isAIAvailable() && (
                                <button
                                    type="button"
                                    onClick={() => handlePolish('problem')}
                                    disabled={isPolishing === 'problem' || !problem.trim()}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isPolishing === 'problem' ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3 h-3" />
                                    )}
                                    AI Polish
                                </button>
                            )}
                        </div>
                        <textarea
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Describe the problem or pain point..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            required
                        />
                    </div>

                    {/* Proposal */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Proposal *
                            </label>
                            {isAIAvailable() && (
                                <button
                                    type="button"
                                    onClick={() => handlePolish('proposal')}
                                    disabled={isPolishing === 'proposal' || !proposal.trim()}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isPolishing === 'proposal' ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3 h-3" />
                                    )}
                                    AI Polish
                                </button>
                            )}
                        </div>
                        <textarea
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            placeholder="Describe your proposed solution..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !problem.trim() || !proposal.trim()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Idea (+50 pts)
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
