import { Shield, Globe, Settings } from 'lucide-react';
import { ConsoleTabProps, FeatureToggle } from './consoleTypes';

export default function ConsoleSystemTab({ featureToggles, toggleFeature }: ConsoleTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Security Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">2FA Enabled</span><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs">On</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Session Timeout</span><span className="text-slate-800 dark:text-white">30 minutes</span></div>
                        <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-400">Password Policy</span><span className="text-slate-800 dark:text-white">Strong</span></div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Integrations</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><span className="text-slate-700 dark:text-slate-300">SSO (Google)</span><span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full text-xs">Pending</span></div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><span className="text-slate-700 dark:text-slate-300">Slack</span><span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-xs">Not Connected</span></div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><span className="text-slate-700 dark:text-slate-300">Email (SMTP)</span><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs">Connected</span></div>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500" /> Feature Toggles</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(featureToggles).map(([name, enabled]) => (
                        <FeatureToggle key={name} name={name} enabled={enabled} onToggle={() => toggleFeature(name)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
