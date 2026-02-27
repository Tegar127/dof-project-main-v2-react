import React, { useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, X } from 'lucide-react';

/* ── Role Badge Styling ── */
const ROLE_BADGES = {
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800',
    reviewer: 'bg-green-100 text-green-800'
};

/* ── User Form (Create / Edit) ── */
const UserForm = ({ form, setForm, groups, editing, onSubmit, onCancel }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editing ? 'Edit User' : 'Add New User'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input type="text" required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input type="email" required value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Password {editing && <span className="text-xs font-normal text-slate-400 ml-1">(Leave blank to keep current)</span>}
                        </label>
                        <input type="password" required={!editing} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                            <select required value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="reviewer">Reviewer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Group</label>
                            <select value={form.group_name || ''} onChange={e => setForm({ ...form, group_name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                <option value="">No Group</option>
                                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Position (Jabatan)</label>
                        <select value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                            <option value="">Select Position</option>
                            <option value="direksi">Direksi</option>
                            <option value="kadiv">Kepala Divisi (KADIV)</option>
                            <option value="kabid">Kepala Bidang (KABID)</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Group Memberships</label>
                        <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {groups.map(g => (
                                <label key={g.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={(form.extra_groups || []).includes(g.id)}
                                        onChange={e => {
                                            const ids = new Set(form.extra_groups || []);
                                            e.target.checked ? ids.add(g.id) : ids.delete(g.id);
                                            setForm({ ...form, extra_groups: [...ids] });
                                        }}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="text-xs font-medium text-slate-700 truncate">{g.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">{editing ? 'Update User' : 'Save User'}</button>
                </div>
            </form>
        </div>
    </div>
);

/* ── Users Table ── */
const UsersTable = ({ users, searchTerm, onSearch, onNew, onEdit, onDelete }) => {
    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage system access and roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari user..." value={searchTerm} onChange={e => onSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>
                    <button onClick={onNew} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm font-semibold">
                        <UserPlus size={18} /> New User
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">User Info</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4">Groups</th>
                            <th className="px-6 py-4">Total Work</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{user.name}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${ROLE_BADGES[user.role] || 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.position
                                        ? <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded">{user.position}</span>
                                        : <span className="text-xs text-slate-400">-</span>
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.group_name && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {user.group_name}
                                            </div>
                                        )}
                                        {(user.groups || []).filter(g => g.name !== user.group_name).map(g => (
                                            <div key={g.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                {g.name}
                                            </div>
                                        ))}
                                        {!user.group_name && (!user.groups || user.groups.length === 0) && (
                                            <span className="text-sm text-slate-400 italic">No Group</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{user.work_logs_sum_duration_minutes || 0} m</span>
                                        <span className="text-xs text-slate-400">{((user.work_logs_sum_duration_minutes || 0) / 60).toFixed(1)} hrs</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEdit(user)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg" title="Edit User"><Edit2 size={18} /></button>
                                        <button onClick={() => onDelete(user.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg" title="Delete User"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ── Exported Tab Component ── */
const UsersTab = ({ users, groups, onSave, onDelete, showNotif }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ extra_groups: [] });
    const [search, setSearch] = useState('');

    const handleNew = () => {
        setEditing(null);
        setForm({ extra_groups: [] });
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditing(user.id);
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            group_name: user.group_name,
            position: user.position,
            extra_groups: user.groups ? user.groups.map(g => g.id) : []
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditing(null);
        setForm({ extra_groups: [] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSave(editing, form);
        if (success) handleCancel();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        await onDelete(id);
    };

    if (showForm) {
        return <UserForm form={form} setForm={setForm} groups={groups} editing={editing} onSubmit={handleSubmit} onCancel={handleCancel} />;
    }

    return <UsersTable users={users} searchTerm={search} onSearch={setSearch} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} />;
};

export default UsersTab;
