import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
    FileText, FileSignature, Plus, ChevronDown,
    LayoutDashboard, Bell, LogOut, User
} from 'lucide-react';
import { getInitials, getRoleLabel } from './helpers';

/**
 * Shared app sidebar.
 * Props:
 *  - user          : AuthContext user object
 *  - logout        : logout function
 *  - sidebarOpen   : boolean
 *  - setSidebarOpen: setter
 *  - onCreateDoc   : (type) => void  — called when a template is picked; null = hide create dropdown
 */
const DashboardSidebar = ({ user, logout, sidebarOpen, setSidebarOpen, onCreateDoc }) => {
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    const initials = getInitials(user?.name);
    const roleLabel = getRoleLabel(user?.role);

    return (
        <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>

            {/* ── Logo ── */}
            <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0 gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow-md shadow-violet-200">
                    <FileText size={18} className="text-white" />
                </div>
                {sidebarOpen && (
                    <div>
                        <div className="font-black text-gray-900 text-sm leading-tight">DocFlow</div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sistem Dokumen</div>
                    </div>
                )}
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {/* Dashboard link (active indicator) */}
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 ${!sidebarOpen && 'justify-center'}`}>
                    <LayoutDashboard size={18} className="shrink-0" />
                    {sidebarOpen && <span className="text-sm font-semibold">Dashboard</span>}
                </div>

                {/* Create document dropdown — only for user/admin */}
                {onCreateDoc && (
                    <div>
                        <button
                            onClick={() => setShowCreateDropdown(prev => !prev)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center'}`}
                        >
                            <Plus size={18} className="shrink-0 text-violet-500" />
                            {sidebarOpen && (
                                <>
                                    <span className="text-sm font-semibold flex-1 text-left">Buat Dokumen</span>
                                    <ChevronDown size={14} className={`transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {showCreateDropdown && sidebarOpen && (
                            <div className="mt-1 ml-3 pl-3 border-l-2 border-violet-100 space-y-0.5">
                                {[
                                    { type: 'nota', label: 'Nota Dinas', icon: <FileText size={14} />, color: 'text-violet-600' },
                                    { type: 'sppd', label: 'SPPD', icon: <FileText size={14} />, color: 'text-emerald-600' },
                                    { type: 'perj', label: 'Perjanjian (PKS)', icon: <FileSignature size={14} />, color: 'text-orange-500' },
                                ].map(({ type, label, icon, color }) => (
                                    <button
                                        key={type}
                                        onClick={() => { onCreateDoc(type); setShowCreateDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors group"
                                    >
                                        <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ── User card + logout ── */}
            <div className="p-3 border-t border-gray-100 shrink-0">
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition cursor-default ${!sidebarOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {initials}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-800 truncate">{user?.name}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{roleLabel}</div>
                        </div>
                    )}
                </div>
                <Link
                    to="/profile"
                    className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-semibold ${!sidebarOpen && 'justify-center'}`}
                >
                    <User size={16} className="shrink-0" />
                    {sidebarOpen && <span>Profil Saya</span>}
                </Link>
                <button
                    onClick={logout}
                    className={`mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition text-sm font-semibold ${!sidebarOpen && 'justify-center'}`}
                >
                    <LogOut size={16} className="shrink-0" />
                    {sidebarOpen && <span>Keluar</span>}
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
