import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Building2, Plus, Edit2, Trash2, Search } from 'lucide-react';

const UsersGroups = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form states
    const [userForm, setUserForm] = useState({ name: '', npk: '', position: '', role: 'user', group_id: '', password: '' });
    const [groupForm, setGroupForm] = useState({ name: '', code: '', description: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, groupsRes] = await Promise.all([
                api.get('/users'),
                api.get('/groups')
            ]);
            setUsers(usersRes.data.data);
            setGroups(groupsRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- User Actions ---
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                const payload = { ...userForm };
                if (!payload.password) delete payload.password; // Don't send empty password
                await api.put(`/users/${editItem.id}`, payload);
            } else {
                await api.post('/users', userForm);
            }
            setShowUserModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan user');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Hapus user ini?')) return;
        try {
            await api.delete(`/users/${id}`);
            loadData();
        } catch (err) {
            alert('Gagal menghapus user');
        }
    };

    const openUserModal = (user = null) => {
        setEditItem(user);
        if (user) {
            setUserForm({
                name: user.name,
                npk: user.npk,
                position: user.position || '',
                role: user.role,
                group_id: user.group_id || '',
                password: ''
            });
        } else {
            setUserForm({ name: '', npk: '', position: '', role: 'user', group_id: '', password: '' });
        }
        setShowUserModal(true);
    };

    // --- Group Actions ---
    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await api.put(`/groups/${editItem.id}`, groupForm);
            } else {
                await api.post('/groups', groupForm);
            }
            setShowGroupModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan group');
        }
    };

    const deleteGroup = async (id) => {
        if (!window.confirm('Hapus group ini?')) return;
        try {
            await api.delete(`/groups/${id}`);
            loadData();
        } catch (err) {
            alert('Gagal menghapus group');
        }
    };

    const openGroupModal = (group = null) => {
        setEditItem(group);
        if (group) {
            setGroupForm({ name: group.name, code: group.code, description: group.description || '' });
        } else {
            setGroupForm({ name: '', code: '', description: '' });
        }
        setShowGroupModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna & Grup</h1>
                    <p className="text-slate-500">Kelola akses pengguna dan struktur grup organisasi.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm font-bold">
                <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 flex justify-center items-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Users size={18} /> Pengguna
                </button>
                <button onClick={() => setActiveTab('groups')} className={`flex-1 py-4 flex justify-center items-center gap-2 transition-colors ${activeTab === 'groups' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Building2 size={18} /> Grup / Unit Kerja
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Memuat data...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Users Content */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Cari pengguna..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <button onClick={() => openUserModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                                    <Plus size={16} /> Tambah Pengguna
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                                            <th className="px-6 py-4">Nama / NPK</th>
                                            <th className="px-6 py-4">Jabatan</th>
                                            <th className="px-6 py-4">Grup</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{u.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{u.npk}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">{u.position || '-'}</td>
                                                <td className="px-6 py-4 text-slate-700">{u.group?.name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openUserModal(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 size={16} /></button>
                                                        <button onClick={() => deleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Groups Content */}
                    {activeTab === 'groups' && (
                        <div>
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Cari grup..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <button onClick={() => openGroupModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                                    <Plus size={16} /> Tambah Grup
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
                                {groups.map(g => (
                                    <div key={g.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                {g.code}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openGroupModal(g)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={14} /></button>
                                                <button onClick={() => deleteGroup(g.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">{g.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{g.description || 'Tidak ada deskripsi'}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-semibold text-slate-600">
                                            <span><Users size={14} className="inline mr-1" /> Anggota</span>
                                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">{users.filter(u => u.group_id === g.id).length}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">{editItem ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
                        </div>
                        <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input type="text" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">NPK / Username</label>
                                    <input type="text" required value={userForm.npk} onChange={e => setUserForm({ ...userForm, npk: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password {editItem && <span className="text-xs font-normal text-slate-400">(Kosongkan jika tidak diubah)</span>}</label>
                                <input type="password" required={!editItem} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Grup / Unit</label>
                                    <select required value={userForm.group_id} onChange={e => setUserForm({ ...userForm, group_id: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                        <option value="">Pilih Grup...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Jabatan</label>
                                    <input type="text" value={userForm.position} onChange={e => setUserForm({ ...userForm, position: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Contoh: Kepala Divisi" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Role Akses</label>
                                <select required value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="user">User Standar</option>
                                    <option value="manager">Manager / Kadiv</option>
                                    <option value="director">Direksi</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">{editItem ? 'Edit Grup' : 'Tambah Grup'}</h3>
                        </div>
                        <form onSubmit={handleGroupSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Grup / Unit</label>
                                <input type="text" required value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Kode Grup</label>
                                <input type="text" required value={groupForm.code} onChange={e => setGroupForm({ ...groupForm, code: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm uppercase" placeholder="Contoh: IT, HR, FIN" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} rows="3" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Opsional..."></textarea>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowGroupModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersGroups;
