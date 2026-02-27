import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import NotaEditor from '../components/editor/NotaEditor';
import SppdEditor from '../components/editor/SppdEditor';
import PerjanjianEditor from '../components/editor/PerjanjianEditor';
import html2pdf from 'html2pdf.js';
import { Loader2, RotateCcw } from 'lucide-react';

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
            margin: [15, 20, 15, 25],
            filename: `${(doc?.title || 'dokumen').replace(/\s+/g, '_')}.pdf`,
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
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    if (!doc) return null;

    return (
        // Exact match: Laravel line 6: "flex flex-col lg:flex-row h-screen overflow-hidden"
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">

            {/* Sidebar Input — exact match: Laravel line 9 */}
            <div className="w-full lg:w-1/3 bg-white p-0 flex flex-col border-r border-gray-200 shadow-lg z-10 h-full">

                {/* Tab Navigation — exact match: Laravel line 12-16 */}
                <div className="flex p-4 bg-gray-50 border-b gap-2">
                    <button
                        onClick={() => setActiveTab('nota')}
                        className={`flex-1 py-2 px-3 rounded font-bold border transition text-xs ${activeTab === 'nota' ? 'tab-active' : 'tab-inactive'}`}
                    >Nota Dinas</button>
                    <button
                        onClick={() => setActiveTab('sppd')}
                        className={`flex-1 py-2 px-3 rounded font-bold border transition text-xs ${activeTab === 'sppd' ? 'tab-active' : 'tab-inactive'}`}
                    >SURAT PERINTAH PERJALANAN DINAS</button>
                    <button
                        onClick={() => setActiveTab('perj')}
                        className={`flex-1 py-2 px-3 rounded font-bold border transition text-xs ${activeTab === 'perj' ? 'tab-active' : 'tab-inactive'}`}
                    >Perjanjian</button>
                </div>

                {/* Form Content — exact match: Laravel line 19 "p-6 overflow-y-auto flex-grow" */}
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    {activeTab === 'nota' && <NotaEditor formData={formData} setFormData={setFormData} />}
                    {activeTab === 'sppd' && <SppdEditor formData={formData} setFormData={setFormData} />}
                    {activeTab === 'perj' && <PerjanjianEditor formData={formData} setFormData={setFormData} />}
                </div>

                {/* Actions — exact match: Laravel line 167-174 */}
                <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
                    {/* Save (extra, not in original Laravel create — kept for usability) */}
                    {saving && (
                        <button disabled className="w-full bg-gray-400 text-white py-3 rounded font-bold flex justify-center items-center gap-2 cursor-not-allowed">
                            <Loader2 className="animate-spin" size={16} />
                            <span>MENYIMPAN...</span>
                        </button>
                    )}
                    {/* DOWNLOAD PDF — exact Laravel class match */}
                    <button
                        onClick={handleDownload}
                        className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2 cursor-pointer"
                    >
                        <span>DOWNLOAD PDF</span>
                    </button>
                    {/* AJUKAN REVIEW — not in original Laravel create page but useful for React workflow */}
                    {(doc.status === 'draft' || doc.status === 'needs_revision') && (
                        <button
                            onClick={submitForReview}
                            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 shadow flex justify-center items-center gap-2 cursor-pointer"
                        >
                            <span>AJUKAN REVIEW</span>
                        </button>
                    )}
                    {/* SIMPAN DRAFT — save button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded font-bold hover:bg-gray-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
                    >
                        <span>SIMPAN DRAFT</span>
                    </button>
                    {/* RESET ALL — exact Laravel class match */}
                    <button
                        onClick={handleReset}
                        className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded font-bold hover:bg-gray-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        <span>RESET ALL</span>
                    </button>
                </div>
            </div>

            {/* Preview Area — exact match: Laravel line 178 */}
            <div className="w-full lg:w-2/3 bg-gray-500 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                {/* Paper: class "paper relative" — exact match: Laravel line 180 */}
                <div ref={printRef} className="paper relative">
                    {/* Logo — exact match: Laravel line 182-185 */}
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
    );
};

export default DocumentEditor;
