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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-800 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-white font-bold text-xl">Buat Dokumen Baru</h3>
                            <p className="text-slate-400 text-sm mt-1">{cfg.label}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition" aria-label="Tutup">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Dokumen
                        </label>
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                            placeholder="Contoh: Nota Dinas Rapat Koordinasi"
                            value={documentName}
                            onChange={e => setDocumentName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onConfirm()}
                        />
                    </div>
                    <button
                        onClick={onConfirm}
                        disabled={isCreating || !documentName.trim()}
                        className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold text-sm transition hover:bg-teal-800 disabled:opacity-50 shadow-sm"
                    >
                        {isCreating ? 'Membuat...' : 'Lanjutkan ke Editor →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;
