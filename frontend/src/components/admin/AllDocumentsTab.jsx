import React, { useState } from 'react';
import { Search, Eye, Trash2, FileText } from 'lucide-react';

const AllDocumentsTab = ({ documents, onDeleteDoc, formatDate }) => {
    const [search, setSearch] = useState('');

    // Only include Approved and Final (Sent/Received) statuses — matches Laravel logic
    const archiveDocs = documents.filter(d => {
        const status = typeof d.status === 'object' ? d.status.value : d.status;
        return ['approved', 'sent', 'received'].includes(status);
    });

    const filtered = archiveDocs.filter(d => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            d.title?.toLowerCase().includes(s) ||
            (d.content_data?.docNumber || d.data?.docNumber || '').toLowerCase().includes(s) ||
            (d.author?.name || d.author_name || '').toLowerCase().includes(s)
        );
    });

    const getStatusUI = (status) => {
        const st = typeof status === 'object' ? status.value : status;
        if (['sent', 'received'].includes(st)) return { cls: 'bg-indigo-600 text-white', label: 'FINAL' };
        return { cls: 'bg-slate-100 text-slate-600', label: typeof status === 'object' ? status.label : status };
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Arsip Approved & Final</h3>
                    <p className="text-xs text-slate-500 font-medium">Kumpulan seluruh dokumen yang sudah disetujui atau sudah didistribusikan.</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul, nomor, author..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th className="px-8 py-4">Informasi Dokumen</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Waktu Dibuat</th>
                            <th className="px-8 py-4 text-right">Kelola</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-slate-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Belum ada dokumen arsip.</p>
                                </td>
                            </tr>
                        ) : filtered.map(doc => {
                            const st = getStatusUI(doc.status);
                            return (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-900 text-sm">{doc.title}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{doc.content_data?.docNumber || doc.data?.docNumber || 'NON-REF'}</div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-700 font-medium">{doc.author?.name || doc.author_name || '-'}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm ${st.cls}`}>{st.label}</span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">{formatDate(doc.created_at)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={`/documents/${doc.id}/view`} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-200"><Eye size={16} /></a>
                                            <button onClick={() => onDeleteDoc(doc.id, doc.title)} className="p-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-slate-200"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllDocumentsTab;
