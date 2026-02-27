import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, CheckCircle, XCircle, Clock, History, FileText, UserCheck, ShieldCheck, Mail, Save, AlertCircle } from 'lucide-react';

const DocumentViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doc, setDoc] = useState(null);
    const [approvals, setApprovals] = useState([]);
    const [logs, setLogs] = useState([]);
    const [versions, setVersions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs');

    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [activeApproval, setActiveApproval] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [docRes, appRes, logRes, verRes] = await Promise.all([
                api.get(`/documents/${id}`),
                api.get(`/documents/${id}/approvals`),
                api.get(`/documents/${id}/logs`),
                api.get(`/documents/${id}/versions`)
            ]);

            setDoc(docRes.data.data);
            setApprovals(appRes.data.data.approvals || []);
            setLogs(logRes.data.data || []);
            setVersions(verRes.data.data || []);
        } catch (err) {
            console.error(err);
            alert("Gagal memuat detail dokumen");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await api.post(`/documents/${id}/approvals/${activeApproval.id}/approve`, { notes });
            setShowApproveModal(false);
            setNotes('');
            loadData();
        } catch (err) {
            console.error(err);
            alert("Gagal menyetujui dokumen");
        }
    };

    const handleReject = async () => {
        if (!notes) return alert("Alasan penolakan wajib diisi");
        try {
            await api.post(`/documents/${id}/approvals/${activeApproval.id}/reject`, { notes });
            setShowRejectModal(false);
            setNotes('');
            loadData();
        } catch (err) {
            console.error(err);
            alert("Gagal menolak dokumen");
        }
    };

    const handleRestore = async (versionId) => {
        if (!window.confirm("Yakin ingin memulihkan versi ini?")) return;
        try {
            await api.post(`/documents/${id}/versions/${versionId}/restore`);
            alert("Versi berhasil dipulihkan");
            loadData();
        } catch (err) {
            console.error(err);
            alert("Gagal memulihkan versi");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat Dokumen...</div>;
    if (!doc) return <div className="p-8 text-center text-slate-500">Dokumen tidak ditemukan</div>;

    const isAuthor = doc.author_id === user.id;

    // Approvals Logic
    const progress = approvals.length > 0
        ? Math.round((approvals.filter(a => a.status === 'approved').length / approvals.length) * 100)
        : 0;

    const getStatusUI = (status) => {
        switch (status) {
            case 'approved': return { color: 'bg-emerald-100 text-emerald-700', label: 'Disetujui', icon: <CheckCircle size={16} /> };
            case 'rejected': return { color: 'bg-red-100 text-red-700', label: 'Ditolak', icon: <XCircle size={16} /> };
            case 'pending': return { color: 'bg-amber-100 text-amber-700', label: 'Menunggu', icon: <Clock size={16} /> };
            case 'sent': return { color: 'bg-sky-100 text-sky-700', label: 'Terkirim', icon: <Mail size={16} /> };
            case 'draft': return { color: 'bg-slate-100 text-slate-700', label: 'Draft', icon: <Save size={16} /> };
            case 'needs_revision': return { color: 'bg-orange-100 text-orange-700', label: 'Perlu Revisi', icon: <AlertCircle size={16} /> };
            default: return { color: 'bg-slate-100 text-slate-700', label: status, icon: <FileText size={16} /> };
        }
    };

    const ui = getStatusUI(doc.status);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-100 text-indigo-700">
                            {doc.type === 'nota' ? 'Nota Dinas' : doc.type === 'sppd' ? 'SPPD' : 'Perjanjian'}
                        </span>
                        <span className="text-sm font-mono text-slate-500">v{doc.version}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">{doc.title}</h1>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${ui.color}`}>
                    {ui.icon}
                    {ui.label}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Alur Persetujuan & Riwayat */}
                <div className="col-span-2 space-y-6">

                    {/* Alur Persetujuan */}
                    {approvals.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShieldCheck className="text-indigo-600" />
                                Alur Persetujuan
                            </h2>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 font-medium">Progress</span>
                                    <span className="text-indigo-600 font-bold">{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {approvals.map((app, idx) => {
                                    const aUi = getStatusUI(app.status);
                                    const canApprove = app.status === 'pending' && app.approver_id === user.id && doc.status === 'pending_review';

                                    return (
                                        <div key={app.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${app.status === 'approved' ? 'bg-emerald-600 text-white' : app.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-slate-800">
                                                    {app.approver_id ? (app.user ? app.user.name : `Approver ${idx + 1}`) : 'Menunggu Assignment'}
                                                </div>
                                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded font-medium ${aUi.color}`}>{aUi.label}</span>
                                                    {app.approved_at && <span>• {new Date(app.approved_at).toLocaleDateString()}</span>}
                                                </div>
                                                {app.notes && <div className="text-sm bg-white p-2 rounded border border-slate-200 text-slate-600">Catatan: {app.notes}</div>}
                                            </div>
                                            {canApprove && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setActiveApproval(app); setShowApproveModal(true); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Setuju</button>
                                                    <button onClick={() => { setActiveApproval(app); setShowRejectModal(true); }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Tolak</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* History Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex border-b border-slate-200">
                            <button onClick={() => setActiveTab('logs')} className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <History size={18} />Riwayat Log
                            </button>
                            <button onClick={() => setActiveTab('versions')} className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 ${activeTab === 'versions' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <FileText size={18} />Versi ({versions.length})
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'logs' && (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {logs.map(log => (
                                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                {getStatusUI(log.action.toLowerCase()).icon || <History size={16} />}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900 text-sm">{log.action}</div>
                                                    <time className="font-mono text-xs font-medium text-emerald-600">v{log.version}</time>
                                                </div>
                                                <div className="text-xs text-slate-500 mb-2">{new Date(log.created_at).toLocaleString()} by {log.user?.name || log.user_name}</div>
                                                {log.notes && <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{log.notes}</div>}
                                                {log.changes && <div className="text-xs text-slate-500 mt-2 italic whitespace-pre-wrap">{log.changes}</div>}
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && <div className="text-center text-slate-500 py-4">Belum ada riwayat</div>}
                                </div>
                            )}

                            {activeTab === 'versions' && (
                                <div className="space-y-3">
                                    {versions.map(v => (
                                        <div key={v.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">v{v.version_number}</span>
                                                    <span className="text-sm font-semibold text-slate-800">{new Date(v.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-slate-600">{v.change_summary || 'Perubahan tersimpan'}</div>
                                            </div>
                                            {isAuthor && v.version_number < doc.version && (
                                                <button onClick={() => handleRestore(v.id)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                                                    Pulihkan
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {versions.length === 0 && <div className="text-center text-slate-500 py-4">Belum ada versi tersimpan</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Info & Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-600" />
                            Informasi Dokumen
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Dibuat Oleh</span>
                                <span className="font-semibold text-slate-800">{doc.author?.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Tanggal Dibuat</span>
                                <span className="font-semibold text-slate-800">{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Terakhir Diubah</span>
                                <span className="font-semibold text-slate-800">{new Date(doc.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Folder</span>
                                <span className="font-semibold text-slate-800">{doc.folder?.name || '-'}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-3">
                            <Link to={`/documents/${doc.id}/edit`} className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-center hover:bg-indigo-100 transition-colors">
                                Buka Editor
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Setujui Dokumen</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan opsional..." className="w-full p-3 border rounded-lg mb-4 h-24 resize-none outline-none focus:ring-2 focus:ring-emerald-500" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleApprove} className="flex-1 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Setujui</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Tolak Dokumen</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alasan penolakan (Wajib)..." className="w-full p-3 border rounded-lg mb-4 h-24 resize-none outline-none focus:ring-2 focus:ring-red-500" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleReject} className="flex-1 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Tolak</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DocumentViewer;
