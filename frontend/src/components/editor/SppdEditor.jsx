import React from 'react';
import { X } from 'lucide-react';

const SppdEditor = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Mengingat (remember) with sub-items matching Laravel
    const handleRememberChange = (index, value) => {
        const remember = [...(formData.remember || [{ text: '', sub: [] }])];
        if (typeof remember[index] === 'string') remember[index] = { text: remember[index], sub: [] };
        remember[index] = { ...remember[index], text: value };
        setFormData(prev => ({ ...prev, remember }));
    };

    const addRemember = () => {
        const remember = [...(formData.remember || []), { text: '', sub: [] }];
        setFormData(prev => ({ ...prev, remember }));
    };

    const removeRemember = (index) => {
        const remember = [...(formData.remember || [])];
        remember.splice(index, 1);
        setFormData(prev => ({ ...prev, remember }));
    };

    const addRememberSub = (index) => {
        const remember = [...(formData.remember || [])];
        if (typeof remember[index] === 'string') remember[index] = { text: remember[index], sub: [] };
        if (!remember[index].sub) remember[index].sub = [];
        remember[index] = { ...remember[index], sub: [...remember[index].sub, ''] };
        setFormData(prev => ({ ...prev, remember }));
    };

    const handleRememberSubChange = (parentIndex, subIndex, value) => {
        const remember = [...(formData.remember || [])];
        const subs = [...(remember[parentIndex].sub || [])];
        subs[subIndex] = value;
        remember[parentIndex] = { ...remember[parentIndex], sub: subs };
        setFormData(prev => ({ ...prev, remember }));
    };

    const removeRememberSub = (parentIndex, subIndex) => {
        const remember = [...(formData.remember || [])];
        const subs = [...(remember[parentIndex].sub || [])];
        subs.splice(subIndex, 1);
        remember[parentIndex] = { ...remember[parentIndex], sub: subs };
        setFormData(prev => ({ ...prev, remember }));
    };

    // CC (tembusan) array
    const handleCcChange = (index, value) => {
        const cc = [...(formData.cc || [''])];
        cc[index] = value;
        setFormData(prev => ({ ...prev, cc }));
    };

    const addCc = () => {
        const cc = [...(formData.cc || ['']), ''];
        setFormData(prev => ({ ...prev, cc }));
    };

    const removeCc = (index) => {
        const cc = [...(formData.cc || [])];
        cc.splice(index, 1);
        setFormData(prev => ({ ...prev, cc }));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Input Data</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                <input type="text" name="docNumber" value={formData.docNumber || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="SPPD-.../..." />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Menimbang</label>
                <textarea name="weigh" value={formData.weigh || ''} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded" placeholder="bahwa dalam rangka..."></textarea>
            </div>

            {/* Mengingat with sub-items */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mengingat (List)</label>
                <div className="space-y-2">
                    {(formData.remember || [{ text: '', sub: [] }]).map((item, i) => {
                        const remItem = typeof item === 'string' ? { text: item, sub: [] } : item;
                        return (
                            <div key={i} className="space-y-1">
                                <div className="flex gap-2">
                                    <input type="text" value={remItem.text} onChange={(e) => handleRememberChange(i, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded" placeholder="Peraturan..." />
                                    <button type="button" onClick={() => addRememberSub(i)} className="px-2 text-blue-500 hover:bg-blue-50 rounded text-xs" title="Tambah sub-poin">+sub</button>
                                    {i > 0 && <button type="button" onClick={() => removeRemember(i)} className="px-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>}
                                </div>
                                {remItem.sub && remItem.sub.length > 0 && (
                                    <div className="ml-6 space-y-1">
                                        {remItem.sub.map((sub, si) => (
                                            <div key={si} className="flex gap-2">
                                                <span className="pt-2 text-xs text-gray-400">{String.fromCharCode(97 + si)}.</span>
                                                <input type="text" value={sub} onChange={(e) => handleRememberSubChange(i, si, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" placeholder={`Sub-poin ${si + 1}...`} />
                                                <button type="button" onClick={() => removeRememberSub(i, si)} className="px-2 text-red-400 hover:bg-red-50 rounded text-xs"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <button type="button" onClick={addRemember} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 mt-2">+ Tambah</button>
            </div>

            <hr className="border-gray-200" />
            <input type="text" name="to" value={formData.to || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Kepada (Nama & Jabatan)" />

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Detail Perintah (Untuk)</label>

                <label className="text-xs text-gray-500">Poin 1: Kegiatan</label>
                <input type="text" name="task" value={formData.task || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mb-2" placeholder="Melaksanakan kegiatan..." />

                <label className="text-xs text-gray-500">Poin 2: Detail Perjalanan</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" name="dest" value={formData.dest || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded" placeholder="Tujuan (Denpasar)" />
                    <input type="text" name="transport" value={formData.transport || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded" placeholder="Pesawat Udara" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div><span className="text-xs">Berangkat</span><input type="date" name="dateGo" value={formData.dateGo || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" /></div>
                    <div><span className="text-xs">Kembali</span><input type="date" name="dateBack" value={formData.dateBack || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" /></div>
                </div>

                <label className="text-xs text-gray-500">Poin 3, 4, 5 (Standar/Edit)</label>
                <textarea name="funding" value={formData.funding || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Biaya dibebankan..."></textarea>
                <textarea name="report" value={formData.report || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Melaporkan pelaksanaan..."></textarea>
                <textarea name="close" value={formData.close || ''} onChange={handleChange} rows="1" className="w-full p-2 border border-gray-300 rounded" placeholder="Melaksanakan dengan tanggung jawab."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input type="text" name="loc" value={formData.loc || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Lokasi" />
                <input type="date" name="signDate" value={formData.signDate || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <input type="text" name="signPos" value={formData.signPos || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="DIREKTUR UTAMA" />
            <input type="text" name="signName" value={formData.signName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Nama Penandatangan" />

            {/* Tembusan */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Tembusan</label>
                <div className="space-y-2">
                    {(formData.cc || ['']).map((item, i) => (
                        <div key={i} className="flex gap-2">
                            <input type="text" value={item} onChange={(e) => handleCcChange(i, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded" placeholder="Direksi..." />
                            {i > 0 && <button type="button" onClick={() => removeCc(i)} className="px-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addCc} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 mt-2">+ Tambah</button>
            </div>
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
            <div className="signature-section">
                <p className="mb-1">Dikeluarkan di {formData.loc || '...'}</p>
                <p className="mb-1">pada tanggal {formatDate(formData.signDate)}</p>
                <p className="font-bold uppercase mb-0">DIREKSI,</p>
                <p className="font-bold uppercase mb-16">{formData.signPos || '...'}</p>
                <p className="font-bold uppercase underline">{formData.signName || '...'}</p>
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
