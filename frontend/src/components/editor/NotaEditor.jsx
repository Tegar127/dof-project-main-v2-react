import React, { useState } from 'react';
import SignatureModal from './SignatureModal';
import QuillEditor from './QuillEditor';
import api from '../../utils/api';

// ===========================================================
// NOTA EDITOR — matches editor/index.blade.php sidebar
// Sections: 1. Identitas & Pertimbangan, 2. Penerima & Instruksi,
//           3. Isi Konten Utama, 4. Pengesahan & Paraf
// ===========================================================

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

// ─── Modal Ubah Nomor Surat ──────────────────────────────────────────────────
// Nomor tidak bisa diedit langsung. Perubahan WAJIB disertai alasan yang akan
// tercatat di log riwayat dokumen.
function GenerateNumberModal({ currentNumber, onClose, onGenerate }) {
    const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const [classification, setClassification] = useState('PR.04.01');
    const [unit, setUnit] = useState('E');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [reason, setReason] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const buildPreview = (cls, unt, dateStr) => {
        const d = dateStr ? new Date(dateStr) : new Date();
        const roman = ROMAN[d.getMonth()];
        const yr = d.getFullYear();
        return `ND-???/${(cls||'PR.04.01').toUpperCase()}/${(unt||'E').toUpperCase()}/${roman}/${yr}`;
    };

    const handleConfirm = async () => {
        if (!reason.trim()) {
            setError('Alasan perubahan nomor wajib diisi!');
            return;
        }
        setGenerating(true);
        setError('');
        try {
            const res = await api.get('/documents/generate-number', {
                params: { type: 'nota', classification, unit, date: selectedDate }
            });
            const newNumber = res.data?.data?.docNumber || res.data?.docNumber;
            if (!newNumber) throw new Error('Response tidak valid dari server');
            onGenerate({ number: newNumber, reason: reason.trim() });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal memperbarui nomor.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Ubah Nomor Surat</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Perubahan akan dicatat dalam log riwayat dokumen.</p>
                    </div>
                </div>

                {/* Nomor saat ini */}
                {currentNumber && (
                    <div className="mb-5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Nomor Saat Ini</p>
                        <p className="font-mono font-bold text-slate-700 text-sm">{currentNumber}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Row: Klasifikasi + Unit */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Kode Klasifikasi</label>
                            <input type="text" value={classification}
                                onChange={e => setClassification(e.target.value)}
                                placeholder="PR.04.01"
                                className="w-full px-3 py-2.5 border-2 border-slate-100 rounded-xl text-sm font-bold bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono"
                            />
                            <p className="text-[9px] text-slate-400 font-bold">Contoh: PR.04.01</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Kode Unit</label>
                            <input type="text" value={unit}
                                onChange={e => setUnit(e.target.value)}
                                placeholder="E"
                                className="w-full px-3 py-2.5 border-2 border-slate-100 rounded-xl text-sm font-bold bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono"
                            />
                            <p className="text-[9px] text-slate-400 font-bold">Contoh: A · B · E</p>
                        </div>
                    </div>

                    {/* Tanggal Surat */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
                            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Tanggal Surat
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl text-sm font-bold bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                        />
                        <p className="text-[9px] text-slate-400 font-bold">Bulan & tahun dari tanggal ini akan digunakan dalam nomor surat</p>
                    </div>

                    {/* Preview Dinamis */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Preview Format</p>
                        <p className="font-mono font-bold text-indigo-800 text-sm tracking-wide">{buildPreview(classification, unit, selectedDate)}</p>
                        <p className="text-[9px] text-indigo-400 mt-1">??? = nomor urut di-generate dari server berdasarkan tahun yang dipilih</p>
                    </div>

                    {/* Alasan Perubahan (wajib) */}
                    <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Alasan Perubahan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => { setReason(e.target.value); setError(''); }}
                            rows={3}
                            placeholder="Jelaskan alasan perubahan nomor surat ini... (wajib diisi, akan tercatat di log)"
                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all resize-none ${!reason.trim() && error ? 'border-red-400 focus:border-red-400' : 'border-amber-100 focus:border-amber-400'}`}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-red-600 font-bold">{error}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-7">
                    <button onClick={onClose}
                        className="flex-1 py-3.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                        Batal
                    </button>
                    <button onClick={handleConfirm} disabled={generating}
                        className="flex-1 py-3.5 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2 disabled:opacity-60">
                        {generating ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── NotaEditor ──────────────────────────────────────────────────────────────
const NotaEditor = ({ formData, setFormData, readOnly = false }) => {
    const [sigModal, setSigModal] = useState({ isOpen: false, target: null, title: '' });
    const [showGenModal, setShowGenModal] = useState(false);
    const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    // ---- Basis  ----
    const addBasis = () => setField('basis', [...(formData.basis || []), { text: '', sub: [] }]);
    const removeBasis = (i) => {
        const b = [...(formData.basis || [])]; b.splice(i, 1); setField('basis', b);
    };
    const changeBasis = (i, val) => {
        const b = [...(formData.basis || [])];
        b[i] = { ...(typeof b[i] === 'string' ? { text: b[i], sub: [] } : b[i]), text: val };
        setField('basis', b);
    };
    const addSub = (i) => {
        const b = [...(formData.basis || [])];
        b[i] = { ...(typeof b[i] === 'string' ? { text: b[i], sub: [] } : b[i]) };
        b[i].sub = [...(b[i].sub || []), ''];
        setField('basis', b);
    };
    const changeSub = (pi, si, val) => {
        const b = [...(formData.basis || [])];
        const subs = [...(b[pi].sub || [])]; subs[si] = val;
        b[pi] = { ...b[pi], sub: subs }; setField('basis', b);
    };
    const removeSub = (pi, si) => {
        const b = [...(formData.basis || [])];
        const subs = [...(b[pi].sub || [])]; subs.splice(si, 1);
        b[pi] = { ...b[pi], sub: subs }; setField('basis', b);
    };

    // ---- Recipients (to) ----
    const addTo = () => setField('to', [...(formData.to || ['']), '']);
    const removeTo = (i) => {
        const t = [...(formData.to || [])]; t.splice(i, 1); setField('to', t);
    };
    const changeTo = (i, val) => {
        const t = [...(formData.to || [])]; t[i] = val; setField('to', t);
    };

    // ---- CCs (tembusan) ----
    const addCc = () => setField('ccs', [...(formData.ccs || []), '']);
    const removeCc = (i) => {
        const c = [...(formData.ccs || [])]; c.splice(i, 1); setField('ccs', c);
    };
    const changeCc = (i, val) => {
        const c = [...(formData.ccs || [])]; c[i] = val; setField('ccs', c);
    };

    const basisList = formData.basis || [{ text: '', sub: [] }];
    const toList = Array.isArray(formData.to) ? formData.to : [formData.to || ''];
    const ccList = formData.ccs || [];

    return (
        <div className="space-y-10">

            {/* === 1. IDENTITAS & PERTIMBANGAN === */}
            <div className="space-y-6">
                <SectionHeading number="1" title="Identitas & Pertimbangan" />
                <div className="space-y-5">
                    {/* Nomor Dokumen */}
                    <div className="group space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="form-label-styled">Nomor Dokumen</label>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Otomatis
                                </span>
                            </div>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => setShowGenModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-600 text-slate-500 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                    title="Ubah nomor surat"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Ubah
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.docNumber || ''}
                                onChange={(e) => setField('docNumber', e.target.value)}
                                className="form-input-styled font-mono text-base pr-10"
                                placeholder="Nomor akan di-generate otomatis..."
                                readOnly={readOnly}
                            />
                            {formData.docNumber && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                            <svg className="w-3 h-3 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Nomor digenerate otomatis saat dokumen dibuat · Klik "Ubah" untuk menyesuaikan kode
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Ubah Nomor */}
            {showGenModal && (
                <GenerateNumberModal
                    currentNumber={formData.docNumber}
                    onClose={() => setShowGenModal(false)}
                    onGenerate={({ number, reason }) => {
                        setFormData(prev => ({
                            ...prev,
                            docNumber: number,
                            _docChangeNote: `Perubahan nomor surat: ${reason}`
                        }));
                        setShowGenModal(false);
                    }}
                />
            )}

            {/* === 2. PENERIMA & INSTRUKSI === */}
            <div className="space-y-6 pt-4">
                <SectionHeading number="2" title="Penerima & Instruksi" />
                <div className="space-y-5">
                    {/* Recipients (to) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="form-label-styled">Tujuan (Kepada)</label>
                            <button
                                type="button"
                                onClick={addTo}
                                className="text-[10px] text-indigo-600 font-black hover:underline uppercase tracking-tighter"
                            >+ TAMBAH PENERIMA</button>
                        </div>
                        <div className="space-y-3">
                            {toList.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center group/item">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => changeTo(i, e.target.value)}
                                            className="form-input-styled"
                                            placeholder="Yth. ..."
                                        />
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg opacity-0 group-focus-within/item:opacity-100 transition-opacity"></div>
                                    </div>
                                    {toList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTo(i)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all focus:outline-none"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Jabatan + Pengirim (Dari) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="form-label-styled">Status Jabatan</label>
                            <select
                                value={formData.plh_pjs || ''}
                                onChange={(e) => setField('plh_pjs', e.target.value)}
                                className="form-input-styled appearance-none"
                            >
                                <option value="">REGULER</option>
                                <option value="PLH.">PLH (PELAKSANA HARIAN)</option>
                                <option value="PJS.">PJS (PEJABAT SEMENTARA)</option>
                                <option value="AN.">A.N. (ATAS NAMA)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Pengirim (Dari)</label>
                            <input
                                type="text"
                                value={formData.from || ''}
                                onChange={(e) => setField('from', e.target.value)}
                                className="form-input-styled"
                                placeholder="Nama Pengirim"
                            />
                        </div>
                    </div>

                    {/* Perihal Dokumen */}
                    <div className="space-y-2">
                        <label className="form-label-styled">Perihal Dokumen</label>
                        <textarea
                            value={formData.subject || ''}
                            onChange={(e) => setField('subject', e.target.value)}
                            className="form-textarea-styled leading-relaxed"
                            rows="2"
                            placeholder="Tuliskan perihal surat..."
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* === 3. ISI KONTEN UTAMA === */}
            <div className="space-y-4 pt-4">
                <SectionHeading number="3" title="Isi Konten Utama" />

                {/* Banner: Terkunci */}
                {readOnly && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                            Editor terkunci — dokumen sudah didistribusikan
                        </p>
                    </div>
                )}

                <div className="quill-main-wrap">
                    <QuillEditor
                        value={formData.content || ''}
                        onChange={(html) => setField('content', html)}
                        placeholder="Tulis isi nota dinas di sini — gunakan toolbar untuk format teks, daftar bernomor, poin, dll..."
                        minHeight="320px"
                        readOnly={readOnly}
                        toolbar={[
                            [{ header: [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            [{ indent: '-1' }, { indent: '+1' }],
                            [{ align: [] }],
                            ['link', 'blockquote'],
                            ['clean'],
                        ]}
                    />
                </div>
            </div>

            {/* === 4. PENGESAHAN & PARAF === */}
            <div className="space-y-8 pt-4">
                <SectionHeading number="4" title="Pengesahan & Paraf" />

                {/* Location + Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="form-label-styled">Lokasi</label>
                        <input
                            type="text"
                            value={formData.location || formData.loc || ''}
                            onChange={(e) => setField('location', e.target.value)}
                            className="form-input-styled"
                            placeholder="Jakarta"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="form-label-styled">Tanggal</label>
                        <input
                            type="date"
                            value={formData.date || ''}
                            onChange={(e) => setField('date', e.target.value)}
                            className="form-input-styled"
                        />
                    </div>
                </div>

                {/* Jabatan Penandatangan */}
                <div className="space-y-2">
                    <label className="form-label-styled">Jabatan Penandatangan</label>
                    <input
                        type="text"
                        value={formData.signerPosition || formData.pos || ''}
                        onChange={(e) => setField('signerPosition', e.target.value)}
                        className="form-input-styled"
                        placeholder="Kepala Divisi..."
                    />
                </div>

                {/* Nama Lengkap Penandatangan */}
                <div className="space-y-2">
                    <label className="form-label-styled">Nama Lengkap Penandatangan</label>
                    <input
                        type="text"
                        value={formData.signerName || formData.name || ''}
                        onChange={(e) => setField('signerName', e.target.value)}
                        className="form-input-styled font-black text-lg"
                    />
                </div>

                {/* Main Signature placeholder */}
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tanda Tangan Utama</label>
                        <button
                            type="button"
                            onClick={() => setSigModal({ isOpen: true, target: 'main', title: 'Tanda Tangan Utama' })}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                        >
                            + ISI TTD
                        </button>
                    </div>
                    {!formData.signature ? (
                        <div className="w-full py-6 border-2 border-dashed border-indigo-200 text-indigo-400 text-[10px] font-black rounded-xl bg-white text-center uppercase tracking-widest">
                            (Belum ada tanda tangan)
                        </div>
                    ) : (
                        <div className="relative group/ttd">
                            <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-indigo-100 shadow-inner">
                                <img src={formData.signature} className="h-24 object-contain" alt="TTD" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setField('signature', '')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/ttd:opacity-100 transition-opacity shadow-md"
                            >×</button>
                        </div>
                    )}
                </div>

                {/* Paraf Table */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tabel Paraf Tambahan</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">Tambahkan paraf divisi terkait</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setField('paraf', [...(formData.paraf || []), { code: '', name: '', signature: '' }])}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                        >+ TAMBAH BARIS</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(formData.paraf || []).map((item, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group/paraf shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const p = [...(formData.paraf || [])]; p.splice(i, 1); setField('paraf', p);
                                    }}
                                    className="absolute -right-2 -top-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-md border border-red-50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10 opacity-0 group-hover/paraf:opacity-100"
                                >×</button>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={item.code || ''}
                                        onChange={(e) => {
                                            const p = [...(formData.paraf || [])]; p[i] = { ...p[i], code: e.target.value }; setField('paraf', p);
                                        }}
                                        placeholder="KODE"
                                        className="form-input-styled bg-white border-slate-200 py-1 text-[9px] font-black"
                                    />
                                    <input
                                        type="text"
                                        value={item.name || ''}
                                        onChange={(e) => {
                                            const p = [...(formData.paraf || [])]; p[i] = { ...p[i], name: e.target.value }; setField('paraf', p);
                                        }}
                                        placeholder="NAMA"
                                        className="form-input-styled bg-white border-slate-200 py-1 text-[9px] font-black"
                                    />
                                </div>
                                <div className="w-full p-2 border-2 border-dashed border-slate-200 rounded-lg bg-white relative group/ptd">
                                    {!item.signature ? (
                                        <button
                                            type="button"
                                            onClick={() => setSigModal({ isOpen: true, target: `paraf-${i}`, title: `Paraf ${item.name || 'Tambahan'}` })}
                                            className="w-full py-2 text-slate-400 hover:text-indigo-600 text-[9px] font-black text-center uppercase tracking-widest transition-colors"
                                        >
                                            + ISI PARAF
                                        </button>
                                    ) : (
                                        <>
                                            <div className="h-12 flex items-center justify-center">
                                                <img src={item.signature} className="h-10 object-contain" alt="Paraf" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = [...(formData.paraf || [])];
                                                    p[i] = { ...p[i], signature: '' };
                                                    setField('paraf', p);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white w-4 h-4 text-xs rounded-full flex items-center justify-center opacity-0 group-hover/ptd:opacity-100 transition-opacity shadow-md"
                                            >×</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Signature Modal */}
            <SignatureModal
                isOpen={sigModal.isOpen}
                title={sigModal.title}
                onClose={() => setSigModal({ isOpen: false, target: null, title: '' })}
                onSave={(dataUrl) => {
                    if (sigModal.target === 'main') {
                        setField('signature', dataUrl);
                    } else if (sigModal.target && sigModal.target.startsWith('paraf-')) {
                        const idx = parseInt(sigModal.target.split('-')[1]);
                        const p = [...(formData.paraf || [])];
                        p[idx] = { ...p[idx], signature: dataUrl };
                        setField('paraf', p);
                    }
                }}
            />
        </div>
    );
};

// ===========================================================
// PREVIEW component (remains the same as before)
// ===========================================================
function formatDate(dateStr) {
    if (!dateStr) return '...';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatNumbering(i, style) {
    const styles = {
        'a.': (i) => String.fromCharCode(97 + i) + '.',
        'A.': (i) => String.fromCharCode(65 + i) + '.',
        '1.': (i) => (i + 1) + '.',
        'I.': (i) => { const r = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']; return (r[i] || (i + 1)) + '.'; },
    };
    return (styles[style] || styles['1.'])(i);
}

NotaEditor.Preview = function NotaEditorPreview({ formData }) {
    const toList = Array.isArray(formData?.to) ? formData.to : [formData?.to || ''];
    const basisList = formData?.basis || [];
    const ccList = formData?.ccs || [];
    const parafList = formData?.paraf || [];

    return (
        <div>
            <div className="paper-header">
                <h1 className="font-bold text-lg uppercase">NOTA DINAS</h1>
                <p>NOMOR {formData?.docNumber || '...'}</p>
            </div>

            <table className="info-table w-full mb-6">
                <tbody>
                    <tr>
                        <td width="100">Kepada</td>
                        <td width="20">:</td>
                        <td>
                            {toList.map((t, i) => (
                                <div key={i} className="flex items-start">
                                    {toList.length > 1 && <span className="mr-1 font-bold">{i + 1}.</span>}
                                    <span>{t || '...'}</span>
                                </div>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>Dari</td><td>:</td>
                        <td>
                            {formData?.plh_pjs && <span className="font-bold">{formData.plh_pjs} </span>}
                            {formData?.from || '...'}
                        </td>
                    </tr>
                    <tr><td>Hal</td><td>:</td><td className="font-bold">{formData?.subject || '...'}</td></tr>
                </tbody>
            </table>


            <div className="mb-8 text-justify leading-relaxed quill-preview-content">
                <div dangerouslySetInnerHTML={{ __html: formData?.content || '...' }} />
            </div>


            <div className="signature-section">
                <p className="mb-1">
                    <span>{formData?.location || formData?.loc || 'Jakarta'}</span>,{' '}
                    <span>{formatDate(formData?.date)}</span>
                </p>
                <p className="font-bold uppercase mb-0">
                    {formData?.plh_pjs && <span>{formData.plh_pjs} </span>}
                    <span>{formData?.signerPosition || formData?.pos || '...'}</span>
                </p>
                <div className="h-24 w-full flex items-center justify-center">
                    {formData?.signature && <img src={formData.signature} className="h-24 object-contain" alt="TTD" />}
                </div>
                <p className="font-bold uppercase underline">{formData?.signerName || formData?.name || '...'}</p>
            </div>

            <div className="clear-both"></div>

            {/* Tembusan */}
            {ccList.length > 0 && ccList.some(c => c.trim()) && (
                <div className="mt-8 text-[11pt]">
                    <p className="font-bold underline mb-1">Tembusan:</p>
                    <ol className="list-decimal pl-5">
                        {ccList.filter(c => c.trim()).map((cc, i) => <li key={i}>{cc}</li>)}
                    </ol>
                </div>
            )}

            {/* Paraf Table */}
            {parafList.length > 0 && (
                <div className="mt-8 flex flex-col gap-4 no-break">
                    <div className="paraf-container">
                        <table className="paraf-table">
                            <tbody>
                                <tr>
                                    <td rowSpan="3" className="col-paraf-label">Paraf</td>
                                    {[...parafList].reverse().map((p, i) => <td key={i} className="cell-width">{p.code}</td>)}
                                </tr>
                                <tr className="row-name">
                                    {[...parafList].reverse().map((p, i) => <td key={i}>{p.name}</td>)}
                                </tr>
                                <tr className="row-signature">
                                    {[...parafList].reverse().map((p, i) => (
                                        <td key={i} className="h-16 align-middle">
                                            {p.signature && <img src={p.signature} className="max-h-12 mx-auto" alt="" />}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotaEditor;
