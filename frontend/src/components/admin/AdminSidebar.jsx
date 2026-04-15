import { Link } from 'react-router-dom';
import {
    Home, Users, UsersRound, ClipboardList, Archive,
    ChevronLeft, LogOut, FileText, User
} from 'lucide-react';

const TABS = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'groups', icon: UsersRound, label: 'Groups Management' },
    { id: 'distributions', icon: ClipboardList, label: 'Monitoring Distribusi' },
    { id: 'all_documents', icon: Archive, label: 'Arsip Dokumen' },
];

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout }) => {
    return (
        <aside className={`bg-slate-900 min-h-screen text-slate-100 flex flex-col fixed left-0 top-0 bottom-0 z-20 transition-all duration-300 overflow-hidden border-r border-slate-700 shadow-xl ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            {/* Logo & Toggle */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                {sidebarOpen && (
                    <div className="flex items-center gap-3 transition-all duration-300">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <FileText size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-wide whitespace-nowrap text-white">AdminPanel</span>
                    </div>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-300 hover:text-white border border-slate-600 bg-slate-800"
                    aria-label="Toggle sidebar"
                >
                    <ChevronLeft size={20} className={`transition-transform duration-500 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 mt-2">
                {TABS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        title={!sidebarOpen ? label : ''}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-xl transition-all group border ${
                            activeTab === id
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
                        }`}
                    >
                        <Icon size={20} className={`flex-shrink-0 ${activeTab === id ? 'text-teal-400' : 'text-slate-400'}`} />
                        {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/60 flex flex-col gap-1.5">
                <Link
                    to="/profile"
                    title={!sidebarOpen ? 'Profil Saya' : ''}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-transparent"
                >
                    <User size={20} className="flex-shrink-0 text-slate-400" />
                    {sidebarOpen && <span className="whitespace-nowrap">Profil Saya</span>}
                </Link>
                <button
                    onClick={onLogout}
                    title={!sidebarOpen ? 'Sign Out' : ''}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors border border-transparent"
                    aria-label="Sign Out"
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
