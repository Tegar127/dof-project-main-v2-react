import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Users, UsersRound, ClipboardList, CheckCircle, XCircle, FileText, Archive } from 'lucide-react';

// Sub-Components
import AdminSidebar from '../../components/admin/AdminSidebar';
import UsersTab from '../../components/admin/UsersTab';
import GroupsTab from '../../components/admin/GroupsTab';
import DistributionsTab from '../../components/admin/DistributionsTab';
import AllDocumentsTab from '../../components/admin/AllDocumentsTab';

/* ═══════════════════════════════════════════════════════════════
   TAB TITLES & DESCRIPTIONS
   ═══════════════════════════════════════════════════════════════ */
const TAB_META = {
    dashboard: { title: 'Admin Dashboard', desc: 'Overview of your system performance.' },
    users: { title: 'User Management', desc: 'Kelola struktur organisasi dan hak akses.' },
    groups: { title: 'Group Management', desc: 'Kelola struktur organisasi dan hak akses.' },
    distributions: { title: 'Monitoring Distribusi', desc: 'Pantau penyebaran dan status baca dokumen final.' },
    all_documents: { title: 'Arsip Seluruh Dokumen', desc: 'Database pusat seluruh dokumen di dalam sistem.' },
};

/* ═══════════════════════════════════════════════════════════════
   HELPER: Date formatter (matches Laravel formatDate)
   ═══════════════════════════════════════════════════════════════ */
const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

