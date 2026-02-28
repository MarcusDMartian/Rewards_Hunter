// ============================================
// MANAGEMENT - SETTINGS TAB
// ============================================

import React, { useState } from 'react';
import { Building2, Target, Save } from 'lucide-react';
import { ManagementTabProps } from './managementTypes';
import api from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

const ManagementSettingsTab: React.FC<ManagementTabProps> = ({ organization }) => {
    const { addToast } = useToast();
    const [orgName, setOrgName] = useState(organization?.name || '');
    const [pointRules, setPointRules] = useState({ idea_created: 50, kudos_sent: 10, kudos_received: 15, daily_login: 5 });
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await api.get('/settings/point-rules');
                if (data) setPointRules(data);
            } catch (err) {
                // Keep default if fail to fetch
                console.warn('Could not load settings point rules', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/settings/point-rules', pointRules);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2000);
            addToast('Settings saved successfully.', 'success');
        } catch (err) {
            console.error('Failed to save settings:', err);
            addToast('Failed to save settings changes.', 'error');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" /> Organization
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Organization Name</label>
                        <input value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full mt-1 px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-500" /> Point Rules (XP per action)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(pointRules).map(([key, value]) => (
                        <div key={key}>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{key.replace(/_/g, ' ')}</label>
                            <input type="number" value={value} onChange={e => setPointRules({ ...pointRules, [key]: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-4 py-2 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white" />
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-medium">
                <Save className="w-5 h-5" />
                {settingsSaved ? 'Saved ✓' : 'Save Settings'}
            </button>
        </div>
    );
};

export default ManagementSettingsTab;
