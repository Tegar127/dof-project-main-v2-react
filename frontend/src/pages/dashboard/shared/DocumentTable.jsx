import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
    FileText, Search, Filter, Eye, Edit3, Trash2, Send,
} from 'lucide-react';
import { getStatusLabel, getStatusConfig, getDocTypeConfig } from './helpers';

/**
 * Documents table with search + filter bar.
 * Props:
 *  - documents      : filtered array of doc objects
 *  - searchTerm, setSearchTerm
 *  - typeFilter, setTypeFilter
 *  - dateFrom, setDateFrom
 *  - dateTo, setDateTo
 *  - showFilters, setShowFilters
 *  - user           : AuthContext user (for action button logic)
 *  - isDocEditable  : (doc, user) => bool
 *  - onDelete       : (doc) => void
 *  - onDistribute   : (doc) => void  — optional, admin only
 */
const DocumentTable = ({
    documents,
    searchTerm, setSearchTerm,
    typeFilter, setTypeFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    showFilters, setShowFilters,
    user,
    isDocEditable,
    onDelete,
    onDistribute,
}) => {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* ── Table Header / Filters ── */}
            <div className="p-5 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="font-black text-gray-900 text-base flex items-center gap-2">
                        <FileText size={18} className="text-violet-500" />
                        Daftar Dokumen
                        <span className="ml-1 px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">
                            {documents.length}
                        </span>
                    </h2>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari dokumen..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all
                                ${showFilters ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                            <Filter size={14} />
                            Filter
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tipe Dokumen</label>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="nota">Nota Dinas</option>
                                <option value="sppd">SPPD</option>
                                <option value="perj">Perjanjian</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Table Body ── */}
            <div className="overflow-x-auto">
                {documents.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">Tidak ada dokumen ditemukan</p>
                        <p className="text-xs text-gray-300 mt-1">Coba ubah filter pencarian Anda</p>
                    </div>
                ) : (
                    <table className="w-full min-w-[720px]">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dokumen</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipe</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {documents.map(doc => {
                                const docCfg = getDocTypeConfig(doc.type);
                                const statusCfg = getStatusConfig(doc.status);

                                return (
                                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors group">
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${docCfg.light}`}>
                                                    {docCfg.short}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-800 text-sm group-hover:text-violet-600 transition-colors truncate max-w-[200px]">
                                                        {doc.title}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                        {doc.content_data?.docNumber || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${docCfg.light}`}>
                                                {docCfg.label}
                                            </span>
                                        </td>
                                        {/* Date */}
                                        <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                                            {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: id })}
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} shrink-0`} />
                                                {getStatusLabel(doc.status, doc)}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/documents/${doc.id}/view`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition"
                                                >
                                                    <Eye size={13} />
                                                    Detail
                                                </Link>

                                                {/* Admin: Distribute button */}
                                                {onDistribute && user?.role === 'admin' && (doc.status === 'approved' || doc.status === 'sent') && (
                                                    <button
                                                        onClick={() => onDistribute(doc)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
                                                    >
                                                        <Send size={13} />
                                                        Distribusi
                                                    </button>
                                                )}

                                                {/* Edit button */}
                                                {isDocEditable(doc, user) && (
                                                    <Link
                                                        to={`/documents/${doc.id}/edit`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition shadow-sm shadow-violet-200"
                                                    >
                                                        <Edit3 size={13} />
                                                        Edit
                                                    </Link>
                                                )}

                                                {/* Delete button — only for author, non-approved */}
                                                {user?.id === doc.author_id && doc.status !== 'approved' && (
                                                    <button
                                                        onClick={() => onDelete(doc)}
                                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DocumentTable;
