import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LayoutDashboard, Bell } from 'lucide-react';
import { getInitials } from './helpers';

/**
 * Shared top bar / header.
 * Props:
 *  - sidebarOpen      : boolean
 *  - setSidebarOpen   : setter
 *  - title            : string (e.g. "Dashboard")
 *  - notifications    : array
 *  - showNotifications: boolean
 *  - setShowNotifications: setter
 *  - onMarkAllRead    : () => void
 *  - onMarkRead       : (id) => void
 *  - user             : AuthContext user
 */
const DashboardTopBar = ({
    sidebarOpen, setSidebarOpen,
    title = 'Dashboard',
    notifications,
    showNotifications, setShowNotifications,
    onMarkAllRead, onMarkRead,
    user,
}) => {
    const initials = getInitials(user?.name);

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                >
                    <LayoutDashboard size={16} />
                </button>
                <div>
                    <h1 className="font-black text-gray-900 text-base leading-tight">{title}</h1>
                    <p className="text-xs text-gray-400 font-medium">
                        {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                        className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                    >
                        <Bell size={17} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div
                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-sm text-gray-800">Notifikasi</h3>
                                    {notifications.length > 0 && (
                                        <button onClick={onMarkAllRead} className="text-xs text-violet-600 hover:text-violet-700 font-semibold">
                                            Tandai semua dibaca
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                            Tidak ada notifikasi baru
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => onMarkRead(notif.id)}
                                                className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex gap-3"
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notif.data.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>
                                                    <Bell size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{notif.data.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notif.data.message}</p>
                                                    <p className="text-[10px] text-gray-300 mt-1">
                                                        {format(new Date(notif.created_at), 'dd MMM · HH:mm', { locale: id })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                </div>
            </div>
        </header>
    );
};

export default DashboardTopBar;
