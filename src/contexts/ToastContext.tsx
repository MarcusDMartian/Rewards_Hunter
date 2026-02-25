// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const iconMap = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    };

    const colorMap = {
        success: 'bg-emerald-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-indigo-500 text-white',
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => {
                    const Icon = iconMap[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-lg ${colorMap[toast.type]} animate-slide-in-right min-w-[280px] max-w-[400px]`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{toast.message}</span>
                            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
