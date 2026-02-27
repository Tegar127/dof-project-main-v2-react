import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import NotaEditor from '../components/editor/NotaEditor';
import SppdEditor from '../components/editor/SppdEditor';
import PerjanjianEditor from '../components/editor/PerjanjianEditor';
import html2pdf from 'html2pdf.js';
import { Loader2 } from 'lucide-react';

// ============================================================
// STATUS LABELS (matching Laravel getStatusLabel)
// ============================================================
function getStatusLabel(status) {
    const map = {
        draft: 'DRAFT',
        pending_review: 'MENUNGGU REVIEW',
        needs_revision: 'PERLU REVISI',
        approved: 'DISETUJUI',
        rejected: 'DITOLAK',
        sent: 'TERKIRIM',
        received: 'DITERIMA',
    };
    return map[status] || (status || 'DRAFT').toUpperCase();
}

// ============================================================
// SECTION HEADING (numbered sections matching Laravel)
// ============================================================
function SectionHeading({ number, title }) {
    return (
        <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block shrink-0"></span>
                {number}. {title}
            </h3>
            <div className="h-px bg-slate-100 flex-1"></div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [formData, setFormData] = useState({});
    const printRef = useRef(null);

    // --------------------------------------------------------
    // FETCH DOCUMENT
    // --------------------------------------------------------
    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                const data = res.data.data;
                setDoc(data);

                const cd = data.content_data || {};
                // Auto-fill defaults
                if (!cd.from) cd.from = user?.name || '';
                if (!cd.signerName) cd.signerName = user?.name || '';
                if (!cd.signerPosition) cd.signerPosition = (user?.position || '').toUpperCase();
                if (!cd.location) cd.location = 'Jakarta';
                if (!cd.date) cd.date = new Date().toISOString().split('T')[0];
                if (!cd.closing) cd.closing = 'Demikian disampaikan dan untuk dijadikan periksa.';
                if (!cd.to) cd.to = [''];
                if (!Array.isArray(cd.to)) cd.to = [cd.to];
                if (!cd.basis) cd.basis = [{ text: '', sub: [] }];
                if (!cd.basisStyle) cd.basisStyle = '1.';
                if (!cd.remembers) cd.remembers = [{ text: '', sub: [] }];
                if (!cd.ccs) cd.ccs = [];
                if (!cd.paraf) cd.paraf = [];
                setFormData(cd);
            } catch (err) {
                console.error("Failed to load document", err);
                alert("Dokumen tidak ditemukan!");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------
    const isEditable = () => {
        if (!doc) return false;
        return ['draft', 'needs_revision'].includes(doc.status) && doc.author_id === user?.id;
    };

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/documents/${id}`, {
                content_data: formData,
                status: 'draft'
            });
            alert('Dokumen berhasil disimpan!');
        } catch (err) {
            alert("Gagal menyimpan dokumen");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------------
    // DOWNLOAD PDF
    // --------------------------------------------------------
    const handleDownload = () => {
        if (!printRef.current) return;
        html2pdf()
            .set({
                margin: [15, 20, 15, 25],
                filename: `${(doc?.title || 'dokumen').replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(printRef.current)
            .save();
    };

    // --------------------------------------------------------
    // SEND / KIRIM DOKUMEN
    // --------------------------------------------------------
    const handleSend = async () => {
        try {
            await handleSave();
            await api.patch(`/documents/${id}/status`, { status: 'pending_review' });
            alert("Dokumen berhasil diajukan untuk review!");
            navigate('/');
        } catch (err) {
            alert("Gagal mengajukan review");
        }
    };

    // --------------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------------
    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-100">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    if (!doc) return null;

    const activeType = doc.type || 'nota';

    return (
        // Outer container — matching editor/index.blade.php line 6
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-200 relative">

            {/* === Floating Toggle when sidebar is closed === */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center group"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm font-bold whitespace-nowrap">BUKA PANEL EDIT</span>
                </button>
            )}

            {/* ================================================
                LEFT SIDEBAR — matching editor/index.blade.php line 195-625
            ================================================ */}
            {sidebarOpen && (
                <div className="w-full lg:w-[480px] bg-white flex flex-col border-r border-gray-200 shadow-2xl z-40 h-full flex-shrink-0 relative">

                    {/* --- Sidebar Toolbar (line 207-224) --- */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"
                                title="Dashboard"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div className="h-6 w-px bg-gray-100"></div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Tutup Sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving || !isEditable()}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                {saving && <Loader2 className="animate-spin h-4 w-4" />}
                                <span>{saving ? 'MENYIMPAN...' : 'SIMPAN'}</span>
                            </button>
                        </div>
                    </div>

                    {/* --- Sidebar Header Info (line 226-235) --- */}
                    <div className="px-8 py-6 bg-slate-50/80 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter">
                                {activeType === 'sppd' ? 'SURAT PERINTAH PERJALANAN DINAS' : activeType === 'nota' ? 'NOTA DINAS' : 'PERJANJIAN'}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                {getStatusLabel(doc.status)}
                            </span>
                            <div className="flex-1"></div>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                                v{doc.version || '1.0'}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.title || doc.title || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            disabled={!isEditable()}
                            className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-indigo-500 p-0 text-2xl font-black text-slate-800 placeholder-slate-300 focus:ring-0 transition-all hover:border-slate-200 focus:outline-none"
                            placeholder="Judul Dokumen..."
                        />
                    </div>

                    {/* --- Sidebar Form Content (line 237-624) --- */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                        <div className="p-8 space-y-10">
                            <fieldset disabled={!isEditable()} className="space-y-10">

                                {/* Nota Dinas Form */}
                                {activeType === 'nota' && (
                                    <NotaEditor formData={formData} setFormData={setFormData} />
                                )}
                                {/* SPPD Form */}
                                {activeType === 'sppd' && (
                                    <SppdEditor formData={formData} setFormData={setFormData} />
                                )}
                                {/* Perjanjian Form */}
                                {activeType === 'perj' && (
                                    <PerjanjianEditor formData={formData} setFormData={setFormData} />
                                )}

                            </fieldset>

                            {/* --- Bottom Actions (line 519-622) --- */}
                            <div className="mt-4 pt-10 border-t border-gray-100 pb-20 lg:pb-6 space-y-6">

                                {/* Deadline Setting */}
                                {(doc.status === 'draft' || doc.status === 'needs_revision') && (
                                    <div className="mb-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-indigo-800 mb-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">Batas Waktu (Opsional)</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="datetime-local"
                                                value={formData.deadline || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-xs font-bold transition-all outline-none"
                                            />
                                            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter ml-1">
                                                {!formData.deadline ? 'Tidak ada deadline yang diatur' : `Deadline: ${formData.deadline}`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {/* KIRIM DOKUMEN (draft / needs_revision) */}
                                    {(doc.status === 'draft' || doc.status === 'needs_revision') && isEditable() && (
                                        <button
                                            onClick={handleSend}
                                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group flex items-center justify-center gap-3"
                                        >
                                            <span>KIRIM DOKUMEN</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Download PDF */}
                                    <button
                                        onClick={handleDownload}
                                        className="w-full bg-white text-slate-700 border-2 border-slate-100 py-4 rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-slate-50 transition-all hover:border-slate-200 group"
                                    >
                                        <svg className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================
                RIGHT PREVIEW AREA — matching line 627-856
            ================================================ */}
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-200 custom-scrollbar">
                <div ref={printRef} className="paper shadow-lg relative min-h-[297mm]">
                    {/* Logo */}
                    <div className="flex items-center mb-2">
                        <img src="/logo_asa.png" alt="ASABRI Logo" className="h-16 mb-2" />
                    </div>

                    {/* Document Preview */}
                    {activeType === 'nota' && <NotaEditor.Preview formData={formData} />}
                    {activeType === 'sppd' && <SppdEditor.Preview formData={formData} />}
                    {activeType === 'perj' && <PerjanjianEditor.Preview formData={formData} />}
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
