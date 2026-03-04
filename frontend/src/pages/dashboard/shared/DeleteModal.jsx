import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Modal: Confirm document deletion.
 * Props:
 *  - doc     : document object { title }
 *  - onConfirm: () => void
 *  - onClose  : () => void
 */
const DeleteModal = ({ doc, onConfirm, onClose }) => (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={26} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Hapus Dokumen?</h3>
            <p className="text-gray-500 text-sm mb-6">
                Anda yakin ingin menghapus{' '}
                <strong className="text-gray-700">"{doc?.title}"</strong>?
                Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold text-sm transition"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold text-sm transition shadow-sm"
                >
                    Ya, Hapus
                </button>
            </div>
        </div>
    </div>
);

export default DeleteModal;
