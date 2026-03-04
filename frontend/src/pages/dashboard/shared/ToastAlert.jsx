import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Toast notification popup.
 * Props: toast = { message: string, type: 'success' | 'error' } | null
 */
const ToastAlert = ({ toast }) => {
    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className="fixed top-6 right-6 z-[200] animate-fade-in-up">
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold
                ${isSuccess
                    ? 'bg-white border-emerald-100 text-emerald-700 shadow-emerald-100'
                    : 'bg-white border-red-100 text-red-700 shadow-red-100'}`}
            >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isSuccess ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                </div>
                {toast.message}
            </div>
        </div>
    );
};

export default ToastAlert;
