import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Plus, X } from 'lucide-react';

const NotaEditor = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Basis uses object structure { text, sub[] } matching Laravel
    const handleBasisChange = (index, value) => {
        const basis = [...(formData.basis || [{ text: '', sub: [] }])];
        if (typeof basis[index] === 'string') basis[index] = { text: basis[index], sub: [] };
        basis[index] = { ...basis[index], text: value };
        setFormData(prev => ({ ...prev, basis }));
    };

    const addBasis = () => {
        const basis = [...(formData.basis || []), { text: '', sub: [] }];
        setFormData(prev => ({ ...prev, basis }));
    };

    const removeBasis = (index) => {
        const basis = [...(formData.basis || [])];
        basis.splice(index, 1);
        setFormData(prev => ({ ...prev, basis }));
    };

    const addSubItem = (index) => {
        const basis = [...(formData.basis || [])];
        if (typeof basis[index] === 'string') basis[index] = { text: basis[index], sub: [] };
        if (!basis[index].sub) basis[index].sub = [];
        basis[index] = { ...basis[index], sub: [...basis[index].sub, ''] };
        setFormData(prev => ({ ...prev, basis }));
    };

    const handleSubChange = (parentIndex, subIndex, value) => {
        const basis = [...(formData.basis || [])];
        const subs = [...(basis[parentIndex].sub || [])];
        subs[subIndex] = value;
        basis[parentIndex] = { ...basis[parentIndex], sub: subs };
        setFormData(prev => ({ ...prev, basis }));
    };

    const removeSubItem = (parentIndex, subIndex) => {
        const basis = [...(formData.basis || [])];
        const subs = [...(basis[parentIndex].sub || [])];
        subs.splice(subIndex, 1);
        basis[parentIndex] = { ...basis[parentIndex], sub: subs };
        setFormData(prev => ({ ...prev, basis }));
    };

    // Multiple recipients matching Laravel
    const handleToChange = (index, value) => {
        const to = [...(formData.to || [''])];
        to[index] = value;
        setFormData(prev => ({ ...prev, to }));
    };

    const addTo = () => {
        const to = [...(formData.to || ['']), ''];
        setFormData(prev => ({ ...prev, to }));
    };

    const removeTo = (index) => {
        const to = [...(formData.to || [])];
        to.splice(index, 1);
        setFormData(prev => ({ ...prev, to }));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Input Data</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                <input type="text" name="docNumber" value={formData.docNumber || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="ND-.../..." />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Multiple recipients */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kepada</label>
                    {(Array.isArray(formData.to) ? formData.to : [formData.to || '']).map((item, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <input type="text" value={item} onChange={(e) => handleToChange(i, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded" placeholder="Kepada (Yth...)" />
                            {i > 0 && <button type="button" onClick={() => removeTo(i)} className="px-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>}
                        </div>
                    ))}
                    <button type="button" onClick={addTo} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Tambah Penerima</button>
                </div>

                <input type="text" name="from" value={formData.from || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Dari" />
                <input type="text" name="att" value={formData.att || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Lampiran" />
                <textarea name="subject" value={formData.subject || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded" placeholder="Hal / Perihal"></textarea>
            </div>

            <hr className="border-gray-200" />

            {/* Berdasarkan with sub-items */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Berdasarkan (Poin)</label>
                <div className="space-y-2">
                    {(formData.basis || [{ text: '', sub: [] }]).map((item, i) => {
                        const basisItem = typeof item === 'string' ? { text: item, sub: [] } : item;
                        return (
                            <div key={i} className="space-y-1">
                                <div className="flex gap-2">
                                    <input type="text" value={basisItem.text} onChange={(e) => handleBasisChange(i, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded" placeholder={`Poin ${i + 1}...`} />
                                    <button type="button" onClick={() => addSubItem(i)} className="px-2 text-blue-500 hover:bg-blue-50 rounded text-xs" title="Tambah sub-poin">+sub</button>
                                    {i > 0 && <button type="button" onClick={() => removeBasis(i)} className="px-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>}
                                </div>
                                {/* Sub-items */}
                                {basisItem.sub && basisItem.sub.length > 0 && (
                                    <div className="ml-6 space-y-1">
                                        {basisItem.sub.map((sub, si) => (
                                            <div key={si} className="flex gap-2">
                                                <span className="pt-2 text-xs text-gray-400">{String.fromCharCode(97 + si)}.</span>
                                                <input type="text" value={sub} onChange={(e) => handleSubChange(i, si, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" placeholder={`Sub-poin ${si + 1}...`} />
                                                <button type="button" onClick={() => removeSubItem(i, si)} className="px-2 text-red-400 hover:bg-red-50 rounded text-xs"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <button type="button" onClick={addBasis} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 mt-2">+ Tambah Poin</button>
            </div>

            {/* CKEditor for content - matching Laravel */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Paragraf</label>
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
                    }}
                    data={formData.content || ''}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData(prev => ({ ...prev, content: data }));
                    }}
                />
            </div>

            {/* Closing text - editable like Laravel */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label>
                <input type="text" name="closing" value={formData.closing || 'Demikian disampaikan dan untuk dijadikan periksa.'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Lokasi</label>
                    <input type="text" name="loc" value={formData.loc || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Jakarta" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Tanggal</label>
                    <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
            </div>

            <div className="space-y-2">
                <input type="text" name="pos" value={formData.pos || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Jabatan" />
                <input type="text" name="div" value={formData.div || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Divisi" />
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Nama Penandatangan" />
            </div>

            {/* PLH/PJS field - Requirement from Laravel */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">PLH / PJS (Opsional)</label>
                <input type="text" name="plh_pjs" value={formData.plh_pjs || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Pelaksana Harian / Pelaksana Tugas" />
            </div>
        </div>
    );
};

// Helper to format date to Indonesian
const formatDate = (dateStr) => {
    if (!dateStr) return '...';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Preview = ({ formData }) => {
    // Normalize basis items
    const basisItems = (formData.basis || []).map(item => typeof item === 'string' ? { text: item, sub: [] } : item);
    const toList = Array.isArray(formData.to) ? formData.to : [formData.to || '...'];

    return (
        <div className="text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt' }}>
            <div className="text-center mb-8">
                <h1 className="font-bold text-lg uppercase tracking-wide border-b-2 border-black inline-block px-4 pb-1 mb-1">NOTA DINAS</h1>
                <p>NOMOR {formData.docNumber || '...'}</p>
            </div>

            <table className="info-table w-full mb-6">
                <tbody>
                    <tr><td style={{ width: 100 }}>Kepada</td><td style={{ width: 20 }}>:</td><td>Yth. {toList.filter(t => t).join(', ') || '...'}</td></tr>
                    <tr><td>Dari</td><td>:</td><td>{formData.from || '...'}</td></tr>
                    <tr><td>Lampiran</td><td>:</td><td>{formData.att || '...'}</td></tr>
                    <tr><td>Hal</td><td>:</td><td className="font-bold">{formData.subject || '...'}</td></tr>
                </tbody>
            </table>

            <hr className="border-t-2 border-black mb-6" />

            {/* Berdasarkan with sub-items */}
            <div className="mb-4">
                <p className="mb-2">Berdasarkan:</p>
                <ol className="list-numbered text-justify">
                    {basisItems.length > 0 ? (
                        basisItems.map((item, i) => (
                            <li key={i}>
                                {item.text || '...'}
                                {item.sub && item.sub.length > 0 && (
                                    <ol className="list-[lower-alpha] pl-6 mt-1 space-y-0.5">
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
            </div>

            {/* CKEditor HTML content */}
            <div className="mb-8 text-justify leading-relaxed">
                {formData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.content }} style={{ whiteSpace: 'pre-wrap' }} />
                ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>...</p>
                )}
            </div>

            <p className="mb-8">{formData.closing || 'Demikian disampaikan dan untuk dijadikan periksa.'}</p>

            <div className="signature-section">
                <p className="mb-1">{formData.loc || '...'}, {formatDate(formData.date)}</p>
                {formData.plh_pjs && <p className="mb-0 text-[10pt]">{formData.plh_pjs}</p>}
                <p className="font-bold uppercase mb-0">{formData.pos || '...'}</p>
                <p className="font-bold uppercase mb-16">{formData.div || '...'}</p>
                <p className="font-bold uppercase underline">{formData.name || '...'}</p>
            </div>
            <div style={{ clear: 'both' }}></div>
        </div>
    );
};

NotaEditor.Preview = Preview;
export default NotaEditor;
