// ============================================
// REDEEM MODAL - REWARD REDEMPTION CONFIRMATION
// ============================================

import { useState } from 'react';
import { X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { Reward } from '../types';
import { getCurrentUser, addRedemption } from '../services/storageService';

interface RedeemModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: Reward | null;
    onSuccess: () => void;
}

export default function RedeemModal({
    isOpen,
    onClose,
    reward,
    onSuccess,
}: RedeemModalProps) {
    const [status, setStatus] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
    const [errorMessage, setErrorMessage] = useState('');
    const user = getCurrentUser();

    if (!isOpen || !reward) return null;

    const canAfford = user.points >= reward.cost;
    const inStock = reward.stock > 0;
    const canRedeem = canAfford && inStock;

    const handleRedeem = async () => {
        if (!canRedeem) return;

        setStatus('processing');

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
            // Submit redemption via API (server handles points deduction)
            await addRedemption(reward.id);

            setStatus('success');
            setTimeout(() => {
                onSuccess();
                onClose();
                setStatus('confirm');
            }, 1500);
        } catch {
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={status === 'confirm' ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative glass-card w-full max-w-sm overflow-hidden">
                {/* Close Button */}
                {status === 'confirm' && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}

                {/* Content */}
                <div className="p-6">
                    {status === 'confirm' && (
                        <>
                            {/* Reward Image */}
                            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                                <img
                                    src={reward.image}
                                    alt={reward.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 dark:bg-slate-800/90 text-xs font-medium rounded-full text-slate-700 dark:text-slate-300">
                                    {reward.type}
                                </span>
                            </div>

                            {/* Reward Info */}
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                                {reward.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {reward.description}
                            </p>

                            {/* Cost */}
                            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4">
                                <span className="text-slate-600 dark:text-slate-400">Cost</span>
                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {reward.cost.toLocaleString()} pts
                                </span>
                            </div>

                            {/* Balance */}
                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="text-slate-500 dark:text-slate-400">Your balance</span>
                                <span className={`font-semibold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {user.points.toLocaleString()} pts
                                </span>
                            </div>

                            {/* Warnings */}
                            {!canAfford && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mb-4 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Not enough points. You need {(reward.cost - user.points).toLocaleString()} more.</span>
                                </div>
                            )}

                            {!inStock && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl mb-4 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>This reward is currently out of stock.</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRedeem}
                                    disabled={!canRedeem}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${canRedeem
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Gift className="w-4 h-4" />
                                    Redeem
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'processing' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Processing...
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Please wait while we process your redemption
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Success!
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Your redemption request has been submitted
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Error
                            </h3>
                            <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                            <button
                                onClick={() => setStatus('confirm')}
                                className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
