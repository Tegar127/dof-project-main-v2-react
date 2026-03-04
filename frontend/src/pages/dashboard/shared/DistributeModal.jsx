import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal: Distribute a finalized document.
 * Props:
 *  - doc              : document object { title }
 *  - distributeType   : 'all' | 'group' | 'user'
 *  - setDistributeType: setter
 *  - distributeId     : string
 *  - setDistributeId  : setter
 *  - distributeNotes  : string
 *  - setDistributeNotes: setter
 *  - groups           : array of group objects
 *  - users            : array of user objects
 *  - onConfirm        : () => void
 *  - onClose          : () => void
 */
const DistributeModal = ({
    doc,
    distributeType, setDistributeType,
    distributeId, setDistributeId,
    distributeNotes, setDistributeNotes,
    groups, users,
    onConfirm, onClose,
}) => (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-white font-black text-xl">Distribusikan Dokumen</h3>
                        <p className="text-emerald-100 text-xs mt-1 line-clamp-1">{doc?.title}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {/* Recipient type */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipe Penerima</label>
                    <select
                        value={distributeType}
                        onChange={e => setDistributeType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    >
                        <option value="all">Semua User</option>
                        <option value="group">Grup Spesifik</option>
                        <option value="user">User Spesifik</option>
                    </select>
                </div>

                {/* Group picker */}
                {distributeType === 'group' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Grup</label>
                        <select
                            value={distributeId}
                            onChange={e => setDistributeId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        >
                            <option value="">Pilih Grup...</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                )}

                {/* User picker */}
                {distributeType === 'user' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih User</label>
                        <select
                            value={distributeId}
                            onChange={e => setDistributeId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        >
                            <option value="">Pilih User...</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.position})</option>)}
                        </select>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catatan (Opsional)</label>
                    <textarea
                        value={distributeNotes}
                        onChange={e => setDistributeNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                        rows="3"
                        placeholder="Tambahkan catatan distribusi..."
                    />
                </div>

                <button
                    onClick={onConfirm}
                    disabled={distributeType !== 'all' && !distributeId}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-emerald-200"
                >
                    Distribusikan Sekarang
                </button>
            </div>
        </div>
    </div>
);

export default DistributeModal;
