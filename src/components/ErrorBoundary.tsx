// ============================================
// ERROR BOUNDARY - Catches React render errors
// ============================================

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        // Future: send to Sentry/LogRocket
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <AlertTriangle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            An unexpected error occurred. Please try reloading the page.
                        </p>
                        {this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-left">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
