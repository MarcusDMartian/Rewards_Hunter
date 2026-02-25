import { Clock, Gift, CheckCircle, XCircle } from 'lucide-react';
import { ConsoleTabProps } from './consoleTypes';

export default function ConsoleRewardsTab({ redemptions, rewards, handleRedemptionAction, formatDate }: ConsoleTabProps) {
    const pendingRedemptions = redemptions.filter(r => r.status === 'Pending');

    return (
        <div className="space-y-6">
            {/* Pending Redemptions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" /> Pending Redemptions ({pendingRedemptions.length})
                </h2>
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                    {pendingRedemptions.length === 0 ? (
                        <div className="p-8 text-center"><Gift className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No pending redemptions</p></div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {pendingRedemptions.map(redemption => (
                                <div key={redemption.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{redemption.rewardName}</p>
                                        <p className="text-sm text-slate-500">{redemption.pointsCost} pts • {formatDate(redemption.requestedAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleRedemptionAction(redemption.id, 'Approved')} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approve</button>
                                        <button onClick={() => handleRedemptionAction(redemption.id, 'Rejected')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"><XCircle className="w-4 h-4" /> Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reward Catalog */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-500" /> Reward Catalog ({rewards.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.length === 0 ? (
                        <p className="text-slate-500 col-span-3 text-center py-8">No rewards in catalog. Create rewards in Management Dashboard.</p>
                    ) : rewards.map(reward => (
                        <div key={reward.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"><Gift className="w-6 h-6 text-white" /></div>
                                <span className={`px-2 py-1 rounded-full text-xs ${reward.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                    {reward.isActive ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">{reward.name}</h3>
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
}
