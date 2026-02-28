// ============================================
// MANAGEMENT - BADGES TAB
// ============================================

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import { ManagementTabProps } from './managementTypes';
import * as storageService from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';

const ManagementBadgesTab: React.FC<ManagementTabProps> = ({ badges, setBadges }) => {
    const { addToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [newBadge, setNewBadge] = useState({ name: '', icon: '🏆', color: 'bg-indigo-100' });

    const handleCreate = async () => {
        if (!newBadge.name.trim()) return;

        try {
            const added = await storageService.addBadge(newBadge);
            setBadges([...badges, { ...added, unlocked: false }]);
            setNewBadge({ name: '', icon: '🏆', color: 'bg-indigo-100' });
            setShowForm(false);
            addToast('Badge created successfully!', 'success');
        } catch (err) {
            console.error('Failed to create badge', err);
            addToast('Failed to create badge. Check the network connection.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Badges ({badges.length})</h2>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all text-sm font-medium">
                    <Plus className="w-4 h-4" /> New Badge
                </button>
            </div>

            {showForm && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Create Badge</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <input value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })} placeholder="Badge name" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        <input value={newBadge.icon} onChange={e => setNewBadge({ ...newBadge, icon: e.target.value })} placeholder="Icon emoji" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        <select value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                            <option value="bg-indigo-100">Indigo</option>
                            <option value="bg-purple-100">Purple</option>
                            <option value="bg-amber-100">Amber</option>
                            <option value="bg-emerald-100">Emerald</option>
                            <option value="bg-rose-100">Rose</option>
                            <option value="bg-blue-100">Blue</option>
                        </select>
                    </div>
                    <button onClick={handleCreate} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                        Create
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, idx) => (
                    <div key={idx} className={`${badge.color} dark:bg-slate-800/60 rounded-2xl p-4 text-center border border-white/20 dark:border-slate-700/50 ${!badge.unlocked ? 'opacity-60' : ''}`}>
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{badge.name}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${badge.unlocked ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {badge.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagementBadgesTab;
