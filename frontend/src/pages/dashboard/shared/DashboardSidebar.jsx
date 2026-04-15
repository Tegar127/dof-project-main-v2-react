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
        <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>

            {/* ── Logo ── */}
            <div className="h-16 flex items-center px-5 border-b border-gray-200 shrink-0 gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center shrink-0 shadow-md shadow-teal-100">
                    <FileText size={18} className="text-white" />
                </div>
                {sidebarOpen && (
                    <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">DocFlow</div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sistem Dokumen</div>
                    </div>
                )}
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {/* Dashboard link (active indicator) */}
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-teal-50 text-teal-800 ${!sidebarOpen && 'justify-center'}`}>
                    <LayoutDashboard size={18} className="shrink-0" />
                    {sidebarOpen && <span className="text-sm font-semibold">Dashboard</span>}
                </div>

                {/* Create document dropdown — only for user/admin */}
                {onCreateDoc && (
                    <div>
                        <button
                            onClick={() => setShowCreateDropdown(prev => !prev)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${!sidebarOpen && 'justify-center'}`}
                        >
                            <Plus size={18} className="shrink-0 text-teal-600" />
                            {sidebarOpen && (
                                <>
                                    <span className="text-sm font-semibold flex-1 text-left">Buat Dokumen</span>
                                    <ChevronDown size={14} className={`transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {showCreateDropdown && sidebarOpen && (
                            <div className="mt-1 ml-7 flex flex-col">
                                {[
                                    { type: 'nota', label: 'Nota Dinas', icon: <FileText size={14} />, color: 'text-teal-700' },
                                ].map(({ type, label, icon, color }, i, arr) => (
                                    <div key={type} className="relative flex pl-5 py-0.5">
                                        {/* L-curve: left border from top to midpoint, then curves right */}
                                        <div className="absolute left-0 top-0 h-1/2 w-5 border-l-2 border-b-2 border-teal-200 rounded-bl-xl" aria-hidden="true" />
                                        {/* Vertical line from midpoint to bottom, connecting to next item */}
                                        {i < arr.length - 1 && (
                                            <div className="absolute left-0 top-1/2 bottom-0 w-0.5 bg-teal-200" aria-hidden="true" />
                                        )}
                                        <button
                                            onClick={() => { onCreateDoc(type); setShowCreateDropdown(false); }}
                                            className="flex-1 flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors group"
                                        >
                                            <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
                                            {label}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ── User card + logout ── */}
            <div className="p-3 border-t border-gray-200 shrink-0">
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition cursor-default ${!sidebarOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {initials}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{user?.name}</div>
                            <div className="text-xs text-gray-600 font-medium">{roleLabel}</div>
                        </div>
                    )}
                </div>
                <Link
                    to="/profile"
                    className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition text-sm font-semibold ${!sidebarOpen && 'justify-center'}`}
                >
                    <User size={16} className="shrink-0" />
                    {sidebarOpen && <span>Profil Saya</span>}
                </Link>
                <button
                    onClick={logout}
                    className={`mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition text-sm font-semibold ${!sidebarOpen && 'justify-center'}`}
                >
                    <LogOut size={16} className="shrink-0" />
                    {sidebarOpen && <span>Keluar</span>}
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
