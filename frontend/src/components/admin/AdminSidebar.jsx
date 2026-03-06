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
        <aside className={`bg-slate-200 min-h-screen text-slate-700 flex flex-col fixed left-0 top-0 bottom-0 z-20 transition-all duration-300 overflow-hidden border-r border-slate-300 shadow-lg ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            {/* Logo & Toggle */}
            <div className="p-6 border-b border-slate-300 flex items-center justify-between bg-slate-300/30">
                {sidebarOpen && (
                    <div className="flex items-center gap-3 transition-all duration-300">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <FileText size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-wide whitespace-nowrap text-slate-900">AdminPanel</span>
                    </div>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-indigo-600 border border-slate-400/30 shadow-sm bg-slate-100/50"
                >
                    <ChevronLeft size={20} className={`transition-transform duration-500 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {TABS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        title={!sidebarOpen ? label : ''}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border ${activeTab === id
                            ? 'bg-white text-indigo-700 shadow-lg border-slate-300'
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'
                            }`}
                    >
                        <Icon size={20} className={`flex-shrink-0 ${activeTab === id ? 'text-indigo-600' : 'text-slate-500'}`} />
                        {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-300 bg-slate-300/40 flex flex-col gap-2">
                <Link
                    to="/profile"
                    title={!sidebarOpen ? 'Profil Saya' : ''}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white/50 rounded-xl transition-colors border border-transparent"
                >
                    <User size={20} className="flex-shrink-0 text-slate-500" />
                    {sidebarOpen && <span className="whitespace-nowrap">Profil Saya</span>}
                </Link>
                <button
                    onClick={onLogout}
                    title={!sidebarOpen ? 'Sign Out' : ''}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent"
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
