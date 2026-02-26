// ============================================
// MANAGEMENT - MISSIONS TAB
// ============================================

import React, { useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { Mission } from '../../types';
import { ManagementTabProps } from './managementTypes';

const ManagementMissionsTab: React.FC<ManagementTabProps> = ({ missions, setMissions }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMission, setNewMission] = useState({ title: '', type: 'daily' as 'daily' | 'weekly', total: 1, reward: 10 });

    const handleCreate = () => {
        if (!newMission.title.trim()) return;
        const m: Mission = {
            id: `m_${Date.now()}`,
            title: newMission.title,
            description: '',
            progress: 0,
            total: newMission.total,
            reward: newMission.reward,
            completed: false,
            claimed: false,
            type: newMission.type,
        };
        const updated = [...missions, m];
        setMissions(updated);
        // TODO: API call to create mission on backend
        setNewMission({ title: '', type: 'daily', total: 1, reward: 10 });
        setShowForm(false);
    };

    const handleDelete = (missionId: string) => {
        const updated = missions.filter(m => m.id !== missionId);
        setMissions(updated);
        // TODO: API call to delete mission on backend
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Missions ({missions.length})</h2>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium">
                    <Plus className="w-4 h-4" /> New Mission
                </button>
            </div>

            {showForm && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Create Mission</h3>
                    <input value={newMission.title} onChange={e => setNewMission({ ...newMission, title: e.target.value })} placeholder="Mission title" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                    <div className="grid grid-cols-3 gap-4">
                        <select value={newMission.type} onChange={e => setNewMission({ ...newMission, type: e.target.value as 'daily' | 'weekly' })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <input type="number" value={newMission.total} onChange={e => setNewMission({ ...newMission, total: parseInt(e.target.value) || 1 })} placeholder="Target count" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        <input type="number" value={newMission.reward} onChange={e => setNewMission({ ...newMission, reward: parseInt(e.target.value) || 10 })} placeholder="XP reward" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                    </div>
                    <button onClick={handleCreate} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                        Create
                    </button>
                </div>
            )}

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {missions.length === 0 ? (
                    <div className="p-8 text-center"><Target className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No missions created yet</p></div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {missions.map(mission => (
                            <div key={mission.id} className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mission.completed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                        <Target className={`w-5 h-5 ${mission.completed ? 'text-emerald-500' : 'text-indigo-500'}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{mission.title}</p>
                                        <p className="text-xs text-slate-500">{mission.type} • {mission.progress}/{mission.total} • {mission.reward} XP</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(mission.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagementMissionsTab;
