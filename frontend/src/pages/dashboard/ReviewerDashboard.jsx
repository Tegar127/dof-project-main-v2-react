import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FolderOpen, Clock } from 'lucide-react';

// Shared components
import DashboardSidebar from './shared/DashboardSidebar';
import DashboardTopBar from './shared/DashboardTopBar';
import ToastAlert from './shared/ToastAlert';
import DocumentTable from './shared/DocumentTable';
import { isDocEditable } from './shared/helpers';

/* ══════════════════════════════════════════
   REVIEWER DASHBOARD
   — Can view & edit documents in pending_review
   — Cannot create new documents
   — Cannot distribute
   ══════════════════════════════════════════ */
const ReviewerDashboard = () => {
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Layout state ──
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Data state ──
    const [documents, setDocuments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // ── Filter state ──
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    /* ── Toast helper ── */
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Handle redirect toast ── */
    useEffect(() => {
        if (searchParams.get('success') === 'sent') {
            showToast('Dokumen berhasil dikirim ke tujuan!', 'success');
            searchParams.delete('success');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    /* ── Initial data fetch ── */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, notifsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/notifications'),
                ]);
                setDocuments(docsRes.data.data || []);
                setNotifications(notifsRes.data || []);
            } catch (err) {
                console.error('ReviewerDashboard: failed to load data', err);
            }
        };
        fetchData();
    }, []);

    /* ── Derived data ── */
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || doc.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        let matchesDate = true;
        if (dateFrom && dateTo) {
            const docDate = new Date(doc.content_data?.date || doc.created_at);
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            matchesDate = docDate >= new Date(dateFrom) && docDate <= to;
        }
        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const pendingCount = filteredDocs.filter(d => d.status === 'pending_review').length;

    /* ── Notification actions ── */
    const markNotificationAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark-read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications([]);
            setShowNotifications(false);
        } catch (e) { console.error(e); }
    };

    /* ── Render ── */
    return (
        <div className="min-h-screen flex font-sans" style={{ background: '#e8edf6' }}>
            <ToastAlert toast={toast} />

            {/* onCreateDoc=null → sidebar hides "Buat Dokumen" dropdown */}
            <DashboardSidebar
                user={user}
                logout={logout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onCreateDoc={null}
            />

            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <DashboardTopBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    title="Reviewer Panel"
                    notifications={notifications}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    onMarkAllRead={markAllNotificationsAsRead}
                    onMarkRead={markNotificationAsRead}
                    user={user}
                />

                <div className="flex-1 p-6 space-y-6 bg-[#e8edf6]">
                    {/* ── Welcome + Stats ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Welcome banner */}
                        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-amber-900 p-6 text-white shadow-xl">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-amber-400/10 rounded-full blur-xl" />
                            <div className="relative z-10">
                                <p className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-1">Reviewer</p>
                                <h2 className="text-2xl font-black leading-tight mb-1">Halo, {user?.name?.split(' ')[0]}! 👋</h2>
                                <p className="text-slate-300 text-sm">Tinjau dan setujui dokumen yang masuk.</p>
                            </div>
                        </div>

                        {/* Stat: Total */}
                        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                                <FolderOpen size={22} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-gray-900">{filteredDocs.length}</div>
                                <div className="text-xs font-semibold text-gray-600 mt-0.5">Total Dokumen</div>
                            </div>
                        </div>

                        {/* Stat: Pending review */}
                        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                                <Clock size={22} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-gray-900">{pendingCount}</div>
                                <div className="text-xs font-semibold text-gray-600 mt-0.5">Menunggu Review</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Documents Table ── */}
                    <DocumentTable
                        documents={filteredDocs}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                        dateFrom={dateFrom} setDateFrom={setDateFrom}
                        dateTo={dateTo} setDateTo={setDateTo}
                        showFilters={showFilters} setShowFilters={setShowFilters}
                        user={user}
                        isDocEditable={isDocEditable}
                        onDelete={() => { }}   // reviewer cannot delete
                        onDistribute={null}   // reviewer cannot distribute
                    />
                </div>
            </main>
        </div>
    );
};

export default ReviewerDashboard;
