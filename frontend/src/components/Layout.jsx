import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    FileText,
    Folder,
    Bell,
    LogOut,
    Menu,
    X,
    FolderKanban,
    Users,
    Settings
} from 'lucide-react';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/documents', icon: <FileText size={20} />, label: 'Dokumen' },
        { path: '/folders', icon: <Folder size={20} />, label: 'Folder' },
    ];

    if (isAdmin) {
        navItems.push({ path: '/admin/monitoring', icon: <FolderKanban size={20} />, label: 'Monitoring' });
        navItems.push({ path: '/admin/users', icon: <Users size={20} />, label: 'Pengguna & Grup' });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 min-h-screen shadow-2xl fixed">
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        DOF System
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Digital Office Framework</p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-6 px-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Menu Utama</p>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* User Info & Actions */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-blue-300 truncate capitalize">{user?.role} - {user?.position}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header Navbar */}
                <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center justify-between px-4 sm:px-6 h-16">
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                            >
                                <Menu size={24} />
                            </button>
                            <span className="ml-2 text-lg font-bold text-slate-800">DOF System</span>
                        </div>

                        <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
                            Simulasi Aplikasi Surat & Dokumen
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                                <Bell size={20} />
                                {/* Notification Badge Placeholder */}
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/50 overflow-auto">
                    <div className="mx-auto max-w-7xl animate-fade-in-up">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-xl font-bold text-white">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-800 bg-slate-800/30">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={20} />
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
