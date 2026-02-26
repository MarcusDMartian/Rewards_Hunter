// ============================================
// MANAGEMENT - MEMBERS TAB
// ============================================

import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { ManagementTabProps } from './managementTypes';

const ManagementMembersTab: React.FC<ManagementTabProps> = ({ members }) => {
    return (
        <div className="space-y-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {members.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-500 dark:text-slate-400">No members yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {members.map((member) => {
                            const roleClass = member.role === 'Superadmin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : member.role === 'Admin'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                            return (
                                <div
                                    key={member.id}
                                    className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-slate-800 dark:text-white">{member.name}</h3>
                                                {member.role !== 'Member' && (
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${roleClass}`}>
                                                        {member.role}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.points} pts</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">Level {member.level}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagementMembersTab;
