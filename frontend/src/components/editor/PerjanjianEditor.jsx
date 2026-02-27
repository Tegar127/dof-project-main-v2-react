import React from 'react';
import { X } from 'lucide-react';

const PerjanjianEditor = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Points array
    const handlePointChange = (index, value) => {
        const points = [...(formData.points || [''])];
        points[index] = value;
        setFormData(prev => ({ ...prev, points }));
    };

    const addPoint = () => {
        const points = [...(formData.points || ['']), ''];
        setFormData(prev => ({ ...prev, points }));
    };

    const removePoint = (index) => {
        const points = [...(formData.points || [])];
        points.splice(index, 1);
        setFormData(prev => ({ ...prev, points }));
    };

    // Paraf Handle
    const handleParafChange = (index, field, value) => {
        const paraf = [...(formData.paraf || [{ name: '', title: '' }])];
        paraf[index] = { ...paraf[index], [field]: value };
        setFormData(prev => ({ ...prev, paraf }));
    };

    const addParafItem = () => {
        const paraf = [...(formData.paraf || [{ name: '', title: '' }]), { name: '', title: '' }];
        setFormData(prev => ({ ...prev, paraf }));
    };

    const removeParafItem = (index) => {
        const paraf = [...(formData.paraf || [])];
        paraf.splice(index, 1);
        setFormData(prev => ({ ...prev, paraf }));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Input Data</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                <input type="text" name="docNumber" value={formData.docNumber || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="PKS-.../..." />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase">Judul & Tentang</label>
                <textarea name="about" value={formData.about || ''} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded" placeholder="TENTANG SEWA MENYEWA..."></textarea>
            </div>

            <div className="bg-amber-50 p-3 rounded border border-amber-200 space-y-2">
                <label className="block text-sm font-bold text-amber-800">Waktu & Tempat</label>
                <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="day" value={formData.day || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Hari (Senin)" />
                    <input type="text" name="dateWritten" value={formData.dateWritten || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Tanggal Teks (sembilan belas...)" />
                </div>
                <input type="text" name="place" value={formData.place || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Tempat (Jakarta)" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase">Pihak Kesatu (ASABRI)</label>
                <input type="text" name="p1Name" value={formData.p1Name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Nama Penandatangan (Hari Murti)" />
                <input type="text" name="p1Pos" value={formData.p1Pos || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Jabatan" />
                <textarea name="p1Auth" value={formData.p1Auth || ''} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded" placeholder="Berdasarkan Surat Kuasa..."></textarea>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase">Pihak Kedua</label>
                <input type="text" name="p2Name" value={formData.p2Name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Nama Pihak Kedua" />
                <textarea name="p2Info" value={formData.p2Info || ''} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded" placeholder="Lahir di..., Alamat..., NIK..."></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 font-bold">Poin-poin Perjanjian (A, B...)</label>
                <div className="space-y-2">
                    {(formData.points || ['']).map((item, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="pt-2 font-bold text-gray-400">#</span>
                            <textarea value={item} onChange={(e) => handlePointChange(i, e.target.value)} className="w-full p-2 border border-gray-300 rounded" rows="2" placeholder="Bahwa Pihak..."></textarea>
                            {i > 0 && <button type="button" onClick={() => removePoint(i)} className="px-2 py-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addPoint} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100 mt-2">+ Tambah Poin</button>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 font-bold">Tabel Paraf</label>
                <div className="space-y-2">
                    {(formData.paraf || [{ name: '', title: '' }, { name: '', title: '' }]).map((p, i) => (
                        <div key={i} className="flex gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="flex-1 space-y-2">
                                <input type="text" value={p.title || ''} onChange={(e) => handleParafChange(i, 'title', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Sebagai Pihak (PIHAK KESATU)" />
                                <input type="text" value={p.name || ''} onChange={(e) => handleParafChange(i, 'name', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Nama..." />
                            </div>
                            <button type="button" onClick={() => removeParafItem(i)} className="px-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addParafItem} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100 mt-2">+ Tambah Baris Paraf</button>
            </div>
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
                            <tr className="row-signature">
                                {formData.paraf.map((p, i) => (
                                    <td key={i} className="cell-width font-bold uppercase underline">{p.name || '...'}</td>
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
