import { Lightbulb, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { ConsoleTabProps, StatusBadge } from './consoleTypes';

export default function ConsoleIdeasTab({ allIdeas, handleIdeaAction, formatDate }: ConsoleTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Kaizen Ideas Pipeline ({allIdeas.length})</h2>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {allIdeas.length === 0 ? (
                    <div className="p-8 text-center"><Lightbulb className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No ideas submitted yet</p></div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {allIdeas.map((idea) => (
                            <div key={idea.id} className="p-4 hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-slate-800 dark:text-white">{idea.title}</h3>
                                            <StatusBadge status={idea.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{idea.problem}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><img src={idea.author.avatar} alt="" className="w-4 h-4 rounded-full" />{idea.author.name}</span>
                                            <span>{idea.author.team}</span>
                                            <span>{formatDate(idea.createdAt)}</span>
                                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{idea.votes}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleIdeaAction(idea.id, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Approve"><ThumbsUp className="w-4 h-4" /></button>
                                        <button onClick={() => handleIdeaAction(idea.id, 'Rejected')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Reject"><ThumbsDown className="w-4 h-4" /></button>
                                        <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
