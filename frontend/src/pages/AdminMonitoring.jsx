import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Send, Eye, RefreshCw, X, Users, Building2, User } from 'lucide-react';

const AdminMonitoring = () => {
    const [distributions, setDistributions] = useState([]);
    const [approvedDocs, setApprovedDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Distribute Wizard States
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [distForm, setDistForm] = useState({ recipientType: 'all', recipientId: '', notes: '' });

    // Details View States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [docDetails, setDocDetails] = useState(null);

    // Dependencies
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        loadData();
        // Load targets for select
        api.get('/users').then(res => setUsers(res.data.data)).catch(console.error);
        api.get('/groups').then(res => setGroups(res.data.data)).catch(console.error);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [distRes, docRes] = await Promise.all([
                api.get('/distributions/monitoring'),
                api.get('/documents', { params: { status: 'approved' } })
            ]);
            setDistributions(distRes.data.data);
            setApprovedDocs(docRes.data.data.data || docRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDistribute = async () => {
        if (distForm.recipientType !== 'all' && !distForm.recipientId) {
            return alert("Pilih target penerima!");
        }

        try {
            await api.post(`/distributions/${selectedDoc.id}`, {
                recipient_type: distForm.recipientType,
                recipient_id: distForm.recipientId || null,
                notes: distForm.notes
            });
            setShowDistributeModal(false);
            loadData();
            alert("Dokumen berhasil didistribusikan!");
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mendistribusikan dokumen");
        }
    };

    const openDetails = async (id) => {
        try {
            const res = await api.get(`/distributions/${id}`);
            setDocDetails(res.data.data);
            setShowDetailsModal(true);
        } catch (err) {
            alert("Gagal memuat detail distribusi");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Monitoring & Distribusi Final</h1>
                    <p className="text-slate-500 mt-1">Pantau penyebaran dokumen dan kelola pengiriman baru.</p>
                </div>
                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-bold text-sm border border-indigo-100">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Perbarui Data
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Memuat data...</div>
            ) : (
                <>
                    {/* Riwayat Publikasi */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                            <Eye className="text-indigo-600" /> Riwayat Publikasi Final
                        </h2>
                        {distributions.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                                Belum ada dokumen yang dipublikasikan.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {distributions.map(dist => (
                                    <div key={dist.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden">
                                        <div className="absolute -right-10 top-5 rotate-45 bg-indigo-600 text-white text-[8px] font-black py-1 px-10 shadow-sm uppercase tracking-widest">FINAL</div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <Send size={24} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-slate-900">{dist.percentage}%</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Dibaca</div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-bold text-slate-900 text-base line-clamp-1">{dist.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">Oleh: {dist.author_name}</p>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                                <span>{dist.read_count} / {dist.total_expected} Orang</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${dist.percentage}%` }}></div>
                                            </div>
                                        </div>

                                        <button onClick={() => openDetails(dist.id)} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-100">
                                            Detail Penerima
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Antrian Publikasi */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Antrian Publikasi Baru</h3>
                            <p className="text-sm text-slate-500 mt-1">Dokumen yang sudah disetujui & siap dipublikasikan.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Dokumen</th>
                                        <th className="px-6 py-4">Tipe</th>
                                        <th className="px-6 py-4">Pembuat</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {approvedDocs.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-6 text-slate-500">Tidak ada antrian dokumen</td></tr>
                                    ) : (
                                        approvedDocs.map(doc => (
                                            <tr key={doc.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{doc.title}</div>
                                                </td>
                                                <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500">{doc.type}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{doc.author?.name}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => { setSelectedDoc(doc); setShowDistributeModal(true); setDistForm({ recipientType: 'all', recipientId: '', notes: '' }); }} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">
                                                        Publikasikan
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Distribute Modal */}
            {showDistributeModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Proses Pengiriman Final</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedDoc?.title}</p>
                            </div>
                            <button onClick={() => setShowDistributeModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Pilih Sasaran Penerima</h4>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <button onClick={() => setDistForm({ ...distForm, recipientType: 'all', recipientId: '' })} className={`flex flex-col items-center p-4 border-2 rounded-xl transition ${distForm.recipientType === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                        <Users size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase">Semua User</span>
                                    </button>
                                    <button onClick={() => setDistForm({ ...distForm, recipientType: 'group', recipientId: '' })} className={`flex flex-col items-center p-4 border-2 rounded-xl transition ${distForm.recipientType === 'group' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                        <Building2 size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase">Grup / Divisi</span>
                                    </button>
                                    <button onClick={() => setDistForm({ ...distForm, recipientType: 'user', recipientId: '' })} className={`flex flex-col items-center p-4 border-2 rounded-xl transition ${distForm.recipientType === 'user' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                        <User size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase">User Spesifik</span>
                                    </button>
                                </div>

                                {distForm.recipientType === 'group' && (
                                    <select value={distForm.recipientId} onChange={e => setDistForm({ ...distForm, recipientId: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">-- Pilih Grup Target --</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                )}

                                {distForm.recipientType === 'user' && (
                                    <select value={distForm.recipientId} onChange={e => setDistForm({ ...distForm, recipientId: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">-- Pilih User Target --</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.position}</option>)}
                                    </select>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-2">Catatan Distribusi (Opsional)</h4>
                                <textarea value={distForm.notes} onChange={e => setDistForm({ ...distForm, notes: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="Instruksi tambahan..."></textarea>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button onClick={() => setShowDistributeModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">Batal</button>
                            <button onClick={handleDistribute} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Kirim Sekarang</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showDetailsModal && docDetails && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{docDetails.document?.title}</h3>
                                <p className="text-xs text-slate-500 uppercase">Laporan Keterbacaan Pegawai</p>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white text-xs font-bold text-slate-500 uppercase border-b border-slate-100 sticky top-0">
                                        <th className="px-6 py-4 bg-slate-50">Nama Pegawai</th>
                                        <th className="px-6 py-4 bg-slate-50 text-center">Status</th>
                                        <th className="px-6 py-4 bg-slate-50 text-right">Waktu Akses</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(docDetails.recipients || []).map(rec => (
                                        <tr key={rec.user_id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm">{rec.user_name}</div>
                                                <div className="text-xs text-slate-500">{rec.user_position || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {rec.is_read ? (
                                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">SUDAH BACA</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200">BELUM BACA</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-500 font-mono">
                                                {rec.read_at ? new Date(rec.read_at).toLocaleString() : '---'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!docDetails.recipients || docDetails.recipients.length === 0) && (
                                        <tr><td colSpan="3" className="text-center py-6 text-slate-500">Tidak ada penerima ditemukan</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMonitoring;
