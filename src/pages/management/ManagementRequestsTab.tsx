// ============================================
// MANAGEMENT - REQUESTS TAB
// ============================================

import React from 'react';
import { UserPlus, Mail, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ManagementTabProps } from './managementTypes';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const ManagementRequestsTab: React.FC<ManagementTabProps> = ({ joinRequests, onApprove, onReject, actionLoading }) => {
    const pendingRequests = joinRequests.filter(r => r.status === 'PENDING');
    const processedRequests = joinRequests.filter(r => r.status !== 'PENDING');

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pending Requests ({pendingRequests.length})
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 dark:border-slate-700/50">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">No pending requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {request.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">{request.name}</h3>
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                                <Mail className="w-3 h-3" />
                                                <span>{request.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mt-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Requested {formatDate(request.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onReject(request.id)}
                                            disabled={actionLoading === request.id}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                                            title="Reject"
                                        >
                                            {actionLoading === request.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <XCircle className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onApprove(request.id)}
                                            disabled={actionLoading === request.id}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading === request.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Approve</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        Request History
                    </h2>
                    <div className="space-y-2">
                        {processedRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 border border-white/10 dark:border-slate-700/30 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
                                        {request.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{request.name}</p>
                                        <p className="text-slate-500 dark:text-slate-500 text-xs">{request.email}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'APPROVED'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    }`}>
                                    {request.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementRequestsTab;