/* ═══════════════════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════════ */
const DeleteModal = ({ doc, reason, setReason, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-2 text-slate-800">Delete Document?</h3>
            <p className="text-gray-500 text-sm mb-4">You are about to delete <strong>{doc?.title}</strong>. This will notify the author.</p>
            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Deletion</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" rows="3" placeholder="e.g., Duplicate document, Incorrect format..." />
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm">Delete</button>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════════ */
const Toast = ({ notification, onClose }) => {
    if (!notification.show) return null;
    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center max-w-xs p-4 rounded-lg shadow-lg border ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div className="ml-3 text-sm font-medium">{notification.message}</div>
            <button onClick={onClose} className="ml-auto p-1.5"><XCircle size={16} /></button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD STATS (Home Tab)
   ═══════════════════════════════════════════════════════════════ */
const DashboardStats = ({ users, groups, allDocuments, setActiveTab }) => {
    const totalDocs = allDocuments.length;
    const approvedDocs = allDocuments.filter(d => d.status === 'approved').length;
    const pendingDocs = allDocuments.filter(d => ['pending', 'pending_review'].includes(d.status)).length;
    const finalDocs = allDocuments.filter(d => ['final', 'distributed'].includes(d.status)).length;

    const approvedPct = totalDocs ? Math.round((approvedDocs / totalDocs) * 100) : 0;
    const pendingPct = totalDocs ? Math.round((pendingDocs / totalDocs) * 100) : 0;
    const finalPct = totalDocs ? Math.round((finalDocs / totalDocs) * 100) : 0;

    return (
        <div>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-slate-800">{users.length}</div>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center float-right"><Users size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Total Groups</div>
                        <div className="text-3xl font-bold text-slate-800">{groups.length}</div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center float-right"><UsersRound size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Total Dokumen</div>
                        <div className="text-3xl font-bold text-slate-800">{totalDocs}</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center float-right"><FileText size={24} /></div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 text-white flex flex-col justify-center">
                    <div className="text-indigo-100 text-sm font-medium mb-1">System Status</div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <div className="text-xl font-bold">Operational</div>
                    </div>
                </div>
            </div>

            {/* Document Statistics Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Distribusi Status Dokumen</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium tracking-wide">Disetujui (Approved)</span>
                                <span className="font-bold text-emerald-600">{approvedDocs} <span className="text-slate-400 font-normal">({approvedPct}%)</span></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${approvedPct}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium tracking-wide">Menunggu (Pending)</span>
                                <span className="font-bold text-amber-500">{pendingDocs} <span className="text-slate-400 font-normal">({pendingPct}%)</span></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${pendingPct}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium tracking-wide">Final / Terdistribusi</span>
                                <span className="font-bold text-blue-600">{finalDocs} <span className="text-slate-400 font-normal">({finalPct}%)</span></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${finalPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links inside the same grid for better layout */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4">Akses Cepat</h3>
                    <div className="flex-1 flex flex-col gap-3">
                        <button onClick={() => setActiveTab('users')} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group flex items-center gap-4">
                            <Users size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            <div className="text-sm font-bold text-slate-800">Manajemen Pengguna</div>
                        </button>
                        <button onClick={() => setActiveTab('distributions')} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group flex items-center gap-4">
                            <ClipboardList size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            <div className="text-sm font-bold text-slate-800">Monitoring Distribusi</div>
                        </button>
                        <button onClick={() => setActiveTab('all_documents')} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group flex items-center gap-4">
                            <Archive size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            <div className="text-sm font-bold text-slate-800">Arsip Seluruh Dokumen</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Data State
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, doc: null, reason: '' });

    /* ── Helpers ── */
    const showNotif = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(n => ({ ...n, show: false })), 3000);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    /* ── Data Loaders ── */
    const loadUsers = useCallback(async () => {
        try { const r = await api.get('/users'); setUsers(r.data.data || r.data || []); } catch { /* ignore */ }
    }, []);

    const loadGroups = useCallback(async () => {
        try { const r = await api.get('/groups'); setGroups(r.data.data || r.data || []); } catch { /* ignore */ }
    }, []);

    const loadDistributions = useCallback(async () => {
        try { const r = await api.get('/distributions/monitoring'); setDistributions(r.data.data || r.data || []); } catch { /* ignore */ }
    }, []);

    const loadAllDocuments = useCallback(async () => {
        try {
            const r = await api.get('/documents');
            const docs = Array.isArray(r.data.data) ? r.data.data : (r.data.data?.data || r.data || []);
            setAllDocuments(docs);
        } catch { /* ignore */ }
    }, []);

    const refreshAll = useCallback(() => {
        loadUsers();
        loadGroups();
        loadDistributions();
        loadAllDocuments();
    }, [loadUsers, loadGroups, loadDistributions, loadAllDocuments]);

    useEffect(() => { refreshAll(); }, [refreshAll]);

    /* ── CRUD Handlers ── */
    const handleSaveUser = async (editingId, form) => {
        try {
            const payload = { ...form };
            if (editingId && !payload.password) delete payload.password;
            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
            } else {
                await api.post('/users', payload);
            }
            showNotif('User saved successfully');
            loadUsers();
            return true;
        } catch (err) {
            showNotif(err.response?.data?.message || 'Error saving user', 'error');
            return false;
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            showNotif('User deleted successfully');
            loadUsers();
        } catch {
            showNotif('Error deleting user', 'error');
        }
    };

    const handleSaveGroup = async (editingId, form) => {
        try {
            if (editingId) {
                await api.put(`/groups/${editingId}`, form);
            } else {
                await api.post('/groups', form);
            }
            showNotif('Group saved successfully');
            loadGroups();
            return true;
        } catch (err) {
            showNotif(err.response?.data?.message || 'Error saving group', 'error');
            return false;
        }
    };

    const handleDeleteGroup = async (id) => {
        try {
            await api.delete(`/groups/${id}`);
            showNotif('Group deleted successfully');
            loadGroups();
        } catch {
            showNotif('Error deleting group', 'error');
        }
    };

    const openDeleteDocModal = (docId, docTitle) => {
        setDeleteModal({ show: true, doc: { id: docId, title: docTitle }, reason: '' });
    };

    const confirmDeleteDoc = async () => {
        if (!deleteModal.doc) return;
        try {
            await api.delete(`/documents/${deleteModal.doc.id}`, { data: { reason: deleteModal.reason } });
            showNotif('Document deleted successfully');
            setDeleteModal({ show: false, doc: null, reason: '' });
            loadAllDocuments();
        } catch (err) {
            showNotif(err.response?.data?.message || 'Error deleting document', 'error');
        }
    };

    /* ── Render ── */
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <div className={`transition-all duration-300 p-8 flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{TAB_META[activeTab]?.title}</h1>
                        <p className="text-slate-500 mt-1">{TAB_META[activeTab]?.desc}</p>
                    </div>
                    <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && (
                    <DashboardStats users={users} groups={groups} allDocuments={allDocuments} setActiveTab={setActiveTab} />
                )}

                {activeTab === 'users' && (
                    <UsersTab users={users} groups={groups} onSave={handleSaveUser} onDelete={handleDeleteUser} showNotif={showNotif} />
                )}

                {activeTab === 'groups' && (
                    <GroupsTab users={users} groups={groups} onSave={handleSaveGroup} onDelete={handleDeleteGroup} showNotif={showNotif} formatDate={formatDate} />
                )}

                {activeTab === 'distributions' && (
                    <DistributionsTab distributions={distributions} groups={groups} users={users} showNotif={showNotif} formatDate={formatDate} onRefresh={() => { loadDistributions(); loadAllDocuments(); }} />
                )}

                {activeTab === 'all_documents' && (
                    <AllDocumentsTab documents={allDocuments} onDeleteDoc={openDeleteDocModal} formatDate={formatDate} />
                )}
            </div>

            {/* Delete Document Modal */}
            {deleteModal.show && (
                <DeleteModal
                    doc={deleteModal.doc}
                    reason={deleteModal.reason}
                    setReason={r => setDeleteModal(m => ({ ...m, reason: r }))}
                    onConfirm={confirmDeleteDoc}
                    onCancel={() => setDeleteModal({ show: false, doc: null, reason: '' })}
                />
            )}

            {/* Toast */}
            <Toast notification={notification} onClose={() => setNotification(n => ({ ...n, show: false }))} />
        </div>
    );
};

export default AdminDashboard;
