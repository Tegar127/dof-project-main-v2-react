import React, { useState } from 'react';
import {
    Users, UsersRound, FileText, ArrowLeft, Search, RefreshCw, Eye, Trash2, Send
} from 'lucide-react';
import api from '../../utils/api';

/* ── Distribution Cards (Monitoring) ── */
const DistributionCards = ({ distributions, onViewDetails }) => {
    const finalized = distributions.filter(d => ['sent', 'received'].includes(d.status));

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
                <FileText size={20} className="text-indigo-600" />
                Riwayat Publikasi Final
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalized.map(dist => (
                    <div key={dist.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden">
                        {/* Final Badge */}
                        <div className="absolute -right-10 top-5 rotate-45 bg-indigo-600 text-white text-[8px] font-black py-1 px-10 shadow-sm uppercase tracking-widest">FINAL</div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <FileText size={24} />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">{dist.percentage}%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Dibaca</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-bold text-slate-900 text-base line-clamp-1">{dist.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Oleh: {dist.author_name}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>{dist.read_count} / {dist.total_expected} Orang</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${dist.percentage}%` }}></div>
                            </div>
                        </div>

                        <button onClick={() => onViewDetails(dist.id)} className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-100">
                            Detail Penerima
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ── Approved Docs Queue ── */
const ApprovedQueue = ({ docs, onDistribute }) => {
    const [search, setSearch] = useState('');
    const filtered = docs.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Antrian Publikasi Baru</h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Dokumen yang sudah disetujui & siap dipublikasikan.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari dokumen..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th className="px-8 py-4">Judul Dokumen</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Tipe</th>
                            <th className="px-8 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-900 text-sm">{doc.title}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{doc.content_data?.docNumber || doc.data?.docNumber || 'No-Ref'}</div>
                                </td>
                                <td className="px-6 py-5 text-sm text-slate-700 font-medium">{doc.author?.name || doc.author_name || '-'}</td>
                                <td className="px-6 py-5"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{doc.type || '-'}</span></td>
                                <td className="px-8 py-5 text-right">
                                    <button onClick={() => onDistribute(doc)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                                        Publikasikan
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ── Distribute Wizard ── */
const DistributeWizard = ({ doc, groups, users, onConfirm, onCancel }) => {
    const [form, setForm] = useState({ recipientType: 'all', recipientId: null, notes: '' });

    const handleSubmit = () => {
        if (form.recipientType !== 'all' && !form.recipientId) return;
        onConfirm(doc, form);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Proses Pengiriman Final</h3>
                            <p className="text-sm text-slate-500 font-medium">{doc?.title}</p>
                        </div>
                    </div>
                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">{doc?.type || 'DOC'}</span>
                </div>

                <div className="p-10 space-y-10">
                    {/* Step 1: Select Target */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <h4 className="font-bold text-slate-800">Pilih Sasaran Penerima</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'all', icon: <UsersRound size={32} />, label: 'Semua User' },
                                { id: 'group', icon: <Users size={32} />, label: 'Grup / Divisi' },
                                { id: 'user', icon: <Send size={32} />, label: 'User Spesifik' },
                            ].map(opt => (
                                <button key={opt.id} onClick={() => setForm({ ...form, recipientType: opt.id, recipientId: null })}
                                    className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-all ${form.recipientType === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500'}`}>
                                    {opt.icon}
                                    <span className="text-xs font-bold uppercase mt-2">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        {form.recipientType !== 'all' && (
                            <div className="pt-4">
                                <select value={form.recipientId || ''} onChange={e => setForm({ ...form, recipientId: e.target.value })} className="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none shadow-sm">
                                    <option value="">-- Pilih Target Penerima --</option>
                                    {form.recipientType === 'group'
                                        ? groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                                        : users.map(u => <option key={u.id} value={u.id}>{u.name} ({(u.position || 'Staff').toUpperCase()})</option>)
                                    }
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <h4 className="font-bold text-slate-800">Catatan Distribusi</h4>
                        </div>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm" rows="3" placeholder="Tulis instruksi atau catatan tambahan di sini..." />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">Konfirmasi & Kirim Sekarang</button>
                        <button onClick={onCancel} className="px-8 py-4 bg-white text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all border border-slate-200">Batal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Distribution Details View ── */
const DistributionDetails = ({ details, onBack, formatDate }) => {
    if (!details) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase transition-all">
                    <ArrowLeft size={20} /> Kembali
                </button>
                <div className="text-right">
                    <h4 className="font-bold text-slate-900">{details.document?.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">Laporan Keterbacaan Pegawai</p>
                </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                                <th className="px-8 py-5">Nama Pegawai</th>
                                <th className="px-6 py-5">Jabatan</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Waktu Diakses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(details.recipients || []).map(rec => (
                                <tr key={rec.user_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-900">{rec.user_name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">USER ID: {rec.user_id}</div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-xs text-slate-500 font-bold capitalize">{rec.user_position || 'Staff'}</span></td>
                                    <td className="px-6 py-5 text-center">
                                        {rec.is_read
                                            ? <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">SUDAH BACA</span>
                                            : <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">BELUM BACA</span>
                                        }
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-slate-500 font-mono font-bold">{rec.read_at ? formatDate(rec.read_at) : '---'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ── Exported Tab Component ── */
const DistributionsTab = ({ distributions, groups, users, showNotif, formatDate, onRefresh }) => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docDetails, setDocDetails] = useState(null);
    const [approvedDocs, setApprovedDocs] = useState([]);

    // Load approved documents on mount
    React.useEffect(() => {
        loadApproved();
    }, []);

    const loadApproved = async () => {
        try {
            const res = await api.get('/documents', { params: { status: 'approved' } });
            const docs = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
            const approved = docs.filter(d => {
                const st = typeof d.status === 'object' ? d.status.value : d.status;
                return st === 'approved';
            });
            setApprovedDocs(approved);
        } catch { /* ignore */ }
    };

    const handleDistribute = (doc) => {
        setSelectedDoc(doc);
        setViewMode('distribute');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmDistribute = async (doc, form) => {
        try {
            await api.post(`/distributions/${doc.id}`, {
                recipients: [{ type: form.recipientType, id: form.recipientId }],
                notes: form.notes
            });
            showNotif('Dokumen berhasil didistribusikan');
            setViewMode('list');
            onRefresh();
            loadApproved();
        } catch (err) {
            showNotif(err.response?.data?.message || 'Error distributing document', 'error');
        }
    };

    const handleViewDetails = async (docId) => {
        try {
            const res = await api.get(`/distributions/${docId}`);
            setDocDetails(res.data.data || res.data);
            setViewMode('details');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            showNotif('Error loading distribution details', 'error');
        }
    };

    const closeView = () => {
        setViewMode('list');
        setSelectedDoc(null);
        setDocDetails(null);
    };

    if (viewMode === 'distribute') {
        return <DistributeWizard doc={selectedDoc} groups={groups} users={users} onConfirm={handleConfirmDistribute} onCancel={closeView} />;
    }

    if (viewMode === 'details') {
        return <DistributionDetails details={docDetails} onBack={closeView} formatDate={formatDate} />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        Sistem Publikasi Dokumen
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Monitoring & Distribusi Final</h2>
                    <p className="text-slate-500 font-medium text-sm">Pantau penyebaran dokumen dan kelola pengiriman baru dengan mudah.</p>
                </div>
                <button onClick={() => { onRefresh(); loadApproved(); }} className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
                    <RefreshCw size={18} /> Perbarui Data
                </button>
            </div>

            {/* Distribution Monitoring Cards */}
            <DistributionCards distributions={distributions} onViewDetails={handleViewDetails} />

            {/* Approved Documents Queue */}
            <ApprovedQueue docs={approvedDocs} onDistribute={handleDistribute} />
        </div>
    );
};

export default DistributionsTab;
