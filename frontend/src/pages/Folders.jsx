import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Folder, FolderPlus, FolderOpen, Edit2, Trash2, FileText, ChevronRight, CornerDownRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Folders = () => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Virtual Explorer State
    const [currentFolder, setCurrentFolder] = useState(null); // null means root
    const [contents, setContents] = useState({ folders: [], documents: [] });

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', parent_id: '' });

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        loadContents(currentFolder);
    }, [currentFolder, folders]); // Reload when currentFolder or entire folders tree changes

    const loadFolders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/folders');
            setFolders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadContents = async (folderId) => {
        try {
            // Find children folders
            const childFolders = folders.filter(f => f.parent_id === folderId);

            // Fetch documents in this folder
            let docs = [];
            if (folderId) {
                const res = await api.get(`/folders/${folderId}`);
                docs = res.data.data.documents || [];
            } else {
                // If in root, fetch documents with no folder
                const res = await api.get('/documents');
                const allDocs = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
                docs = allDocs.filter(d => !d.folder_id);
            }

            setContents({ folders: childFolders, documents: docs });
        } catch (err) {
            console.error("Failed to load folder contents", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, parent_id: form.parent_id || null };
            if (editItem) {
                await api.put(`/folders/${editItem.id}`, payload);
            } else {
                await api.post('/folders', payload);
            }
            setShowModal(false);
            loadFolders();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan folder');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus folder ini beserta isinya?')) return;
        try {
            await api.delete(`/folders/${id}`);
            if (currentFolder === id) setCurrentFolder(null);
            loadFolders();
        } catch (err) {
            alert('Gagal menghapus folder. Pastikan folder kosong atau Anda memiliki akses.');
        }
    };

    const openModal = (folder = null, rootOnly = false) => {
        setEditItem(folder);
        if (folder) {
            setForm({ name: folder.name, description: folder.description || '', parent_id: folder.parent_id || '' });
        } else {
            setForm({ name: '', description: '', parent_id: rootOnly ? '' : (currentFolder || '') });
        }
        setShowModal(true);
    };

    // Breadcrumb Generation
    const getBreadcrumbs = () => {
        const crumbs = [];
        let curr = folders.find(f => f.id === currentFolder);
        while (curr) {
            crumbs.unshift(curr);
            curr = folders.find(f => f.id === curr.parent_id);
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Folder</h1>
                    <p className="text-slate-500">Struktur arsip dokumen dinas.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => openModal(null, false)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm">
                        <FolderPlus size={16} /> Buat Folder
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                {/* File Explorer Header (Breadcrumbs) */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <button onClick={() => setCurrentFolder(null)} className={`hover:text-indigo-600 transition flex items-center gap-1 ${!currentFolder ? 'text-indigo-700' : ''}`}>
                        <FolderOpen size={16} className={!currentFolder ? 'text-indigo-600' : ''} /> ROOT
                    </button>
                    {breadcrumbs.map(crumb => (
                        <div key={crumb.id} className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-400" />
                            <button onClick={() => setCurrentFolder(crumb.id)} className={`hover:text-indigo-600 transition ${currentFolder === crumb.id ? 'text-indigo-700' : ''}`}>
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Memuat folder...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">

                            {/* Folder List */}
                            {contents.folders.map(f => (
                                <div key={f.id} className="relative group">
                                    <button
                                        onDoubleClick={() => setCurrentFolder(f.id)}
                                        onClick={() => setCurrentFolder(f.id)} // for mobile friendliness but double click is desktop standard
                                        className="w-full flex flex-col items-center p-4 rounded-2xl border-2 border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition duration-200"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 text-blue-500 flex items-center justify-center rounded-xl mb-3 group-hover:scale-105 transition shadow-sm">
                                            <Folder size={32} fill="currentColor" className="text-blue-400" />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 text-center break-all">{f.name}</h4>
                                    </button>

                                    {/* Action dropdown/buttons on hover */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                        <button onClick={(e) => { e.stopPropagation(); openModal(f); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50"><Edit2 size={12} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-slate-50"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}

                            {/* Document List */}
                            {contents.documents.map(d => (
                                <Link key={d.id} to={`/documents/${d.id}/view`} className="w-full flex flex-col items-center p-4 rounded-2xl border-2 border-transparent hover:border-slate-200 hover:bg-slate-50 transition duration-200 group">
                                    <div className="w-16 h-16 bg-slate-100 text-slate-500 flex items-center justify-center rounded-lg mb-3 shadow-sm border border-slate-200">
                                        <FileText size={28} />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 text-center break-all">{d.title}</h4>
                                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{d.type}</span>
                                </Link>
                            ))}

                            {contents.folders.length === 0 && contents.documents.length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                                    <FolderOpen size={48} className="mb-4 opacity-20" />
                                    <p>Folder ini kosong</p>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Folder Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">{editItem ? 'Edit Folder' : 'Buat Folder Baru'}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Folder</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Contoh: Surat Masuk 2026" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Parent Folder (Opsional)</label>
                                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="">-- ROOT (Paling Luar) --</option>
                                    {folders.filter(f => f.id !== editItem?.id).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"></textarea>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Folders;
