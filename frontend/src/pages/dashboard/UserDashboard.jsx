import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FolderOpen, CheckCircle } from 'lucide-react';

// Shared components
import DashboardSidebar from './shared/DashboardSidebar';
import DashboardTopBar from './shared/DashboardTopBar';
import ToastAlert from './shared/ToastAlert';
import DocumentTable from './shared/DocumentTable';
import CreateModal from './shared/CreateModal';
import DeleteModal from './shared/DeleteModal';
import { isDocEditable } from './shared/helpers';

/* ══════════════════════════════════════════
   USER DASHBOARD
   ══════════════════════════════════════════ */
const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // ── Create modal state ──
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [documentType, setDocumentType] = useState(null);
    const [documentName, setDocumentName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // ── Delete modal state ──
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

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
                console.error('UserDashboard: failed to load data', err);
            }
        };
        fetchData();
    }, []);

    /* ── Derived data ── */
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || doc.type === typeFilter;
        let matchesDate = true;
        if (dateFrom && dateTo) {
            const docDate = new Date(doc.created_at);
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            matchesDate = docDate >= new Date(dateFrom) && docDate <= to;
        }
        return matchesSearch && matchesType && matchesDate;
    });

    const approvedCount = filteredDocs.filter(d => d.status === 'approved').length;

    /* ── Actions ── */
    const handleCreateInit = (type) => {
        setDocumentType(type);
        setDocumentName('');
        setShowCreateModal(true);
    };

    const confirmCreate = async () => {
        if (!documentName.trim()) return;
        setIsCreating(true);
        try {
            const res = await api.post('/documents', { title: documentName, type: documentType });
            setShowCreateModal(false);
            showToast('Dokumen berhasil dibuat!', 'success');
            navigate(`/documents/${res.data.data.id}/edit`);
        } catch (err) {
            console.error(err);
            showToast('Gagal membuat dokumen', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;
        try {
            await api.delete(`/documents/${docToDelete.id}`);
            setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
            setShowDeleteModal(false);
            setDocToDelete(null);
            showToast('Dokumen berhasil dihapus', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal menghapus dokumen', 'error');
        }
    };

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

            <DashboardSidebar
                user={user}
                logout={logout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onCreateDoc={handleCreateInit}
            />

            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <DashboardTopBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    title="Dashboard"
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
                        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-purple-200">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                            <div className="relative z-10">
                                <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">Staff</p>
                                <h2 className="text-2xl font-black leading-tight mb-1">Halo, {user?.name?.split(' ')[0]}! 👋</h2>
                                <p className="text-purple-200 text-sm">Kelola dokumen dinas Anda dengan mudah.</p>
                            </div>
                        </div>

                        {/* Stat: Total */}
                        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 shrink-0">
                                <FolderOpen size={22} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-gray-900">{filteredDocs.length}</div>
                                <div className="text-xs font-semibold text-gray-400 mt-0.5">Total Dokumen</div>
                            </div>
                        </div>

                        {/* Stat: Approved */}
                        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle size={22} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-gray-900">{approvedCount}</div>
                                <div className="text-xs font-semibold text-gray-400 mt-0.5">Disetujui</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Documents Table ── */}
                    <DocumentTable
                        documents={filteredDocs}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                        dateFrom={dateFrom} setDateFrom={setDateFrom}
                        dateTo={dateTo} setDateTo={setDateTo}
                        showFilters={showFilters} setShowFilters={setShowFilters}
                        user={user}
                        isDocEditable={isDocEditable}
                        onDelete={doc => { setDocToDelete(doc); setShowDeleteModal(true); }}
                        onDistribute={null}
                    />
                </div>
            </main>

            {/* Modals */}
            {showCreateModal && (
                <CreateModal
                    documentType={documentType}
                    documentName={documentName}
                    setDocumentName={setDocumentName}
                    isCreating={isCreating}
                    onConfirm={confirmCreate}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
            {showDeleteModal && (
                <DeleteModal
                    doc={docToDelete}
                    onConfirm={confirmDelete}
                    onClose={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default UserDashboard;
