// ============================================
// REWARDS PAGE - CATALOG & WALLET
// ============================================

import { useState, useEffect } from 'react';
import {
    Gift,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    HelpCircle,
    AlertTriangle,
} from 'lucide-react';
import { Reward, PointTransaction } from '../types';
import { getCurrentUser, getTransactions, getRewards } from '../services/storageService';
import RedeemModal from '../components/RedeemModal';

export default function Rewards() {
    const [user, setUser] = useState(getCurrentUser());
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showHowToEarn, setShowHowToEarn] = useState(false);
    const [rewardsList, setRewardsList] = useState<Reward[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setTransactions(await getTransactions());
            setRewardsList(await getRewards());
        };
        loadData();
    }, []);

    const handleRedeemClick = (reward: Reward) => {
        setSelectedReward(reward);
        setIsModalOpen(true);
    };

    const handleRedeemSuccess = async () => {
        setUser(getCurrentUser());
        setTransactions(await getTransactions());
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Voucher':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'DayOff':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Merch':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Wallet Header */}
            <div className="glass-card overflow-hidden">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium">Your Wallet</span>
                        </div>
                        <button
                            onClick={() => setShowHowToEarn(!showHowToEarn)}
                            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            How to earn?
                        </button>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {user.points.toLocaleString()} <span className="text-lg font-normal text-slate-300">pts</span>
                    </div>
                    <div className="text-sm text-slate-400">
                        Level {user.level} • {(user.nextLevelPoints - user.points).toLocaleString()} pts to next level
                    </div>
                </div>

                {/* How to Earn Panel */}
                {showHowToEarn && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-medium text-slate-800 dark:text-white mb-3">
                            Ways to earn points:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Submit Kaizen idea</span>
                                <span className="font-semibold text-emerald-600">+50</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Idea approved</span>
                                <span className="font-semibold text-emerald-600">+100</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Idea implemented</span>
                                <span className="font-semibold text-emerald-600">+200</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Send kudos</span>
                                <span className="font-semibold text-emerald-600">+10</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Receive kudos</span>
                                <span className="font-semibold text-emerald-600">+20</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Daily missions</span>
                                <span className="font-semibold text-emerald-600">+20-50</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reward Catalog */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Reward Catalog
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewardsList.map((reward) => {
                        const canAfford = user.points >= reward.cost;
                        const isLowStock = reward.stock < 10;

                        return (
                            <div
                                key={reward.id}
                                className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={reward.image}
                                        alt={reward.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {isLowStock && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                            <AlertTriangle className="w-3 h-3" />
                                            Low Stock
                                        </div>
                                    )}
                                    <span className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(reward.type)}`}>
                                        {reward.type}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-1">
                                        {reward.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        {reward.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            {reward.cost.toLocaleString()} pts
                                        </span>
                                        <button
                                            onClick={() => handleRedeemClick(reward)}
                                            disabled={!canAfford}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${canAfford
                                                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transaction History */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Transaction History
                </h2>

                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No transactions yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.slice(0, 10).map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earn'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800'
                                        }`}
                                >
                                    {tx.type === 'earn' ? (
                                        <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-800 dark:text-white truncate">
                                        {tx.description}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div
                                    className={`font-bold ${tx.type === 'earn' ? 'text-emerald-600' : 'text-slate-500'
                                        }`}
                                >
                                    {tx.type === 'earn' ? '+' : ''}{tx.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Redeem Modal */}
            <RedeemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reward={selectedReward}
                onSuccess={handleRedeemSuccess}
            />
        </div>
    );
}
