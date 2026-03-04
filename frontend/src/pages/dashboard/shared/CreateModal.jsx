import React from 'react';
import { X } from 'lucide-react';
import { getDocTypeConfig } from './helpers';

/**
 * Modal: Create new document.
 * Props:
 *  - documentType  : 'nota' | 'sppd' | 'perj'
 *  - documentName  : string
 *  - setDocumentName: setter
 *  - isCreating    : boolean
 *  - onConfirm     : () => void
 *  - onClose       : () => void
 */
const CreateModal = ({ documentType, documentName, setDocumentName, isCreating, onConfirm, onClose }) => {
    const cfg = getDocTypeConfig(documentType);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-white font-black text-xl">Buat Dokumen Baru</h3>
                            <p className="text-violet-200 text-sm mt-1">{cfg.label}</p>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Nama Dokumen
                        </label>
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                            placeholder="Contoh: Nota Dinas Rapat Koordinasi"
                            value={documentName}
                            onChange={e => setDocumentName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onConfirm()}
                        />
                    </div>
                    <button
                        onClick={onConfirm}
                        disabled={isCreating || !documentName.trim()}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-200"
                    >
                        {isCreating ? 'Membuat...' : 'Lanjutkan ke Editor →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;
