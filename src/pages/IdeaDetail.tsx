// ============================================
// IDEA DETAIL PAGE - VIEW SINGLE IDEA
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronUp,
    MessageCircle,
    Bookmark,
    BookmarkCheck,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { KaizenIdea } from '../types';
import { getIdeaById, toggleVote, toggleFollow, addComment, getCurrentUser } from '../services/storageService';

export default function IdeaDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<KaizenIdea | null>(null);
    const [commentText, setCommentText] = useState('');
    const user = getCurrentUser();

    useEffect(() => {
        loadIdea();
    }, [id]);

    const loadIdea = async () => {
        const found = await getIdeaById(id || '');
        setIdea(found || null);
    };

    if (!idea) {
        return (
            <div className="glass-card p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                    Idea not found
                </h3>
                <Link
                    to="/ideas"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-500 hover:text-indigo-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Ideas
                </Link>
            </div>
        );
    }

    const hasVoted = idea.votedBy.includes(user.id);
    const isFollowing = idea.followers.includes(user.id);

    const handleVote = async () => {
        await toggleVote(idea.id, user.id);
        loadIdea();
    };

    const handleFollow = async () => {
        await toggleFollow(idea.id, user.id);
        loadIdea();
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        await addComment(idea.id, { text: commentText.trim() });
        setCommentText('');
        loadIdea();
    };


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

    const statuses = ['New', 'In Review', 'Approved', 'Implemented'];
    const currentStatusIndex = statuses.indexOf(idea.status);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            {/* Main Card */}
            <div className="glass-card p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={idea.author.avatar}
                            alt={idea.author.name}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <div className="font-medium text-slate-800 dark:text-white">
                                {idea.author.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {idea.author.team} • {new Date(idea.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(idea.status)}`}>
                        {idea.status}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                    {idea.title}
                </h1>

                {/* Impact Badge */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full">
                        {idea.impact}
                    </span>
                </div>

                {/* Problem */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Problem
                    </h3>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-slate-700 dark:text-slate-300">{idea.problem}</p>
                    </div>
                </div>

                {/* Proposal */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Proposal
                    </h3>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <p className="text-slate-700 dark:text-slate-300">{idea.proposal}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleVote}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${hasVoted
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <ChevronUp className={`w-5 h-5 ${hasVoted ? 'text-indigo-500' : ''}`} />
                        <span>{idea.votes}</span>
                    </button>

                    <button
                        onClick={handleFollow}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isFollowing
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {isFollowing ? (
                            <BookmarkCheck className="w-5 h-5" />
                        ) : (
                            <Bookmark className="w-5 h-5" />
                        )}
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400">
                        <MessageCircle className="w-5 h-5" />
                        <span>{idea.comments.length}</span>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
                    Status Timeline
                </h3>
                <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                    {statuses.map((status, index) => {
                        const isComplete = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                            <div key={status} className="relative flex items-center gap-4 py-3">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isComplete
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}
                                >
                                    {isComplete ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                </div>
                                <div className={`${isCurrent ? 'font-semibold' : ''} ${isComplete ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                                    {status}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Comments Section */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments ({idea.comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {/* Comments List */}
                {idea.comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {idea.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <img
                                    src={comment.userAvatar}
                                    alt={comment.userName}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {comment.userName}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
