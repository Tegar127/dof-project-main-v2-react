import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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

const NotaEditor = ({ formData, setFormData }) => {
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
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-indigo-500 transition-colors">Nomor Dokumen</label>
                        <input
                            type="text"
                            value={formData.docNumber || ''}
                            onChange={(e) => setField('docNumber', e.target.value)}
                            className="form-input-styled font-mono text-base"
                            placeholder=".../ND/I/2026"
                        />
                    </div>
                </div>
            </div>

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
            <div className="space-y-6 pt-4">
                <SectionHeading number="3" title="Isi Konten Utama" />

                {/* Dasar Pelaksanaan (Basis) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <label className="form-label-styled">Dasar Pelaksanaan</label>
                            <select
                                value={formData.basisStyle || '1.'}
                                onChange={(e) => setField('basisStyle', e.target.value)}
                                className="text-[9px] font-bold border-slate-200 rounded bg-slate-50 px-2 py-1 focus:ring-0 outline-none"
                            >
                                <option value="1.">ANGKA (1, 2, 3)</option>
                                <option value="a.">HURUF KECIL (a, b, c)</option>
                                <option value="A.">HURUF BESAR (A, B, C)</option>
                                <option value="I.">ROMAWI (I, II, III)</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={addBasis}
                            className="text-[10px] text-indigo-600 font-black hover:underline tracking-tighter uppercase"
                        >+ TAMBAH POIN</button>
                    </div>
                    <div className="space-y-3">
                        {basisList.map((item, i) => {
                            const bi = typeof item === 'string' ? { text: item, sub: [] } : item;
                            return (
                                <div key={i} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group/basis">
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={bi.text}
                                                onChange={(e) => changeBasis(i, e.target.value)}
                                                className="form-input-styled text-sm py-2 bg-white"
                                                placeholder="Tulis poin dasar..."
                                            />
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 rounded-l-lg group-focus-within/basis:bg-indigo-500 transition-colors"></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => addSub(i)}
                                                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Tambah Sub-poin"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeBasis(i)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Sub-items */}
                                    {bi.sub && bi.sub.length > 0 && (
                                        <div className="ml-4 space-y-1">
                                            {bi.sub.map((sub, si) => (
                                                <div key={si} className="flex gap-2 items-center">
                                                    <span className="text-xs text-slate-400 w-5">{String.fromCharCode(97 + si)}.</span>
                                                    <input
                                                        type="text"
                                                        value={sub}
                                                        onChange={(e) => changeSub(i, si, e.target.value)}
                                                        className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                                        placeholder={`Sub-poin ${si + 1}...`}
                                                    />
                                                    <button type="button" onClick={() => removeSub(i, si)} className="p-1 text-slate-300 hover:text-red-500 transition-all">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CKEditor — Konten Utama */}
                <div className="space-y-2 group">
                    <label className="form-label-styled group-focus-within:text-indigo-500 transition-colors">Konten Utama (Editor)</label>
                    <div className="ck-editor-container border border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <CKEditor
                            editor={ClassicEditor}
                            config={{
                                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
                            }}
                            data={formData.content || ''}
                            onChange={(event, editor) => setField('content', editor.getData())}
                        />
                    </div>
                </div>

                {/* Kalimat Penutup */}
                <div className="group">
                    <label className="form-label-styled group-focus-within:text-indigo-500 transition-colors">Kalimat Penutup</label>
                    <textarea
                        value={formData.closing || ''}
                        onChange={(e) => setField('closing', e.target.value)}
                        className="form-textarea-styled leading-relaxed"
                        rows="2"
                    ></textarea>
                </div>

                {/* Tembusan */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="form-label-styled">Tembusan (Opsional)</label>
                        <button
                            type="button"
                            onClick={addCc}
                            className="text-[10px] text-indigo-600 font-black hover:underline uppercase tracking-tighter"
                        >+ TAMBAH TEMBUSAN</button>
                    </div>
                    <div className="space-y-2">
                        {ccList.map((cc, i) => (
                            <div key={i} className="flex gap-2 items-center group/cc">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={cc}
                                        onChange={(e) => changeCc(i, e.target.value)}
                                        className="form-input-styled py-2 text-sm bg-white"
                                        placeholder="Contoh: Direksi PT ASABRI"
                                    />
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 rounded-l-lg group-focus-within/cc:bg-indigo-500 transition-colors"></div>
                                </div>
                                <button type="button" onClick={() => removeCc(i)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
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
                    </div>
                    {!formData.signature ? (
                        <div className="w-full py-6 border-2 border-dashed border-indigo-200 text-indigo-400 text-[10px] font-black rounded-xl bg-white text-center uppercase tracking-widest">
                            (TTD akan diisi setelah approve)
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-indigo-100 shadow-inner">
                            <img src={formData.signature} className="h-24 object-contain" alt="TTD" />
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
                                <div className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 text-[9px] font-black rounded-lg bg-white text-center uppercase tracking-widest">
                                    ISI PARAF
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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

            <div className="mb-4">
                <p className="mb-2">Berdasarkan:</p>
                <ul className="list-none text-justify p-0 m-0">
                    {basisList.map((item, i) => {
                        const bi = typeof item === 'string' ? { text: item, sub: [] } : item;
                        return (
                            <li key={i} className="mb-4">
                                <div className="flex gap-2 items-start">
                                    <span className="w-8 shrink-0 font-bold text-center">{formatNumbering(i, formData?.basisStyle || '1.')}</span>
                                    <span className="flex-1 break-words">{bi.text}</span>
                                </div>
                                {bi.sub && bi.sub.length > 0 && (
                                    <ul className="list-none mt-1 ml-8 space-y-1">
                                        {bi.sub.map((sub, si) => (
                                            <li key={si} className="flex gap-2 items-start text-sm">
                                                <span className="w-6 shrink-0">{String.fromCharCode(97 + si)}.</span>
                                                <span className="flex-1 break-words text-justify">{sub}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mb-8 text-justify leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: formData?.content || '...' }} />
            </div>

            <p className="mb-8 font-medium">{formData?.closing || 'Demikian disampaikan dan untuk dijadikan periksa.'}</p>

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
