import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Filter, FileText, CheckCircle, Clock, XCircle, Mail, Folder } from 'lucide-react';

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/documents');
            // The API returns paginated data (res.data.data.data) or a flat array depending on the knex setup
            const docs = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user?.role === 'admin';

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.data?.docNumber && doc.data.docNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (doc.author?.name && doc.author.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || doc.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusUI = (status) => {
        switch (status) {
            case 'approved': return { color: 'bg-emerald-100 text-emerald-700', label: 'Disetujui', icon: <CheckCircle size={14} /> };
            case 'rejected': return { color: 'bg-red-100 text-red-700', label: 'Ditolak', icon: <XCircle size={14} /> };
            case 'pending_review': return { color: 'bg-amber-100 text-amber-700', label: 'Menunggu', icon: <Clock size={14} /> };
            case 'sent':
            case 'received': return { color: 'bg-indigo-600 text-white', label: 'FINAL', icon: <Mail size={14} /> };
            case 'draft': return { color: 'bg-slate-100 text-slate-700', label: 'Draft', icon: <FileText size={14} /> };
            default: return { color: 'bg-slate-100 text-slate-700', label: status, icon: <FileText size={14} /> };
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Hapus dokumen "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await api.delete(`/documents/${id}`);
            loadDocuments();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus dokumen');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isAdmin ? 'Arsip Seluruh Dokumen' : 'Dokumen Saya'}</h1>
                    <p className="text-slate-500">{isAdmin ? 'Database pusat seluruh dokumen di dalam sistem.' : 'Kumpulan daftar seluruh dokumen Anda.'}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari judul, nomor, atau author..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="all">Semua Tipe</option>
                            <option value="nota">Nota Dinas</option>
                            <option value="sppd">SPPD</option>
                            <option value="perjanjian">Perjanjian</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="all">Semua Status</option>
                            <option value="approved">Disetujui</option>
                            <option value="pending_review">Menunggu Review</option>
                            <option value="sent">Final (Terkirim)</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Informasi Dokumen</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Author</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Memuat Dokumen...</td></tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Tidak ada dokumen ditemukan</td></tr>
                            ) : (
                                filteredDocs.map(doc => {
                                    const statusUi = getStatusUI(doc.status);
                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm mb-0.5">{doc.title}</div>
                                                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                                    {doc.data?.docNumber || doc.content_data?.docNumber || 'NON-REF'}
                                                    {doc.folder && <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"><Folder size={10} /> {doc.folder.name}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">
                                                {doc.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {doc.author?.name || doc.author_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusUi.color}`}>
                                                    {statusUi.icon}
                                                    {statusUi.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/documents/${doc.id}/view`} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Lihat">
                                                        <FileText size={18} />
                                                    </Link>
                                                    {((doc.author_id === user?.id && doc.status !== 'approved' && doc.status !== 'sent') || isAdmin) && (
                                                        <button onClick={() => handleDelete(doc.id, doc.title)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium">
                    Total: {filteredDocs.length} dokumen
                </div>
            </div>
        </div>
    );
};

export default Documents;
