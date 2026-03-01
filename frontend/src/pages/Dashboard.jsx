import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../utils/api';
import {
    FileText, FileSignature, CheckCircle, Clock,
    Bell, Search, Plus, Filter, Trash2, Send, ChevronRight, X, LogOut, AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [documents, setDocuments] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Toast Alert
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const successParam = searchParams.get('success');
        if (successParam === 'sent') {
            showToast('Dokumen berhasil dikirim ke tujuan!', 'success');
            searchParams.delete('success');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [documentType, setDocumentType] = useState(null);
    const [documentName, setDocumentName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [docToDistribute, setDocToDistribute] = useState(null);
    const [distributeType, setDistributeType] = useState('all');
    const [distributeId, setDistributeId] = useState('');
    const [distributeNotes, setDistributeNotes] = useState('');

    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);

    // Initial Load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, notifsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/notifications')
                ]);

                setDocuments(docsRes.data.data || []);
                setNotifications(notifsRes.data || []);

                if (user?.role === 'admin') {
                    const distRes = await api.get('/distributions/monitoring');
                    setDistributions(distRes.data || []);

                    const [groupsRes, usersRes] = await Promise.all([
                        api.get('/groups'),
                        api.get('/users')
                    ]);
                    setGroups(groupsRes.data.data || []);
                    setUsers(usersRes.data.data || []);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        fetchData();
    }, [user?.role]);

    // Derived Data
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || doc.type === typeFilter;
        let matchesDate = true;

        if (dateFrom && dateTo) {
            const docDate = new Date(doc.created_at);
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            // set end of day for 'to'
            to.setHours(23, 59, 59, 999);
            matchesDate = docDate >= from && docDate <= to;
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const approvedCount = filteredDocs.filter(d => d.status === 'approved').length;
    const pendingCount = filteredDocs.filter(d => d.status === 'pending_review').length;

    // Actions
    const handleCreateInit = (type) => {
        setDocumentType(type);
        setDocumentName('');
        setShowCreateModal(true);
    };

    const confirmCreate = async () => {
        if (!documentName.trim()) return;
        setIsCreating(true);
        try {
            const res = await api.post('/documents', {
                title: documentName,
                type: documentType,
                // Additional defaults
            });
            setShowCreateModal(false);
            showToast('Dokumen berhasil dibuat!', 'success');
            navigate(`/documents/${res.data.data.id}/edit`);
        } catch (error) {
            console.error("Failed to create document", error);
            showToast("Gagal membuat dokumen", 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;
        try {
            await api.delete(`/documents/${docToDelete.id}`);
            setDocuments(docs => docs.filter(d => d.id !== docToDelete.id));
            setShowDeleteModal(false);
            setDocToDelete(null);
            showToast('Dokumen berhasil dihapus', 'success');
        } catch (error) {
            console.error("Failed to delete document", error);
            showToast(error.response?.data?.message || "Gagal menghapus dokumen", 'error');
        }
    };

    const confirmDistribute = async () => {
        if (!docToDistribute) return;
        try {
            await api.post(`/distributions/${docToDistribute.id}`, {
                recipients: [{ type: distributeType, id: distributeId ? parseInt(distributeId) : null }],
                notes: distributeNotes
            });

            // Refresh distributions
            const distRes = await api.get('/distributions/monitoring');
            setDistributions(distRes.data || []);

            // Refresh documents
            const docsRes = await api.get('/documents');
            setDocuments(docsRes.data.data || []);

            setShowDistributeModal(false);
            setDocToDistribute(null);
            setDistributeNotes('');
            setDistributeId('');
            setDistributeType('all');
            showToast('Dokumen berhasil didistribusikan!', 'success');
        } catch (error) {
            console.error("Failed to distribute document", error);
            showToast(error.response?.data?.message || "Gagal mendistribusikan dokumen", 'error');
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark-read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications([]);
            setShowNotifications(false);
        } catch (e) {
            console.error(e);
        }
    };

    // UI Helpers
    const getStatusLabel = (status, doc = null) => {
        const statusMap = {
            'draft': 'Draft',
            'pending_review': 'Menunggu Review',
            'needs_revision': 'Perlu Revisi',
            'approved': 'Disetujui',
            'sent': 'Dikirim',
            'received': 'Diterima'
        };

        // Hanya tampilkan 'Final (Terdistribusi)' jika admin sudah distribusikan
        if (status === 'sent' && doc?.distributions?.length > 0) {
            return 'Final (Terdistribusi)';
        }

        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classes = {
            'draft': 'bg-slate-100 text-slate-600',
            'pending_review': 'bg-amber-100 text-amber-600',
            'needs_revision': 'bg-red-100 text-red-600',
            'approved': 'bg-emerald-100 text-emerald-600',
            'sent': 'bg-indigo-100 text-indigo-700 font-bold', // Highlighted Sent/Final
            'received': 'bg-violet-100 text-violet-600'
        };
        return classes[status] || 'bg-slate-100 text-slate-600';
    };

    const isDocEditable = (d, currentUser) => {
        if (!d || !currentUser) return false;

        // RULE 1: STRICT BLOCKERS (Berlaku untuk SEMUA ORANG, termasuk Admin)
        // Finalized / Approved docs are strictly uneditable
        if (d.status === 'approved') return false;

        // Block 'sent' dan 'received' HANYA JIKA ini adalah hasil distribusi final Admin
        if (['sent', 'received'].includes(d.status) && d.distributions?.length > 0) return false;

        // RULE 2: ADMIN BYPASS
        if (currentUser.role === 'admin') return true;

        // RULE 3: REGULAR USERS
        const isAuthor = String(d.author_id) === String(currentUser.id);
        // Author can edit when draft, needs_revision, or even when it's just 'sent' but not distributed
        const isAuthorEditable = isAuthor && ['draft', 'needs_revision'].includes(d.status);

        const userGrps = [currentUser.group_name, ...(currentUser.groups || []).map(g => typeof g === 'object' ? g.name : g)].filter(Boolean);
        const isGroup = d.target_role === 'group' && userGrps.includes(d.target_value);
        const isDispo = d.target_role === 'dispo' && currentUser.role === 'reviewer';
        const isTargetUser = d.target_role === 'user' && d.target_value === currentUser.email;

        // Is recipient of the pre-approval forwarding loop
        const isRecipient = isGroup || isDispo || isTargetUser;
        // Recipients can edit when pending_review, sent, or received (as long as it wasn't blocked above by admin dist)
        const isRecipientEditable = isRecipient && ['pending_review', 'sent', 'received'].includes(d.status);

        return isAuthorEditable || isRecipientEditable;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-8 right-8 z-[100] pointer-events-none">
                    <div className={`pointer-events-auto flex items-center gap-5 px-6 py-5 rounded-3xl shadow-2xl backdrop-blur-xl border bg-white/95 animate-fade-in-up transition-all ${toast.type === 'success' ? 'border-emerald-100 shadow-emerald-500/20' : 'border-red-100 shadow-red-500/20'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {toast.type === 'success' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                        </div>
                        <div className="flex-1 pr-4">
                            <h4 className="text-lg font-black text-slate-800 tracking-tight">
                                {toast.type === 'success' ? 'Berhasil!' : 'Gagal'}
                            </h4>
                            <p className="text-sm font-semibold text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Decoration */}
            <div className="h-64 bg-slate-900 absolute top-0 left-0 right-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-800 opacity-80"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="text-white">
                        <div className="flex items-center gap-3 mb-2 opacity-90">
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/10">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium tracking-wide text-sm">
                                {user?.role === 'reviewer' ? 'Reviewer Panel' : user?.role === 'admin' ? 'Admin Dashboard' : 'Staff Workspace'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Halo, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-blue-100 mt-2 text-lg">Kelola dokumen dinas anda dengan mudah dan cepat.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative bg-white/10 hover:bg-white/20 text-white backdrop-blur-md p-2.5 rounded-xl transition-all border border-white/10"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></div>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right text-slate-800">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                            <h3 className="font-bold text-sm">Notifikasi</h3>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={markAllNotificationsAsRead}
                                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-sm">Tidak ada notifikasi baru</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.data.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                <Bell size={16} />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-slate-800">{notif.data.title}</p>
                                                            <p className="text-xs text-slate-600 mt-1">{notif.data.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-2">{format(new Date(notif.created_at), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/10 flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Quick Actions & Stats */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                        <h2 className="text-white font-bold text-xl tracking-tight">Buat Dokumen Baru</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {(user?.role === 'user' || user?.role === 'admin') && (
                            <>
                                {/* Card 1: Nota Dinas */}
                                <button onClick={() => handleCreateInit('nota')} className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden text-left">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white shadow-sm shadow-indigo-100">
                                            <FileText size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Nota Dinas</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed mb-4">Buat draf nota dinas resmi standar.</p>
                                        <div className="flex items-center text-indigo-600 font-semibold text-xs group-hover:gap-2 transition-all">
                                            Mulai Buat <ChevronRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </button>

                                {/* Card 2: SPPD */}
                                <button onClick={() => handleCreateInit('sppd')} className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden text-left">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-emerald-600 group-hover:text-white shadow-sm shadow-emerald-100">
                                            <FileText size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">SPPD</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed mb-4">Surat Perintah Perjalanan Dinas.</p>
                                        <div className="flex items-center text-emerald-600 font-semibold text-xs group-hover:gap-2 transition-all">
                                            Mulai Buat <ChevronRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </button>

                                {/* Card 3: Perjanjian */}
                                <button onClick={() => handleCreateInit('perj')} className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 overflow-hidden text-left">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-amber-600 group-hover:text-white shadow-sm shadow-amber-100">
                                            <FileSignature size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Perjanjian</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed mb-4">Perjanjian Kerja Sama (PKS).</p>
                                        <div className="flex items-center text-amber-600 font-semibold text-xs group-hover:gap-2 transition-all">
                                            Mulai Buat <ChevronRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* Card 4: Stats */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Dokumen</div>
                                    <div className="text-4xl font-black tracking-tight">{filteredDocs.length}</div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Disetujui</span>
                                        <span className="font-bold text-emerald-400">{approvedCount}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${filteredDocs.length > 0 ? (approvedCount / filteredDocs.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'reviewer' && (
                            <>
                                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800">{pendingCount}</div>
                                        <div className="text-slate-500 text-sm">Menunggu Review</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Distributions Monitoring (Admin Only) */}
                {user?.role === 'admin' && distributions.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                            <h2 className="text-slate-800 font-bold text-xl tracking-tight">Monitoring Distribusi Dokumen Final</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x snap-mandatory">
                            {distributions.map(dist => (
                                <div key={dist.id} className="min-w-[85vw] md:min-w-[400px] snap-start bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <Send size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{dist.title}</h3>
                                                <p className="text-[10px] text-slate-500">
                                                    Didistribusikan: {dist.distributed_at ? format(new Date(dist.distributed_at), 'dd MMM yyyy', { locale: id }) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-indigo-600">{dist.percentage}%</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Terbaca</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-auto">
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${dist.percentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="text-indigo-600" size={20} />
                                Daftar Dokumen
                            </h2>
                            <div className="relative w-full sm:w-96">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari judul dokumen..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tipe Dokumen</label>
                                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="all">Semua Tipe</option>
                                    <option value="nota">Nota Dinas</option>
                                    <option value="sppd">SPPD</option>
                                    <option value="perj">Perjanjian</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Dari Tanggal</label>
                                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Sampai Tanggal</label>
                                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Dokumen</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDocs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            Tidak ada dokumen ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${doc.type === 'nota' ? 'bg-indigo-50 text-indigo-600' : doc.type === 'sppd' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {doc.type.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.title}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{doc.content_data?.docNumber || 'No Ref'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 font-medium capitalize bg-slate-100 px-2 py-1 rounded-md">{doc.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: id })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(doc.status)}`}>
                                                    {getStatusLabel(doc.status, doc)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/documents/${doc.id}/view`} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                                                        Detail
                                                    </Link>

                                                    {user.role === 'admin' && (doc.status === 'approved' || doc.status === 'sent') && (
                                                        <button
                                                            onClick={() => { setDocToDistribute(doc); setShowDistributeModal(true); }}
                                                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                    )}

                                                    {isDocEditable(doc, user) && (
                                                        <Link to={`/documents/${doc.id}/edit`} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm">
                                                            Edit
                                                        </Link>
                                                    )}

                                                    {user.id === doc.author_id && doc.status !== 'approved' && (
                                                        <button
                                                            onClick={() => { setDocToDelete(doc); setShowDeleteModal(true); }}
                                                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Buat Dokumen Baru</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Dokumen</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Contoh: Nota Dinas Rapat"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmCreate()}
                                />
                            </div>
                            <button
                                onClick={confirmCreate}
                                disabled={isCreating || !documentName.trim()}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isCreating ? 'Membuat...' : 'Lanjutkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Dokumen?</h3>
                        <p className="text-slate-500 mb-6">Anda yakin ingin menghapus "{docToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Distribute Modal */}
            {showDistributeModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Distribusikan Dokumen Final</h3>
                            <button onClick={() => setShowDistributeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">{docToDistribute?.title}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Penerima</label>
                                <select value={distributeType} onChange={(e) => setDistributeType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="all">Semua User</option>
                                    <option value="group">Grup Spesifik</option>
                                    <option value="user">User Spesifik</option>
                                </select>
                            </div>

                            {distributeType === 'group' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Grup</label>
                                    <select value={distributeId} onChange={(e) => setDistributeId(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Pilih Grup...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {distributeType === 'user' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilih User</label>
                                    <select value={distributeId} onChange={(e) => setDistributeId(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Pilih User...</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.position})</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan (Opsional)</label>
                                <textarea value={distributeNotes} onChange={(e) => setDistributeNotes(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" rows="3"></textarea>
                            </div>

                            <button
                                onClick={confirmDistribute}
                                disabled={distributeType !== 'all' && !distributeId}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
                            >
                                Distribusikan Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
