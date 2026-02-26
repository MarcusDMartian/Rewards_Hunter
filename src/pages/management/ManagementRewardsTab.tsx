// ============================================
// MANAGEMENT - REWARDS TAB
// ============================================

import React, { useState } from 'react';
import { Gift, Clock, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Reward, RedemptionRequest } from '../../types';
import { ManagementTabProps } from './managementTypes';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const ManagementRewardsTab: React.FC<ManagementTabProps> = ({ rewards, setRewards, redemptions, setRedemptions }) => {
    const [showForm, setShowForm] = useState(false);
    const [newReward, setNewReward] = useState({ name: '', description: '', cost: 100, type: 'Voucher' as 'Voucher' | 'DayOff' | 'Merch', stock: 10 });

    const handleCreateReward = () => {
        if (!newReward.name.trim()) return;
        const r: Reward = { id: `rw_${Date.now()}`, ...newReward, image: '', isActive: true };
        const updated = [...rewards, r];
        setRewards(updated);
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(updated));
        setNewReward({ name: '', description: '', cost: 100, type: 'Voucher', stock: 10 });
        setShowForm(false);
    };

    const handleDeleteReward = (rewardId: string) => {
        const updated = rewards.filter(r => r.id !== rewardId);
        setRewards(updated);
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(updated));
    };

    const handleRedemptionAction = (redId: string, status: 'Approved' | 'Rejected') => {
        const updated = redemptions.map(red =>
            red.id === redId
                ? { ...red, status: status as RedemptionRequest['status'], processedAt: new Date().toISOString() }
                : red
        );
        setRedemptions(updated);
        // TODO: API call to process redemption on backend
    };

    return (
        <div className="space-y-6">
            {/* Pending Redemptions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pending Redemptions ({redemptions.filter(r => r.status === 'Pending').length})
                </h2>
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                    {redemptions.filter(r => r.status === 'Pending').length === 0 ? (
                        <div className="p-8 text-center"><Gift className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No pending redemptions</p></div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {redemptions.filter(r => r.status === 'Pending').map(r => (
                                <div key={r.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{r.rewardName}</p>
                                        <p className="text-sm text-slate-500">{r.pointsCost} pts • {new Date(r.requestedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleRedemptionAction(r.id, 'Approved')} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button onClick={() => handleRedemptionAction(r.id, 'Rejected')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reward Catalog */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-500" /> Reward Catalog ({rewards.length})
                    </h2>
                    <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all text-sm font-medium">
                        <Plus className="w-4 h-4" /> Add Reward
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 space-y-4 mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Add Reward</h3>
                        <input value={newReward.name} onChange={e => setNewReward({ ...newReward, name: e.target.value })} placeholder="Reward name" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        <input value={newReward.description} onChange={e => setNewReward({ ...newReward, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        <div className="grid grid-cols-3 gap-4">
                            <input type="number" value={newReward.cost} onChange={e => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 100 })} placeholder="Cost (pts)" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                            <select value={newReward.type} onChange={e => setNewReward({ ...newReward, type: e.target.value as 'Voucher' | 'DayOff' | 'Merch' })} className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
                                <option value="Voucher">Voucher</option>
                                <option value="DayOff">Day Off</option>
                                <option value="Merch">Merchandise</option>
                            </select>
                            <input type="number" value={newReward.stock} onChange={e => setNewReward({ ...newReward, stock: parseInt(e.target.value) || 1 })} placeholder="Stock" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        </div>
                        <button onClick={handleCreateReward} className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium">
                            Create
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map(reward => (
                        <div key={reward.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`px-2 py-1 rounded-full text-xs ${reward.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {reward.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                    <button onClick={() => handleDeleteReward(reward.id)} className="p-1 text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">{reward.name}</h3>
                            {reward.description && <p className="text-sm text-slate-500 mt-1">{reward.description}</p>}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-amber-500 font-bold">{reward.cost} pts</span>
                                <span className="text-sm text-slate-500">Stock: {reward.stock}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManagementRewardsTab;
