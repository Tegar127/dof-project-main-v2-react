/**
 * DocumentEditor.jsx
 *
 * React 1:1 port of resources/js/editor/index.js + resources/views/editor/index.blade.php
 * All logic, UI structure, and conditional rendering mirror the Laravel version exactly.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import NotaEditor from '../components/editor/NotaEditor';
import SppdEditor from '../components/editor/SppdEditor';
import PerjanjianEditor from '../components/editor/PerjanjianEditor';
import { Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Helpers — matches getStatusLabel(), formatDeadlineDisplay()
// ─────────────────────────────────────────────────────────────

const STATUS_LABELS = {
    draft: 'Draft',
    pending_review: 'Review',
    needs_revision: 'Revisi',
    approved: 'Approved',
    sent: 'Dikirim',
    received: 'Diterima',
    rejected: 'Ditolak',
};

function getStatusLabel(s) {
    return STATUS_LABELS[s] ?? String(s ?? 'Draft');
}

function getStatusColor(s) {
    const m = {
        draft: 'bg-white border border-slate-200 text-slate-600',
        pending_review: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        needs_revision: 'bg-orange-50 text-orange-700 border border-orange-200',
        approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        sent: 'bg-blue-50 text-blue-700 border border-blue-200',
        received: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        rejected: 'bg-red-50 text-red-700 border border-red-200',
    };
    return m[s] ?? 'bg-white border border-slate-200 text-slate-600';
}

function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────────────────────
// Modals — matching blade lines 117-192
// ─────────────────────────────────────────────────────────────

/** SuccessModal — blade lines 167-177: green bouncing check + Berhasil! */
function SuccessModal({ message, onClose }) {
    return (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-10 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Berhasil!</h3>
                <p className="text-slate-500 font-medium mb-8">{message}</p>
                <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg">Tutup</button>
            </div>
        </div>
    );
}

/** ErrorModal — shown for actual failures */
function ErrorModal({ message, onClose }) {
    return (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <p className="text-slate-700 font-semibold mb-6 text-sm">{message}</p>
                <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">OK</button>
            </div>
        </div>
    );
}

/** ConfirmModal — blade lines 179-192: amber warning icon */
function ConfirmModal({ title, message, onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Batal</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Lanjutkan</button>
                </div>
            </div>
        </div>
    );
}

