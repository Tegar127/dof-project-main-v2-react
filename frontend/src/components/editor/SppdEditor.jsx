function SectionHeading({ number, title }) {
    return (
        <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block shrink-0"></span>
                {number}. {title}
            </h3>
            <div className="h-px bg-slate-100 flex-1"></div>
        </div>
    );
}

const SppdEditor = ({ formData, setFormData }) => {
    const [sigModal, setSigModal] = useState({ isOpen: false, target: null, title: '' });
    const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const handleChange = (e) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    // Mengingat (remember) with sub-items
    const addRemember = () => setField('remember', [...(formData.remember || []), { text: '', sub: [] }]);
    const removeRemember = (i) => {
        const r = [...(formData.remember || [])]; r.splice(i, 1); setField('remember', r);
    };
    const changeRemember = (i, val) => {
        const r = [...(formData.remember || [])];
        r[i] = { ...(typeof r[i] === 'string' ? { text: r[i], sub: [] } : r[i]), text: val };
        setField('remember', r);
    };
    const addRememberSub = (i) => {
        const r = [...(formData.remember || [])];
        r[i] = { ...(typeof r[i] === 'string' ? { text: r[i], sub: [] } : r[i]) };
        r[i].sub = [...(r[i].sub || []), ''];
        setField('remember', r);
    };
    const changeRememberSub = (pi, si, val) => {
        const r = [...(formData.remember || [])];
        const subs = [...(r[pi].sub || [])]; subs[si] = val;
        r[pi] = { ...r[pi], sub: subs }; setField('remember', r);
    };
    const removeRememberSub = (pi, si) => {
        const r = [...(formData.remember || [])];
        const subs = [...(r[pi].sub || [])]; subs.splice(si, 1);
        r[pi] = { ...r[pi], sub: subs }; setField('remember', r);
    };

    // CC (tembusan)
    const addCc = () => setField('cc', [...(formData.cc || ['']), '']);
    const removeCc = (i) => {
        const c = [...(formData.cc || [])]; c.splice(i, 1); setField('cc', c);
    };
    const changeCc = (i, val) => {
        const c = [...(formData.cc || [])]; c[i] = val; setField('cc', c);
    };

    const rememberList = formData.remember || [{ text: '', sub: [] }];
    const ccList = formData.cc || [''];

    return (
        <div className="space-y-10">

            {/* === 1. IDENTITAS & DASAR === */}
            <div className="space-y-6">
                <SectionHeading number="1" title="Identitas & Dasar" />
                <div className="space-y-5">
                    {/* Nomor Dokumen */}
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-emerald-500 transition-colors">Nomor Dokumen</label>
                        <input
                            type="text"
                            name="docNumber"
                            value={formData.docNumber || ''}
                            onChange={handleChange}
                            className="form-input-styled font-mono text-base"
                            placeholder="SPPD-.../..."
                        />
                    </div>
                    {/* Menimbang */}
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-emerald-500 transition-colors">Menimbang</label>
                        <textarea
                            name="weigh"
                            value={formData.weigh || ''}
                            onChange={handleChange}
                            className="form-textarea-styled leading-relaxed"
                            rows="3"
                            placeholder="bahwa dalam rangka..."
                        ></textarea>
                    </div>
                    {/* Mengingat */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="form-label-styled">Mengingat</label>
                            <button
                                type="button"
                                onClick={addRemember}
                                className="text-[10px] text-emerald-600 font-black hover:underline tracking-tighter uppercase"
                            >+ TAMBAH POIN</button>
                        </div>
                        <div className="space-y-3">
                            {rememberList.map((item, i) => {
                                const ri = typeof item === 'string' ? { text: item, sub: [] } : item;
                                return (
                                    <div key={i} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group/rem">
                                        <div className="flex gap-3 items-center">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={ri.text}
                                                    onChange={(e) => changeRemember(i, e.target.value)}
                                                    className="form-input-styled text-sm py-2 bg-white"
                                                    placeholder="Peraturan..."
                                                />
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 rounded-l-lg group-focus-within/rem:bg-emerald-500 transition-colors"></div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => addRememberSub(i)}
                                                    className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Tambah Sub-poin"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRemember(i)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {ri.sub && ri.sub.length > 0 && (
                                            <div className="ml-4 space-y-1">
                                                {ri.sub.map((sub, si) => (
                                                    <div key={si} className="flex gap-2 items-center">
                                                        <span className="text-xs text-slate-400 w-5">{String.fromCharCode(97 + si)}.</span>
                                                        <input
                                                            type="text"
                                                            value={sub}
                                                            onChange={(e) => changeRememberSub(i, si, e.target.value)}
                                                            className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
                                                            placeholder={`Sub-poin ${si + 1}...`}
                                                        />
                                                        <button type="button" onClick={() => removeRememberSub(i, si)} className="p-1 text-slate-300 hover:text-red-500 transition-all">
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
                </div>
            </div>

            {/* === 2. PERINTAH & PELAKSANAAN === */}
            <div className="space-y-6 pt-4">
                <SectionHeading number="2" title="Perintah & Pelaksanaan" />
                <div className="space-y-5">
                    {/* Kepada */}
                    <div className="group">
                        <label className="form-label-styled group-focus-within:text-emerald-500 transition-colors">Tujuan (Kepada)</label>
                        <input
                            type="text"
                            name="to"
                            value={formData.to || ''}
                            onChange={handleChange}
                            className="form-input-styled"
                            placeholder="Nama & Jabatan"
                        />
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-5">
                        <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Detail Perintah (Untuk)</label>

                        {/* Poin 1: Kegiatan */}
                        <div className="space-y-2">
                            <label className="form-label-styled">Kegiatan</label>
                            <input
                                type="text"
                                name="task"
                                value={formData.task || ''}
                                onChange={handleChange}
                                className="form-input-styled bg-white"
                                placeholder="Melaksanakan kegiatan..."
                            />
                        </div>

                        {/* Poin 2: Detail Perjalanan */}
                        <div className="space-y-3">
                            <label className="form-label-styled">Detail Perjalanan</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="dest" value={formData.dest || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" placeholder="Tujuan (misal: Denpasar)" />
                                <input type="text" name="transport" value={formData.transport || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" placeholder="Transportasi (Pesawat)" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase">Berangkat</span>
                                    <input type="date" name="dateGo" value={formData.dateGo || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase">Kembali</span>
                                    <input type="date" name="dateBack" value={formData.dateBack || ''} onChange={handleChange} className="form-input-styled bg-white text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Poin 3, 4, 5 */}
                        <div className="space-y-2">
                            <label className="form-label-styled">Ketentuan Tambahan</label>
                            <textarea name="funding" value={formData.funding || ''} onChange={handleChange} rows="2" className="form-textarea-styled bg-white text-sm mb-2" placeholder="Biaya dibebankan..."></textarea>
                            <textarea name="report" value={formData.report || ''} onChange={handleChange} rows="2" className="form-textarea-styled bg-white text-sm mb-2" placeholder="Melaporkan pelaksanaan..."></textarea>
                            <textarea name="close" value={formData.close || ''} onChange={handleChange} rows="1" className="form-textarea-styled bg-white text-sm" placeholder="Melaksanakan dengan tanggung jawab."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            {/* === 3. PENGESAHAN & PARAF === */}
            <div className="space-y-8 pt-4">
                <SectionHeading number="3" title="Pengesahan & Penandatanganan" />

                {/* Location + Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="form-label-styled">Lokasi Dikeluarkan</label>
                        <input
                            type="text"
                            name="loc"
                            value={formData.loc || ''}
                            onChange={handleChange}
                            className="form-input-styled"
                            placeholder="Jakarta"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="form-label-styled">Tanggal</label>
                        <input
                            type="date"
                            name="signDate"
                            value={formData.signDate || ''}
                            onChange={handleChange}
                            className="form-input-styled"
                        />
                    </div>
                </div>

                {/* Jabatan Penandatangan */}
                <div className="space-y-2">
                    <label className="form-label-styled">Jabatan Penandatangan</label>
                    <input
                        type="text"
                        name="signPos"
                        value={formData.signPos || ''}
                        onChange={handleChange}
                        className="form-input-styled"
                        placeholder="DIREKTUR UTAMA"
                    />
                </div>

                {/* Nama Lengkap Penandatangan */}
                <div className="space-y-2">
                    <label className="form-label-styled">Nama Lengkap Penandatangan</label>
                    <input
                        type="text"
                        name="signName"
                        value={formData.signName || ''}
                        onChange={handleChange}
                        className="form-input-styled font-black text-lg"
                        placeholder="Nama Lengkap..."
                    />
                </div>

                {/* Main Signature placeholder */}
                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tanda Tangan Utama</label>
                        <button
                            type="button"
                            onClick={() => setSigModal({ isOpen: true, target: 'main', title: 'Tanda Tangan Utama' })}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest"
                        >
                            + ISI TTD
                        </button>
                    </div>
                    {!formData.signature ? (
                        <div className="w-full py-6 border-2 border-dashed border-emerald-200 text-emerald-400 text-[10px] font-black rounded-xl bg-white text-center uppercase tracking-widest">
                            (Belum ada tanda tangan)
                        </div>
                    ) : (
                        <div className="relative group/ttd">
                            <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-emerald-100 shadow-inner">
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

                {/* Tembusan */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <label className="form-label-styled">Tembusan (Opsional)</label>
                        <button
                            type="button"
                            onClick={addCc}
                            className="text-[10px] text-emerald-600 font-black hover:underline uppercase tracking-tighter"
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
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 rounded-l-lg group-focus-within/cc:bg-emerald-500 transition-colors"></div>
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

            {/* Signature Modal */}
            <SignatureModal
                isOpen={sigModal.isOpen}
                title={sigModal.title}
                onClose={() => setSigModal({ isOpen: false, target: null, title: '' })}
                onSave={(dataUrl) => {
                    if (sigModal.target === 'main') {
                        setField('signature', dataUrl);
                    }
                }}
            />
        </div>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr) return '...';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Preview = ({ formData }) => {
    const rememberItems = (formData.remember || []).map(item => typeof item === 'string' ? { text: item, sub: [] } : item);

    return (
        <div className="text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt' }}>
            <div className="text-center mb-8" style={{ marginBottom: 30 }}>
                <h1 className="font-bold text-lg uppercase tracking-wide border-b-2 border-black inline-block px-4 pb-1 mb-1">SURAT PERINTAH PERJALANAN DINAS</h1>
                <p>NOMOR {formData.docNumber || '...'}</p>
            </div>

            {/* Menimbang */}
            <table className="sppd-table">
                <tbody>
                    <tr>
                        <td className="sppd-label">Menimbang</td>
                        <td className="sppd-colon">:</td>
                        <td>{formData.weigh || '...'}</td>
                    </tr>
                </tbody>
            </table>

            {/* Mengingat with sub-items */}
            <table className="sppd-table mb-6">
                <tbody>
                    <tr>
                        <td className="sppd-label">Mengingat</td>
                        <td className="sppd-colon">:</td>
                        <td>
                            <ol className="list-numbered" style={{ marginTop: 0, marginBottom: 0, paddingLeft: 15 }}>
                                {rememberItems.length > 0 ? (
                                    rememberItems.map((item, i) => (
                                        <li key={i}>
                                            {item.text || '...'}
                                            {item.sub && item.sub.length > 0 && (
                                                <ol className="list-[lower-alpha] pl-5 mt-1 space-y-0.5">
                                                    {item.sub.map((sub, si) => (
                                                        <li key={si}>{sub || '...'}</li>
                                                    ))}
                                                </ol>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li>...</li>
                                )}
                            </ol>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="text-center font-bold my-6 uppercase tracking-wider">Memberi Perintah</div>

            {/* Kepada */}
            <table className="sppd-table">
                <tbody>
                    <tr>
                        <td className="sppd-label">Kepada</td>
                        <td className="sppd-colon">:</td>
                        <td className="font-bold">{formData.to || '...'}</td>
                    </tr>
                </tbody>
            </table>

            {/* Untuk */}
            <table className="sppd-table mb-10">
                <tbody>
                    <tr>
                        <td className="sppd-label">Untuk</td>
                        <td className="sppd-colon">:</td>
                        <td>
                            <ol className="list-numbered" style={{ marginTop: 0 }}>
                                <li>{formData.task || '...'}</li>
                                <li>
                                    Perjalanan dinas dilaksanakan, sebagai berikut:
                                    <table className="w-full mt-2 ml-2 sub-table">
                                        <tbody>
                                            <tr><td style={{ width: 100 }}>Tujuan</td><td style={{ width: 10 }}>:</td><td>{formData.dest || '...'}</td></tr>
                                            <tr><td>Berangkat</td><td>:</td><td>{formatDate(formData.dateGo)}</td></tr>
                                            <tr><td>Kembali</td><td>:</td><td>{formatDate(formData.dateBack)}</td></tr>
                                            <tr><td>Transportasi</td><td>:</td><td>{formData.transport || '...'}</td></tr>
                                        </tbody>
                                    </table>
                                </li>
                                <li>{formData.funding || 'Biaya Perjalanan Dinas ini dibebankan pada beban perusahaan.'}</li>
                                <li>{formData.report || 'Melaporkan pelaksanaan tugas kepada Direksi.'}</li>
                                <li>{formData.close || 'Agar Saudara melaksanakan perintah ini dengan penuh tanggung jawab.'}</li>
                            </ol>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Signature */}
            <div className="signature-section" style={{ float: 'right', width: '300px', textAlign: 'center' }}>
                <p className="mb-0 text-left">Dikeluarkan di {formData.loc || '...'}</p>
                <p className="mb-4 text-left border-b border-black pb-1">pada tanggal {formatDate(formData.signDate)}</p>
                <p className="font-bold uppercase mb-0">DIREKSI,</p>
                <p className="font-bold uppercase mb-0">{formData.signPos || '...'}</p>
                <div className="h-24 w-full flex items-center justify-center my-2">
                    {formData.signature && <img src={formData.signature} className="max-h-24 object-contain" alt="TTD" />}
                </div>
                <p className="font-bold uppercase underline mb-0">{formData.signName || '...'}</p>
            </div>
            <div style={{ clear: 'both' }}></div>

            {/* Tembusan */}
            {formData.cc && formData.cc.length > 0 && formData.cc[0] !== '' && (
                <div className="mt-8 text-sm">
                    <p className="font-bold underline mb-1">Tembusan:</p>
                    <ol className="list-decimal pl-5">
                        {formData.cc.map((c, i) => c ? <li key={i}>{c}</li> : null)}
                    </ol>
                </div>
            )}
        </div>
    );
};

SppdEditor.Preview = Preview;
export default SppdEditor;
