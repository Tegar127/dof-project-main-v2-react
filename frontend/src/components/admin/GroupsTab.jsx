import React, { useState } from 'react';
import { UsersRound, Plus, Edit2, Trash2, ArrowLeft, Clock, FileText, X } from 'lucide-react';
import api from '../../utils/api';

/* ── Group Form (Create / Edit) ── */
const GroupForm = ({ form, setForm, users, editing, onSubmit, onCancel }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editing ? 'Edit Group' : 'Create New Group'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Group Name</label>
                            <input type="text" required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., Marketing, HR, Finance" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-start gap-3">
                                <div className="flex h-6 items-center">
                                    <input type="checkbox" id="is_private" checked={!!form.is_private} onChange={e => setForm({ ...form, is_private: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div>
                                    <label htmlFor="is_private" className="text-sm font-bold text-slate-900">Private Group</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Only invited members can see this group in their dashboard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Invite Members (Initial Setup)</label>
                        <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-slate-50 p-2 space-y-1">
                            {users.map(u => (
                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={(form.invited_users || []).includes(u.id)}
                                        onChange={e => {
                                            const ids = new Set(form.invited_users || []);
                                            e.target.checked ? ids.add(u.id) : ids.delete(u.id);
                                            setForm({ ...form, invited_users: [...ids] });
                                        }}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 truncate">{u.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{u.email}{u.group_name ? ` • ${u.group_name}` : ''}</div>
                                    </div>
                                </label>
                            ))}
                            {users.length === 0 && <div className="text-center py-4 text-xs text-slate-400">No users available to invite.</div>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Note: These users will be added to this group's membership list.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">{editing ? 'Update Group' : 'Create Group'}</button>
                </div>
            </form>
        </div>
    </div>
);

/* ── Version Timeline ── */
const VersionTimeline = ({ versions, title, onBack, loading, formatDate }) => (
    <div>
        <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ArrowLeft size={16} /> Back
            </button>
            <h4 className="text-lg font-bold text-slate-800 truncate flex-1">
                History: <span className="text-indigo-600">{title}</span>
            </h4>
        </div>
        {loading && <div className="text-center py-12 text-slate-500"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Loading versions...</div>}
        {!loading && versions.length === 0 && <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">No version history found.</div>}
        {!loading && versions.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-6 relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200"></div>
                {versions.map(ver => (
                    <div key={ver.id} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-slate-50 bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm z-10">
                            v{ver.version_number}
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Updated on</span>
                                    <span className="font-semibold text-slate-700">{formatDate(ver.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1 rounded-full w-fit">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                        {ver.updater ? ver.updater.name?.charAt(0) : 'S'}
                                    </div>
                                    <span className="text-slate-600 font-semibold">{ver.updater ? ver.updater.name : 'System'}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-600 italic whitespace-pre-line leading-relaxed">{ver.change_summary || 'No change summary.'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

/* ── Group Details View ── */
const GroupDetailsView = ({ group, onBack, onViewHistory, onDeleteDoc, loading, formatDate }) => {
    const [historyDoc, setHistoryDoc] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    const loadVersions = async (docId, docTitle) => {
        setHistoryDoc({ id: docId, title: docTitle });
        setLoadingVersions(true);
        try {
            const res = await api.get(`/documents/${docId}/versions`);
            setVersions(res.data.data || res.data || []);
        } catch { setVersions([]); }
        setLoadingVersions(false);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-12">
                <div className="flex items-center justify-center">
                    <div className="text-center text-slate-500">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        Loading details...
                    </div>
                </div>
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{group.group?.name || 'Group Details'}</h3>
                        <p className="text-sm text-slate-500 mt-1">Total Work Time: <span className="font-bold text-indigo-600">{group.group?.total_minutes || 0} Minutes</span></p>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-slate-50 min-h-[400px]">
                {historyDoc ? (
                    <VersionTimeline
                        versions={versions}
                        title={historyDoc.title}
                        onBack={() => setHistoryDoc(null)}
                        loading={loadingVersions}
                        formatDate={formatDate}
                    />
                ) : (
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Documents Worked On</h4>
                        {(!group.documents || group.documents.length === 0) ? (
                            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                No work logged for this group yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {group.documents.map(doc => (
                                    <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${doc.type === 'nota' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{doc.type}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{doc.title}</h4>
                                                <p className="text-xs text-slate-500">Last worked: {formatDate(doc.last_worked)}</p>
                                            </div>
                                            <div className="text-right pl-4">
                                                <div className="text-xl font-bold text-indigo-600">{doc.total_minutes} m</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Time</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                            <button onClick={() => loadVersions(doc.id, doc.title)} className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">
                                                <Clock size={14} /> History
                                            </button>
                                            {doc.status !== 'approved' && (
                                                <button onClick={() => onDeleteDoc(doc.id, doc.title)} className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium px-3 py-1.5 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200">
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Groups List View ── */
const GroupsList = ({ groups, onNew, onEdit, onDelete, onResetTime, onViewDetails }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Groups Management</h2>
                <p className="text-slate-500 text-sm mt-1">Organize users into functional groups.</p>
            </div>
            <button onClick={onNew} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm font-semibold">
                <Plus size={18} /> New Group
            </button>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                    <div key={group.id} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onResetTime(group)} title="Reset Time" className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Clock size={14} /></button>
                            <button onClick={() => onEdit(group)} title="Edit Group" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(group.id)} title="Delete Group" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <div onClick={() => onViewDetails(group.id)} className="cursor-pointer mt-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><UsersRound size={24} /></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg truncate">{group.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${group.is_private ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {group.is_private ? 'Private' : 'Public'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${group.total_minutes > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{group.total_minutes || 0} min work</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ── Exported Tab Component ── */
const GroupsTab = ({ groups, users, onSave, onDelete, showNotif, formatDate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ invited_users: [], is_private: false });
    const [viewMode, setViewMode] = useState('list');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleNew = () => {
        setEditing(null);
        setForm({ invited_users: [], is_private: false });
        setShowForm(true);
    };

    const handleEdit = (group) => {
        setEditing(group.id);
        setForm({ name: group.name, is_private: !!group.is_private, invited_users: [] });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditing(null);
        setForm({ invited_users: [], is_private: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSave(editing, form);
        if (success) handleCancel();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        await onDelete(id);
    };

    const handleResetTime = async (group) => {
        if (!window.confirm(`Are you sure you want to completely RESET the total work time for group "${group.name}"?\n\nThis will delete all document work logs generated by anyone in this group. This action cannot be undone.`)) return;
        try {
            await api.delete(`/groups/${group.id}/reset-time`);
            showNotif(`Work time for ${group.name} has been reset.`);
            // Reload the page so the group list updates with 0 minutes immediately
            window.location.reload();
        } catch (error) {
            showNotif('Failed to reset work time', 'error');
        }
    };

    const loadDetails = async (groupId) => {
        setLoadingDetails(true);
        setViewMode('details');
        try {
            const res = await api.get(`/groups-stats/${groupId}`);
            setSelectedGroup(res.data.data || res.data);
        } catch {
            showNotif('Error loading group details', 'error');
            setViewMode('list');
        }
        setLoadingDetails(false);
    };

    const handleDeleteDoc = (docId, docTitle) => {
        // This could be expanded with the delete modal in parent
        if (!window.confirm(`Delete document "${docTitle}"?`)) return;
        api.delete(`/documents/${docId}`)
            .then(() => { showNotif('Document deleted'); if (selectedGroup) loadDetails(selectedGroup.group.id); })
            .catch(() => showNotif('Failed to delete document', 'error'));
    };

    if (showForm) {
        return <GroupForm form={form} setForm={setForm} users={users} editing={editing} onSubmit={handleSubmit} onCancel={handleCancel} />;
    }

    if (viewMode === 'details') {
        return (
            <GroupDetailsView
                group={selectedGroup}
                loading={loadingDetails}
                onBack={() => { setViewMode('list'); setSelectedGroup(null); }}
                onViewHistory={() => { }}
                onDeleteDoc={handleDeleteDoc}
                formatDate={formatDate}
            />
        );
    }

    return <GroupsList groups={groups} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} onResetTime={handleResetTime} onViewDetails={loadDetails} />;
};

export default GroupsTab;
