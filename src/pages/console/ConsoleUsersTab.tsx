import { Users, Building2, Download } from 'lucide-react';
import { ConsoleTabProps } from './consoleTypes';
import { exportCSV } from '../../utils/csvExport';

export default function ConsoleUsersTab({ allUsers, organizations }: ConsoleTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">All Platform Users ({allUsers.length})</h2>
                <button onClick={() => exportCSV(allUsers.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Team: u.team, Points: u.points, Level: u.level })), 'users')} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {allUsers.length === 0 ? (
                    <div className="p-8 text-center"><Users className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-slate-500 dark:text-slate-400">No users yet</p></div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {allUsers.map((user) => {
                            const org = organizations.find(o => o.id === user.orgId);
                            const roleClass = user.role === 'Superadmin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : user.role === 'Admin' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : user.role === 'Leader' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
                            return (
                                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-slate-800 dark:text-white">{user.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${roleClass}`}>{user.role}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{user.email}</span>
                                                {org && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{org.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.points} pts</p>
                                            <p className="text-xs text-slate-500">Level {user.level}</p>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