/** SendModal — blade lines 117-165 */
function SendModal({ groups, user, onClose, onConfirm }) {
    const [targetRole, setTargetRole] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [error, setError] = useState('');

    // Determine jabatan restriction context
    const position = (user?.position || '').toLowerCase();
    const isKadiv = position.startsWith('kadiv');
    const isAdmin = user?.role === 'admin';
    const canSendCrossDivision = isAdmin || isKadiv;
    const userGroup = user?.group_name;

    const submit = () => {
        if (!targetRole) return setError('Pilih tujuan pengiriman!');
        if (targetRole === 'group' && !targetValue) return setError('Pilih divisi tujuan!');
        onConfirm(targetRole, targetValue);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Kirim Dokumen</h3>
                        <p className="text-xs text-slate-500 font-medium">Pilih tujuan pengiriman dokumen ini.</p>
                    </div>
                </div>

                {/* Restriction notice for Staff / Kabid */}
                {!canSendCrossDivision && userGroup && (
                    <div className="mb-5 flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <p className="text-xs font-black text-amber-700 uppercase tracking-wide">Pengiriman Terbatas</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Sebagai <span className="font-bold">{user?.position || 'Staff'}</span>, Anda hanya dapat mengirim dokumen ke divisi Anda sendiri: <span className="font-bold">{userGroup}</span>.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Group / Divisi */}
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 ${targetRole === 'group' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100'}`}>
                        <input type="radio" name="target" value="group" checked={targetRole === 'group'}
                            onChange={() => { setTargetRole('group'); setTargetValue(''); setError(''); }}
                            className="w-5 h-5 text-indigo-600 accent-indigo-600" />
                        <div className="flex-1">
                            <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">Group / Divisi</span>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                {canSendCrossDivision
                                    ? 'Kirim ke divisi mana saja.'
                                    : `Hanya divisi ${userGroup || 'Anda'}.`}
                            </span>
                        </div>
                    </label>
                    {targetRole === 'group' && (
                        <div className="pl-4 border-l-4 border-indigo-100 ml-2 space-y-2">
                            {groups.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium p-2">Tidak ada divisi yang tersedia.</p>
                            ) : (
                                <select value={targetValue} onChange={e => setTargetValue(e.target.value)}
                                    className="w-full p-3.5 border-2 border-slate-100 rounded-xl text-sm font-bold bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all">
                                    <option value="">-- Pilih Group Tujuan --</option>
                                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                </select>
                            )}
                        </div>
                    )}
                    {/* Disposisi */}
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 ${targetRole === 'dispo' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100'}`}>
                        <input type="radio" name="target" value="dispo" checked={targetRole === 'dispo'}
                            onChange={() => { setTargetRole('dispo'); setTargetValue('dispo'); setError(''); }}
                            className="w-5 h-5 text-indigo-600 accent-indigo-600" />
                        <div className="flex-1">
                            <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">Disposisi (Reviewer)</span>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Kirim ke reviewer untuk diperiksa.</span>
                        </div>
                    </label>
                    {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
                    <div className="flex gap-3 pt-6">
                        <button onClick={onClose} className="flex-1 py-3.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Batal</button>
                        <button onClick={submit} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                            <span>Kirim Sekarang</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


/** HistoryModal — blade lines 21-85: Status Log + Work Log tabs */
function HistoryModal({ docId, onClose }) {
    const [activeTab, setActiveTab] = useState('status');
    const [logs, setLogs] = useState([]);
    const [workLogs, setWorkLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoadingLogs(true);
            try {
                const [logsRes, workRes] = await Promise.all([
                    api.get(`/documents/${docId}/logs`),
                    api.get(`/documents/${docId}/work-logs`).catch(() => ({ data: [] })),
                ]);
                setLogs(Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.data ?? []));
                setWorkLogs(Array.isArray(workRes.data) ? workRes.data : (workRes.data?.data ?? []));
            } catch { /* ignore */ }
            finally { setLoadingLogs(false); }
        };
        fetchLogs();
    }, [docId]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Riwayat &amp; Log</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Pantau perubahan dan waktu pengerjaan dokumen</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-4 bg-white">
                    <button onClick={() => setActiveTab('status')} className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'status' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>Riwayat Status</button>
                    <button onClick={() => setActiveTab('work')} className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'work' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>Log Pengerjaan</button>
                </div>
                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {loadingLogs && <div className="text-center py-12 text-slate-400 font-medium">Memuat data...</div>}

                    {/* Status Logs */}
                    {!loadingLogs && activeTab === 'status' && (
                        <div className="relative pl-4 border-l-2 border-indigo-100 space-y-8">
                            {logs.length === 0 && <p className="text-slate-400 text-sm text-center py-8">Belum ada riwayat.</p>}
                            {logs.map((log, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${i === 0 ? 'bg-indigo-500 ring-4 ring-indigo-50' : 'bg-slate-300'}`} />
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">{(log.action || '').replace('_', ' ')}</span>
                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{formatDateTime(log.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{log.details}</p>
                                        {log.old_status && log.new_status && (
                                            <div className="flex items-center gap-2 my-2">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">{(log.old_status || '').replace('_', ' ')}</span>
                                                <span className="text-slate-400 text-xs">&#8594;</span>
                                                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">{(log.new_status || '').replace('_', ' ')}</span>
                                            </div>
                                        )}
                                        {log.changes_summary && (
                                            <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                                <p className="text-xs text-blue-700 whitespace-pre-line font-mono">{log.changes_summary}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50 flex-wrap">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">{log.user?.name?.charAt(0) || '-'}</div>
                                            <span className="text-xs font-bold text-slate-800">{log.user?.name || '-'}</span>
                                            {log.user?.position && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{log.user.position}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Work Logs */}
                    {!loadingLogs && activeTab === 'work' && (
                        <div className="space-y-4">
                            {workLogs.length === 0 && <p className="text-slate-400 text-sm text-center py-8">Belum ada log pengerjaan.</p>}
                            {workLogs.map(log => (
                                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-slate-800">{log.user?.name || 'User'}</span>
                                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{log.duration_minutes} menit</span>
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-2">
                                            <span>{formatDateTime(log.start_time)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{formatDateTime(log.end_time)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── State ─────────────────────────────────────────────────
    const [doc, setDoc] = useState(null);
    const [formData, setFormData] = useState({});
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [confirm, setConfirm] = useState(null); // { title, message, onConfirm }
    const [feedback, setFeedback] = useState('');
    const printRef = useRef(null);
    const sessionStartTime = useRef(null);

    // ── isEditable — matches index.js lines 5-33 ─────────────
    const isEditable = useCallback((d = doc) => {
        if (!d || !user) return false;

        const status = d.status;

        // RULE 1: STRICT BLOCKERS (Berlaku mutlak untuk semuanya)
        if (status === 'approved') return false;
        if (['sent', 'received'].includes(status) && d.distributions?.length > 0) return false;

        // RULE 2: ADMIN BYPASS
        if (user.role === 'admin') return true;

        // RULE 3: REGULAR USERS
        // Author: draft/needs_revision only (if they are NOT currently the recipient)
        const isAuthor = String(d.author_id) === String(user.id);
        const isAuthorEditable = isAuthor && ['draft', 'needs_revision'].includes(status);

        // Recipient/Reviewer: can edit when document is sent to them
        const userGroups = [user.group_name, ...(user.groups || []).map(g => typeof g === 'object' ? g.name : g)].filter(Boolean);

        const isTargetGroup = d.target_role === 'group' && userGroups.includes(d.target_value);
        const isTargetDispo = d.target_role === 'dispo' && user.role === 'reviewer';
        const isTargetUser = d.target_role === 'user' && d.target_value === user.email;

        const isRecipient = isTargetGroup || isTargetDispo || isTargetUser;
        const isRecipientEditable = isRecipient && ['sent', 'received', 'pending_review'].includes(status);

        return isAuthorEditable || isRecipientEditable;
    }, [doc, user]);

    // ── Time Tracking (Work Logs) ────────────────────────────
    const sendWorkLog = useCallback(() => {
        if (!sessionStartTime.current || !id) return;

        const startTime = sessionStartTime.current.toISOString();
        const endTime = new Date().toISOString();
        const payload = JSON.stringify({ start_time: startTime, end_time: endTime });
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

        fetch(`${baseUrl}/documents/${id}/work-logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: payload,
            keepalive: true
        }).catch(err => console.error("Gagal mengirim work log:", err));

        sessionStartTime.current = null;
    }, [id]);

    useEffect(() => {
        if (isEditable()) {
            sessionStartTime.current = new Date();

            const handleBeforeUnload = () => sendWorkLog();
            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                sendWorkLog();
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, [isEditable, sendWorkLog]);

    // ── Load document + groups on mount ──────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                const data = res.data.data;
                setDoc(data);
                setFeedback(data.feedback || '');

                // Normalize content_data — matches loadDocument() in index.js
                const cd = typeof data.content_data === 'string'
                    ? JSON.parse(data.content_data)
                    : { ...(data.content_data || {}) };

                // Defaults
                if (!cd.from) cd.from = user?.name || '';
                if (!cd.signerName) cd.signerName = user?.name || '';
                if (!cd.signerPosition) cd.signerPosition = (user?.position || '').toUpperCase();
                if (!cd.location) cd.location = 'Jakarta';
                if (!cd.date) cd.date = new Date().toISOString().split('T')[0];
                if (!cd.closing) cd.closing = 'Demikian disampaikan dan untuk dijadikan periksa.';
                if (!cd.basisStyle) cd.basisStyle = '1.';
                if (!Array.isArray(cd.to)) cd.to = [cd.to || ''];
                if (!cd.basis) cd.basis = [{ text: '', sub: [] }];
                if (!cd.remembers) cd.remembers = [{ text: '', sub: [] }];
                if (!cd.ccs) cd.ccs = [];
                if (!cd.paraf || !cd.paraf.length) cd.paraf = [{ code: '', name: '', signature: '' }];

                // Migrate string arrays → object arrays
                ['basis', 'remembers'].forEach(k => {
                    if (cd[k]?.length && typeof cd[k][0] === 'string') {
                        cd[k] = cd[k].map(text => ({ text, sub: [] }));
                    }
                });

                setFormData(cd);
            } catch {
                setErrorMsg('Dokumen tidak ditemukan!');
                setTimeout(() => navigate('/'), 2000);
            } finally {
                setLoading(false);
            }
        };

        const loadGroups = async () => {
            try {
                // Fetch only groups the current user is allowed to send to:
                // Admin/Kadiv → all groups; Staff/Kabid → own division only
                const res = await api.get('/users/me/available-groups');
                setGroups(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
            } catch {
                // Fallback: fetch all groups (non-critical)
                try {
                    const res = await api.get('/groups');
                    setGroups(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
                } catch { /* ignore */ }
            }
        };

        load();
        loadGroups();
    }, [id]);

    // ── saveDocument — matches index.js lines 609-683 ────────
    /**
     * @param {{ overrides?: object, force?: boolean }} opts
     */
    const saveDocument = async ({ overrides = {}, force = false } = {}) => {
        if (!force && !isEditable()) return false;
        setSaving(true);
        try {
            const payload = {
                title: formData.title ?? doc.title,
                type: doc.type,
                status: overrides.status ?? doc.status,
                content_data: formData,
                deadline: formData.deadline ?? doc.deadline ?? null,
                target: {
                    type: overrides.targetRole ?? doc.target_role ?? null,
                    value: overrides.targetValue ?? doc.target_value ?? null,
                },
            };
            const res = await api.put(`/documents/${id}`, payload);
            if (res.data?.data) setDoc(prev => ({ ...prev, ...res.data.data }));

            sendWorkLog();
            sessionStartTime.current = new Date();

            return true;
        } catch (err) {
            setErrorMsg(err.response?.data?.message ?? 'Gagal menyimpan dokumen.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ── handleSave (SIMPAN button) ────────────────────────────
    const handleSave = async () => {
        const ok = await saveDocument();
        if (ok) setSuccessMsg('Dokumen berhasil disimpan!');
    };

    // ── confirmSend — matches index.js lines 562-588 ─────────
    const confirmSend = async (targetRole, targetValue) => {
        const newStatus = targetRole === 'group' ? 'sent' : 'pending_review';
        setShowSendModal(false);
        const ok = await saveDocument({ overrides: { status: newStatus, targetRole, targetValue }, force: true });
        if (ok) navigate('/?success=sent');
    };

    // ── updateStatus (Reviewer) — matches index.js 685-704 ───
    const updateStatus = async (newStatus) => {
        setSaving(true);
        try {
            // Check if there is an active approval workflow for this user
            const myApproval = doc.approvals?.find(a => a.status === 'pending' && (!a.approver_id || a.approver_id === user.id || a.approver_position === user.position));

            if (myApproval) {
                if (newStatus === 'approved') {
                    await api.post(`/documents/${id}/approvals/${myApproval.id}/approve`, { notes: feedback });
                } else {
                    await api.post(`/documents/${id}/approvals/${myApproval.id}/reject`, { notes: feedback });
                }
            } else {
                // Fallback to direct status update if no approval structure exists for this document
                await api.put(`/documents/${id}`, { status: newStatus, feedback });
            }

            const res = await api.get(`/documents/${id}`);
            setDoc(res.data.data);
            setSuccessMsg(newStatus === 'approved' ? 'Dokumen berhasil disetujui!' : 'Dokumen dikembalikan untuk revisi.');

            sendWorkLog();
            sessionStartTime.current = new Date();
        } catch (err) {
            setErrorMsg(err.response?.data?.message ?? 'Gagal memperbarui status.');
        } finally {
            setSaving(false);
        }
    };

    // ── finishDocument — matches index.js lines 591-607 ──────
    const finishDocument = () => {
        setConfirm({
            title: 'Selesaikan Dokumen?',
            message: 'Apakah Anda yakin ingin menyelesaikan dokumen ini? Dokumen tidak dapat diedit atau diteruskan lagi.',
            onConfirm: async () => {
                setConfirm(null);
                const ok = await saveDocument({ overrides: { status: 'approved' }, force: true });
                if (ok) {
                    setSuccessMsg('Dokumen berhasil diselesaikan (ACC).');
                    const res = await api.get(`/documents/${id}`);
                    setDoc(res.data.data);
                }
            },
        });
    };

    // ── handleDownload — matches downloadPDF() ───────────────
    const handleDownload = () => {
        window.print();
    };

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
    );
    if (!doc) return null;

    const canEdit = isEditable();
    const docType = doc.type || 'nota';
    const status = doc.status;

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-100 relative">

            {/* ── Modals ─────────────────────────────────────── */}

            {successMsg && <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />}
            {errorMsg && <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />}
            {confirm && <ConfirmModal title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
            {showSendModal && <SendModal groups={groups} user={user} onClose={() => setShowSendModal(false)} onConfirm={confirmSend} />}

            {showHistory && <HistoryModal docId={id} onClose={() => setShowHistory(false)} />}

            {/* ── Floating open button (collapsed) ──────────── */}
            {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center group">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm font-bold whitespace-nowrap">BUKA PANEL EDIT</span>
                </button>
            )}

            {/* ══════════════════════════════════════════════
                LEFT SIDEBAR — blade lines 194-624
            ══════════════════════════════════════════════ */}
            {sidebarOpen && (
                <div className="w-full lg:w-[480px] bg-white flex flex-col border-r border-gray-200 shadow-2xl z-40 h-full flex-shrink-0 relative">

                    {/* ── Toolbar — blade lines 206-224 ─────── */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all" title="Dashboard">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div className="h-6 w-px bg-gray-100" />
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all lg:block hidden" title="Tutup Sidebar">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                            </button>
                        </div>
                        {/* RIGHT of toolbar: History + SIMPAN */}
                        <div className="flex items-center gap-3">
                            {/* Riwayat button — blade line 218 */}
                            <button onClick={() => setShowHistory(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Lihat Riwayat">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            {/* SIMPAN — blade line 219 */}
                            <button
                                onClick={handleSave}
                                disabled={saving || !canEdit}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                                <span>{saving ? 'MENYIMPAN...' : 'SIMPAN'}</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Header Info — blade lines 226-235 ──── */}
                    <div className="px-8 py-6 bg-slate-50/80 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter">
                                {docType === 'sppd' ? 'SURAT PERINTAH PERJALANAN DINAS' : docType === 'nota' ? 'NOTA DINAS' : 'PERJANJIAN'}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm ${getStatusColor(status)}`}>
                                {getStatusLabel(status)}
                            </span>
                            <div className="flex-1" />
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                                v{doc.version ?? '1.0'}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.title ?? doc.title ?? ''}
                            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                            disabled={!canEdit}
                            placeholder="Judul Dokumen..."
                            className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-indigo-500 p-0 text-2xl font-black text-slate-800 placeholder-slate-300 focus:ring-0 transition-all hover:border-slate-200 outline-none disabled:cursor-default"
                        />
                    </div>

                    {/* ── Form + Actions (scrollable) ────────── */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                        <div className="p-8 space-y-10">
                            {/* Form fields — disabled by fieldset if not editable */}
                            <fieldset disabled={!canEdit} className="space-y-10">
                                {docType === 'nota' && <NotaEditor formData={formData} setFormData={setFormData} />}
                                {docType === 'sppd' && <SppdEditor formData={formData} setFormData={setFormData} />}
                                {docType === 'perj' && <PerjanjianEditor formData={formData} setFormData={setFormData} />}
                            </fieldset>

                            {/* ─────────────────────────────────────────
                                SIDEBAR BOTTOM ACTIONS — blade lines 519-622
                                Conditional on user.role + document.status
                            ───────────────────────────────────────── */}
                            <div className="mt-4 pt-10 border-t border-gray-100 pb-20 lg:pb-6 space-y-6">

                                {/* 1. REVIEWER ACTIONS — blade lines 523-535 */}
                                {user?.role === 'reviewer' && doc.id && (
                                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-amber-800 mb-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <h4 className="text-xs font-black uppercase tracking-widest">Aksi Reviewer</h4>
                                        </div>
                                        <textarea
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            rows={3}
                                            placeholder="Tulis catatan revisi atau persetujuan disini..."
                                            className="w-full p-4 border border-amber-200 rounded-xl text-sm font-medium bg-white focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none placeholder:text-amber-200"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => updateStatus('needs_revision')} disabled={saving} className="py-3 bg-white text-amber-600 border border-amber-200 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-amber-50 transition-all shadow-sm disabled:opacity-50">MINTA REVISI</button>
                                            <button onClick={() => updateStatus('approved')} disabled={saving} className="py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">SETUJUI (ACC)</button>
                                        </div>
                                    </div>
                                )}

                                {/* 2. DEADLINE + KIRIM — blade lines 537-602 */}
                                {/* Only for user/admin when status is draft or needs_revision */}
                                {(user?.role === 'user' || user?.role === 'admin') && (status === 'draft' || status === 'needs_revision') && (
                                    <>
                                        <div className="mb-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-indigo-800 mb-3">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest">Batas Waktu (Opsional)</h4>
                                            </div>
                                            <input
                                                type="datetime-local"
                                                value={formData.deadline || ''}
                                                onChange={e => setFormData(p => ({ ...p, deadline: e.target.value || null }))}
                                                disabled={!canEdit}
                                                className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-xs font-bold transition-all outline-none disabled:opacity-60"
                                            />
                                        </div>
                                        {/* KIRIM DOKUMEN — blade line 598 */}
                                        {canEdit && (
                                            <button
                                                onClick={() => setShowSendModal(true)}
                                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group flex items-center justify-center gap-3"
                                            >
                                                <span>{status === 'needs_revision' ? 'KIRIM REVISI' : 'KIRIM DOKUMEN'}</span>
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* 3. TERUSKAN + SELESAI — blade lines 604-615 */}
                                {/* Only for user/admin when status is sent or received */}
                                {(user?.role === 'user' || user?.role === 'admin') && (status === 'sent' || status === 'received') && (
                                    <div className="space-y-3">
                                        {/* TERUSKAN DOKUMEN — emerald */}
                                        <button onClick={() => setShowSendModal(true)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex justify-center items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>TERUSKAN DOKUMEN</span>
                                        </button>
                                        {/* SELESAI / ACC — dark */}
                                        <button onClick={finishDocument} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            <span>SELESAI / ACC</span>
                                        </button>
                                    </div>
                                )}

                                {/* 4. Cetak PDF — always shown */}
                                <button onClick={handleDownload} className="w-full bg-white text-slate-700 border-2 border-slate-100 py-4 rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-slate-50 transition-all hover:border-slate-200 group">
                                    <svg className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    <span>Cetak PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                RIGHT — DOCUMENT PREVIEW — blade lines 627-930
            ══════════════════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-200 custom-scrollbar">
                <div ref={printRef} className="paper shadow-lg relative min-h-[297mm]">
                    <div className="flex items-center mb-2">
                        <img src="/logo_asa.png" alt="ASABRI Logo" className="h-16 mb-2" />
                    </div>
                    {docType === 'nota' && <NotaEditor.Preview formData={formData} />}
                    {docType === 'sppd' && <SppdEditor.Preview formData={formData} />}
                    {docType === 'perj' && <PerjanjianEditor.Preview formData={formData} />}
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
