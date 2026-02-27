import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import NotaEditor from '../components/editor/NotaEditor';
import SppdEditor from '../components/editor/SppdEditor';
import PerjanjianEditor from '../components/editor/PerjanjianEditor';
import html2pdf from 'html2pdf.js';
import { Save, Download, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';

const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tab state for the sidebar, matching Laravel's 3-tab layout
    const [activeTab, setActiveTab] = useState('nota');

    // Form State holds all the specific data for the document type
    const [formData, setFormData] = useState({});

    const printRef = useRef(null);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                const data = res.data.data;
                setDoc(data);

                // Set active tab based on document type
                setActiveTab(data.type || 'nota');

                // Initialize form with existing content_data
                // Auto-fill from user data for new docs (content_data empty)
                const cd = data.content_data || {};
                if (!cd.from) cd.from = user?.name || '';
                if (!cd.name && !cd.signerName) cd.name = user?.name || '';
                if (!cd.pos && !cd.signerPosition) cd.pos = (user?.position || '').toUpperCase();
                if (!cd.div) cd.div = (user?.group_name || '').toUpperCase();
                if (!cd.loc) cd.loc = 'Jakarta';
                if (!cd.date) cd.date = new Date().toISOString().split('T')[0];
                if (!cd.signDate) cd.signDate = new Date().toISOString().split('T')[0];
                if (!cd.closing) cd.closing = 'Demikian disampaikan dan untuk dijadikan periksa.';

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
    }, [id, navigate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/documents/${id}`, {
                content_data: formData,
                status: 'draft'
            });
            alert('Dokumen berhasil disimpan!');
        } catch (err) {
            console.error("Failed to save", err);
            alert("Gagal menyimpan dokumen");
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = () => {
        if (!printRef.current) return;
        const element = printRef.current;
        const opt = {
            margin: [15, 15, 15, 15],
            filename: `${doc.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleReset = () => {
        if (confirm('Reset semua input? Data yang belum disimpan akan hilang.')) {
            setFormData({
                from: user?.name || '',
                name: user?.name || '',
                pos: (user?.position || '').toUpperCase(),
                div: (user?.group_name || '').toUpperCase(),
                loc: 'Jakarta',
                date: new Date().toISOString().split('T')[0],
                signDate: new Date().toISOString().split('T')[0],
                closing: 'Demikian disampaikan dan untuk dijadikan periksa.',
            });
        }
    };

    const submitForReview = async () => {
        try {
            await handleSave();
            await api.patch(`/documents/${id}/status`, { status: 'pending_review' });
            alert("Dokumen berhasil diajukan untuk review!");
            navigate('/');
        } catch (err) {
            console.error("Failed to submit", err);
            alert("Gagal mengajukan review");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[50vh]">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    if (!doc) return null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">

            {/* Split View matching Laravel: flex h-screen */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Sidebar - w-1/3 matching Laravel */}
                <div className="w-full lg:w-1/3 bg-white flex flex-col border-r border-gray-200 shadow-lg z-10 h-full">

                    {/* Tab Navigation - matching Laravel create.blade.php line 12-16 */}
                    <div className="flex p-4 bg-gray-50 border-b gap-2 items-center">
                        <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors mr-1" title="Kembali ke Dashboard">
                            <ArrowLeft size={18} />
                        </button>
                        <button onClick={() => setActiveTab('nota')} className={activeTab === 'nota' ? 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs' : 'flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs'}>Nota Dinas</button>
                        <button onClick={() => setActiveTab('sppd')} className={activeTab === 'sppd' ? 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs' : 'flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs'}>SURAT PERINTAH PERJALANAN DINAS</button>
                        <button onClick={() => setActiveTab('perj')} className={activeTab === 'perj' ? 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs' : 'flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs'}>Perjanjian</button>
                    </div>

                    {/* Form Content - overflow scroll, matching Laravel p-6 overflow-y-auto */}
                    <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                        {activeTab === 'nota' && <NotaEditor formData={formData} setFormData={setFormData} />}
                        {activeTab === 'sppd' && <SppdEditor formData={formData} setFormData={setFormData} />}
                        {activeTab === 'perj' && <PerjanjianEditor formData={formData} setFormData={setFormData} />}
                    </div>

                    {/* Bottom Actions - matching Laravel create.blade.php line 167-174 */}
                    <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 shadow flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            <span>{saving ? 'MENYIMPAN...' : 'SIMPAN DRAFT'}</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2 cursor-pointer"
                        >
                            <Download size={16} />
                            <span>DOWNLOAD PDF</span>
                        </button>
                        {(doc.status === 'draft' || doc.status === 'needs_revision') && doc.author_id === user?.id && (
                            <button
                                onClick={submitForReview}
                                className="w-full bg-emerald-600 text-white py-2.5 rounded font-bold hover:bg-emerald-700 shadow flex justify-center items-center gap-2 cursor-pointer text-sm"
                            >
                                <span>AJUKAN REVIEW</span>
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded font-bold hover:bg-gray-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>RESET ALL</span>
                        </button>
                    </div>
                </div>

                {/* Right Preview Area - matching Laravel: w-2/3 bg-gray-500 overflow-y-auto p-8 */}
                <div className="w-full lg:w-2/3 bg-gray-500 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                    <div
                        ref={printRef}
                        className="bg-white shadow-2xl relative paper"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '20mm',
                            fontFamily: 'Times New Roman, serif',
                        }}
                    >
                        {/* ASABRI Header matching Laravel */}
                        <div className="flex items-center mb-2">
                            <img src="/logo_asa.png" alt="ASABRI Logo" className="h-16 mb-2" />
                        </div>

                        {/* Preview based on active tab */}
                        {activeTab === 'nota' && <NotaEditor.Preview formData={formData} />}
                        {activeTab === 'sppd' && <SppdEditor.Preview formData={formData} />}
                        {activeTab === 'perj' && <PerjanjianEditor.Preview formData={formData} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
