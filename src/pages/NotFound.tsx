// ============================================
// NOT FOUND (404) PAGE
// ============================================

import { useNavigate } from 'react-router-dom';
import { Home, MapPin } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <MapPin className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Page Not Found
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                    <Home className="w-5 h-5" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}
