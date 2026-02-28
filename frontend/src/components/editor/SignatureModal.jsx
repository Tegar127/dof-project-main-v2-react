import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Upload, PenTool, Eraser, Check } from 'lucide-react';

const SignatureModal = ({ isOpen, onClose, onSave, title = "Tanda Tangan" }) => {
    const sigCanvas = useRef(null);
    const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
    const [uploadedImage, setUploadedImage] = useState(null);

    // Default width and height for canvas based on max-w-md
    const canvasWidth = 400;
    const canvasHeight = 200;

    useEffect(() => {
        if (isOpen) {
            setMode('draw');
            setUploadedImage(null);
            // Delay clearing to ensure canvas is fully rendered
            setTimeout(() => {
                if (sigCanvas.current) {
                    sigCanvas.current.clear();
                }
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const clearSignature = () => {
        if (mode === 'draw' && sigCanvas.current) {
            sigCanvas.current.clear();
        } else if (mode === 'upload') {
            setUploadedImage(null);
        }
    };

    const handleSave = () => {
        try {
            if (mode === 'draw') {
                if (!sigCanvas.current) {
                    alert("Gagal memuat canvas tanda tangan.");
                    return;
                }
                if (sigCanvas.current.isEmpty()) {
                    alert("Tanda tangan kosong! Silakan coret tanda tangan terlebih dahulu.");
                    return;
                }
                const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                onSave(dataUrl);
            } else if (mode === 'upload') {
                if (!uploadedImage) {
                    alert("Belum ada gambar yang diunggah!");
                    return;
                }
                onSave(uploadedImage);
            }
            onClose();
        } catch (error) {
            console.error("Terjadi error saat menyimpan TTD:", error);
            alert("Sistem gagal memproses gambar tanda tangan. Error: " + error.message);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Harap unggah file gambar (PNG, JPG, dll).");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <button type="button" onClick={(e) => { e.preventDefault(); onClose(); }} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setMode('draw'); }}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'draw' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <PenTool size={16} /> Gambar TTD
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setMode('upload'); }}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Upload size={16} /> Unggah File
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 bg-slate-50/50 flex justify-center">
                    {mode === 'draw' && (
                        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-1 w-full flex justify-center items-center overflow-hidden">
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{
                                    width: canvasWidth,
                                    height: canvasHeight,
                                    className: 'rounded-lg cursor-crosshair touch-none'
                                }}
                            />
                        </div>
                    )}

                    {mode === 'upload' && (
                        <div className="bg-white w-full rounded-xl border-2 border-dashed border-slate-200 h-[210px] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Uploaded Signature" className="max-h-full max-w-full object-contain pointer-events-none" />
                            ) : (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">Klik untuk unggah gambar</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG atau JPG dengan background transparan disarankan</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Pilih file gambar tanda tangan"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); clearSignature(); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Eraser size={16} /> Hapus Ulang
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); onClose(); }}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleSave(); }}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                        >
                            <Check size={16} /> Gunakan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal;
