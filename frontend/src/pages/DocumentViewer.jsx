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
    const [readReceipts, setReadReceipts] = useState([]);

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
            setApprovals(Array.isArray(appRes.data) ? appRes.data : (appRes.data?.data?.approvals || []));
            setLogs(Array.isArray(logRes.data) ? logRes.data : (logRes.data?.data || []));
            setVersions(Array.isArray(verRes.data) ? verRes.data : (verRes.data?.data || []));
            setReadReceipts(docRes.data.data.read_receipts || []);
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
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-12">
            {/* Top Decoration */}
            <div className="h-64 bg-slate-900 absolute top-0 left-0 right-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-800 opacity-80"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 text-white drop-shadow-sm mb-8">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 cursor-pointer">
                        <ArrowLeft className="text-white" size={20} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-indigo-700 shadow-sm">
                                {doc.type === 'nota' ? 'Nota Dinas' : doc.type === 'sppd' ? 'SPPD' : 'Perjanjian'}
                            </span>
                            <span className="text-sm font-mono text-blue-100 font-medium">v{doc.version}</span>
                        </div>
                        <h1 className="text-3xl md:text-3xl font-black tracking-tight">{doc.title}</h1>
                    </div>
                    <div className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/20 ${ui.color === 'bg-emerald-100 text-emerald-700' ? 'bg-emerald-500/20 text-emerald-50' : ui.color === 'bg-amber-100 text-amber-700' ? 'bg-amber-500/20 text-amber-50' : 'bg-white/10 text-white'}`}>
                        {ui.icon}
                        <span className="tracking-wide text-sm">{ui.label}</span>
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
                                <button onClick={() => setActiveTab('readStatus')} className={`flex-1 py-4 font-bold text-sm flex justify-center items-center gap-2 ${activeTab === 'readStatus' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <UserCheck size={18} />Status Baca ({readReceipts.length})
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
                                                        {log.new_status && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">{log.new_status}</span>}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mb-2">{new Date(log.created_at).toLocaleString()} by {log.user_name || '-'}</div>
                                                    {log.details && <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{log.details}</div>}
                                                    {log.changes_summary && <div className="text-xs text-blue-700 bg-blue-50/50 border border-blue-100 mt-2 p-2 rounded font-mono whitespace-pre-wrap">{log.changes_summary}</div>}
                                                </div>
                                            </div>
                                        ))}
                                        {logs.length === 0 && <div className="text-center text-slate-500 py-4">Belum ada riwayat</div>}
                                    </div>
                                )}

                                {activeTab === 'readStatus' && (
                                    <div className="space-y-3">
                                        {readReceipts.map(r => {
                                            const userName = r.user?.name || r.user_name || 'Pengguna';
                                            const position = r.user?.position || null;
                                            const divisi = r.user?.group_name || null;
                                            return (
                                                <div key={r.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                            {userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{userName}</div>
                                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                {position && (
                                                                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{position}</span>
                                                                )}
                                                                {divisi && (
                                                                    <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{divisi}</span>
                                                                )}
                                                                {!position && !divisi && (
                                                                    <span className="text-xs text-slate-400">-</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                                <Clock size={12} />
                                                                Dibaca: {new Date(r.read_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">
                                                        Terbaca
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {readReceipts.length === 0 && <div className="text-center text-slate-500 py-4">Dokumen belum dibaca oleh siapapun</div>}
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
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">Setujui Dokumen</h3>
                            <p className="text-slate-500 text-sm mb-4">Apakah Anda yakin ingin menyetujui dokumen ini? Anda bisa menambahkan catatan opsional.</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan opsional..." className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl mb-6 h-32 resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" />
                            <div className="flex gap-3">
                                <button onClick={() => setShowApproveModal(false)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-sm">Batal</button>
                                <button onClick={handleApprove} className="flex-1 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-200 text-sm">Setujui Dokumen</button>
                            </div>
                        </div>
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <XCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">Tolak Dokumen</h3>
                            <p className="text-slate-500 text-sm mb-4">Berikan alasan mengapa dokumen ini ditolak atau butuh revisi.</p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alasan penolakan (Wajib)..." className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl mb-6 h-32 resize-none outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm" />
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-sm">Batal</button>
                                <button onClick={handleReject} disabled={!notes.trim()} className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200 text-sm disabled:opacity-50">Tolak Dokumen</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DocumentViewer;
