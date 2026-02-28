import React, { useState } from 'react';
import SignatureModal from './SignatureModal';

function SectionHeading({ number, title }) {
    return (
        <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block shrink-0"></span>
                {number}. {title}
            </h3>
            <div className="h-px bg-slate-100 flex-1"></div>
        </div>
    );
}

const PerjanjianEditor = ({ formData, setFormData }) => {
    const [sigModal, setSigModal] = useState({ isOpen: false, target: null, title: '' });
    const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const handleChange = (e) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    // Points array
    const handlePointChange = (index, value) => {
        const points = [...(formData.points || [''])];
        points[index] = value;
        setField('points', points);
    };

    const addPoint = () => {
        const points = [...(formData.points || ['']), ''];
        setField('points', points);
    };

    const removePoint = (index) => {
        const points = [...(formData.points || [])];
        points.splice(index, 1);
        setField('points', points);
    };

    // Paraf Handle
    const handleParafChange = (index, field, value) => {
        const paraf = [...(formData.paraf || [{ name: '', title: '' }])];
        paraf[index] = { ...paraf[index], [field]: value };
        setField('paraf', paraf);
    };

    const addParafItem = () => {
        const paraf = [...(formData.paraf || [{ name: '', title: '' }]), { name: '', title: '' }];
        setField('paraf', paraf);
    };

    const removeParafItem = (index) => {
        const paraf = [...(formData.paraf || [])];
        paraf.splice(index, 1);
        setField('paraf', paraf);
    };

    const pointsList = formData.points || [''];
    const parafList = formData.paraf || [{ name: '', title: '' }, { name: '', title: '' }];

    return (
        <div className="space-y-10">

            {/* === 1. IDENTITAS & DASAR === */}
            <div className="space-y-6">
                <SectionHeading number="1" title="Identitas & Tentang" />
                <div className="space-y-5">
                    {/* Nomor Dokumen */}
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-amber-500 transition-colors">Nomor Dokumen</label>
                        <input
                            type="text"
                            name="docNumber"
                            value={formData.docNumber || ''}
                            onChange={handleChange}
                            className="form-input-styled font-mono text-base"
                            placeholder="PKS-.../..."
                        />
                    </div>
                    {/* Judul & Tentang */}
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-amber-500 transition-colors">Tentang Judul Perjanjian</label>
                        <textarea
                            name="about"
                            value={formData.about || ''}
                            onChange={handleChange}
                            className="form-textarea-styled leading-relaxed uppercase"
                            rows="2"
                            placeholder="TENTANG SEWA MENYEWA..."
                        ></textarea>
                    </div>
                    {/* Waktu & Tempat */}
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                        <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Waktu & Tempat</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="form-label-styled">Hari</label>
                                <input type="text" name="day" value={formData.day || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" placeholder="Contoh: Senin" />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-styled">Tanggal (Teks Lengkap)</label>
                                <input type="text" name="dateWritten" value={formData.dateWritten || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" placeholder="Satu Januari..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Tempat</label>
                            <input type="text" name="place" value={formData.place || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" placeholder="Contoh: Jakarta" />
                        </div>
                    </div>
                </div>
            </div>

            {/* === 2. PIHAK-PIHAK TERKAIT === */}
            <div className="space-y-6 pt-4">
                <SectionHeading number="2" title="Pihak-Pihak Terkait" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pihak 1 */}
                    <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <span className="w-5 h-5 bg-amber-100 text-amber-700 flex items-center justify-center rounded text-[10px] font-black">1</span>
                            <label className="form-label-styled !mb-0 text-slate-800">PT ASABRI (PERSERO)</label>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Nama Penandatangan</label>
                            <input type="text" name="p1Name" value={formData.p1Name || ''} onChange={handleChange} className="form-input-styled text-sm" placeholder="Nama..." />
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Jabatan</label>
                            <input type="text" name="p1Pos" value={formData.p1Pos || ''} onChange={handleChange} className="form-input-styled text-sm" placeholder="Jabatan..." />
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Kewenangan / Kuasa</label>
                            <textarea name="p1Auth" value={formData.p1Auth || ''} onChange={handleChange} rows="2" className="form-textarea-styled text-sm" placeholder="Berdasarkan Surat Kuasa..."></textarea>
                        </div>
                    </div>

                    {/* Pihak 2 */}
                    <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <span className="w-5 h-5 bg-amber-100 text-amber-700 flex items-center justify-center rounded text-[10px] font-black">2</span>
                            <label className="form-label-styled !mb-0 text-slate-800">Pihak Kedua (Mitra)</label>
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Nama Pihak Kedua / Badan Usaha</label>
                            <input type="text" name="p2Name" value={formData.p2Name || ''} onChange={handleChange} className="form-input-styled text-sm font-bold" placeholder="Nama..." />
                        </div>
                        <div className="space-y-2">
                            <label className="form-label-styled">Informasi Detail (Identitas)</label>
                            <textarea name="p2Info" value={formData.p2Info || ''} onChange={handleChange} rows="4" className="form-textarea-styled text-sm" placeholder="Lahir di..., Alamat..., NIK..."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            {/* === 3. POIN PERJANJIAN === */}
            <div className="space-y-6 pt-4">
                <SectionHeading number="3" title="Klausul & Poin Perjanjian" />
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="form-label-styled">Daftar Poin Perjanjian</label>
                        <button
                            type="button"
                            onClick={addPoint}
                            className="text-[10px] text-amber-600 font-black hover:underline tracking-tighter uppercase"
                        >+ TAMBAH POIN</button>
                    </div>
                    <div className="space-y-3">
                        {pointsList.map((item, i) => (
                            <div key={i} className="flex gap-3 items-start group/point">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 font-black text-xs flex items-center justify-center shrink-0 border border-amber-100">
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={item}
                                        onChange={(e) => handlePointChange(i, e.target.value)}
                                        className="form-textarea-styled text-sm py-3"
                                        rows="2"
                                        placeholder="Bahwa Pihak..."
                                    ></textarea>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePoint(i)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <SectionHeading number="4" title="Pengesahan & Daftar Paraf" />

                <div className="space-y-6 border-t border-slate-100 pt-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tabel Paraf Tambahan</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">Tambahkan paraf pihak-pihak terkait (Opsional)</p>
                        </div>
                        <button
                            type="button"
                            onClick={addParafItem}
                            className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black hover:bg-amber-600 hover:text-white transition-all uppercase tracking-widest"
                        >+ TAMBAH BARIS</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {parafList.map((item, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group/paraf shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    type="button"
                                    onClick={() => removeParafItem(i)}
                                    className="absolute -right-2 -top-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-md border border-red-50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10 opacity-0 group-hover/paraf:opacity-100"
                                >×</button>
                                <div className="space-y-2 mb-3">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Keterangan Pihak</label>
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => handleParafChange(i, 'title', e.target.value)}
                                            placeholder="PIHAK KESATU"
                                            className="form-input-styled bg-white border-slate-200 py-1.5 text-[10px] font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Nama / Instansi</label>
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) => handleParafChange(i, 'name', e.target.value)}
                                            placeholder="NAMA LENGKAP"
                                            className="form-input-styled bg-white border-slate-200 py-1.5 text-[10px] font-black"
                                        />
                                    </div>
                                </div>
                                <div className="w-full p-2 border-2 border-dashed border-slate-200 rounded-lg bg-white relative group/ptd">
                                    {!item.signature ? (
                                        <button
                                            type="button"
                                            onClick={() => setSigModal({ isOpen: true, target: `paraf-${i}`, title: `Paraf ${item.title || 'Tambahan'}` })}
                                            className="w-full py-2 text-slate-400 hover:text-amber-600 text-[9px] font-black text-center uppercase tracking-widest transition-colors"
                                        >
                                            + TTD / PARAF
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
                    if (sigModal.target && sigModal.target.startsWith('paraf-')) {
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

const Preview = ({ formData }) => {
    const letters = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.'];
    return (
        <div className="text-black text-justify leading-normal" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt' }}>
            <div className="text-center font-bold mb-8 uppercase leading-tight">
                <p className="m-0">PERJANJIAN KERJA SAMA</p>
                <p className="m-0">ANTARA</p>
                <p className="m-0">PT ASABRI (PERSERO)</p>
                <p className="m-0">DENGAN</p>
                <p className="m-0">{formData.p2Name || '...'}</p>
                <p className="m-0">TENTANG</p>
                <p className="m-0">{formData.about || '...'}</p>
                <p className="m-0 mt-2">NOMOR: {formData.docNumber || '...'}</p>
            </div>

            <p className="mb-4">
                Pada hari ini <span className="font-bold">{formData.day || '...'}</span>,
                tanggal <span className="font-bold">{formData.dateWritten || '...'}</span>
                {' '}bertempat di <span>{formData.place || '...'}</span>,
                kami yang bertanda tangan di bawah ini:
            </p>

            <div className="flex mb-4 items-start">
                <div className="w-8 flex-shrink-0 font-bold">1.</div>
                <div className="flex-grow text-justify">
                    <span className="font-bold tracking-tight">PT ASABRI (Persero)</span>,
                    suatu Perseroan Terbatas yang didirikan berdasarkan Hukum Negara Republik Indonesia,
                    yang berkedudukan di Jalan Mayjen Sutoyo Nomor 11 Jakarta Timur, dalam hal ini diwakili oleh
                    <span className="font-bold mx-1">{formData.p1Name || '...'}</span>
                    dalam jabatannya selaku <span className="font-bold mr-1">{formData.p1Pos || '...'}</span>
                    <span>{formData.p1Auth || '...'}</span>,
                    untuk selanjutnya disebut <span className="font-bold">"Pihak Kesatu"</span>; dan
                </div>
            </div>

            <div className="flex mb-4 items-start">
                <div className="w-8 flex-shrink-0 font-bold">2.</div>
                <div className="flex-grow text-justify">
                    <span className="font-bold mr-1">{formData.p2Name || '...'}</span>,
                    <span className="mr-1">{formData.p2Info || '...'}</span>,
                    dan untuk selanjutnya disebut <span className="font-bold">"Pihak Kedua"</span>.
                </div>
            </div>

            <p className="mb-4">
                Pihak Kesatu dan Pihak Kedua selanjutnya secara bersama-sama disebut sebagai <span className="font-bold">"Para Pihak"</span> dan masing-masing disebut <span className="font-bold">"Pihak"</span>,
                serta dalam kedudukannya sebagaimana tersebut di atas, terlebih dulu menerangkan hal-hal sebagai berikut:
            </p>

            <div className="space-y-4 mb-16 pl-4">
                {formData.points && formData.points.length > 0 ? (
                    formData.points.map((p, i) => (
                        <div key={i} className="flex items-start">
                            <div className="w-8 flex-shrink-0">{letters[i] || `${i + 1}.`}</div>
                            <div className="flex-grow text-justify">{p || '...'}</div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-start">
                        <div className="w-8 flex-shrink-0">A.</div>
                        <div className="flex-grow">...</div>
                    </div>
                )}
            </div>

            {formData.paraf && formData.paraf.length > 0 && (
                <div className="paraf-container">
                    <table className="paraf-table">
                        <tbody>
                            <tr className="row-name">
                                {formData.paraf.map((p, i) => (
                                    <td key={i} className="cell-width uppercase">{p.title || '...'}</td>
                                ))}
                            </tr>
                            <tr className="row-signature text-center align-bottom">
                                {formData.paraf.map((p, i) => (
                                    <td key={i} className="cell-width pt-6 pb-2">
                                        {p.signature ? (
                                            <img src={p.signature} className="h-24 object-contain mx-auto" alt="TTD" />
                                        ) : (
                                            <div className="h-24 w-full flex items-center justify-center text-xs text-gray-400 italic">...</div>
                                        )}
                                        <div className="font-bold uppercase underline mt-2">{p.name || '...'}</div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

PerjanjianEditor.Preview = Preview;
export default PerjanjianEditor;
