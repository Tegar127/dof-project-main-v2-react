// ─────────────────────────────────────────────
// Shared UI Helpers — used across all role dashboards
// ─────────────────────────────────────────────

export const getStatusLabel = (status, doc = null) => {
    const statusMap = {
        draft: 'Draft',
        pending_review: 'Menunggu Review',
        needs_revision: 'Perlu Revisi',
        approved: 'Disetujui',
        sent: 'Dikirim',
        received: 'Diterima',
    };
    if (status === 'sent' && doc?.distributions?.length > 0) return 'Final (Terdistribusi)';
    return statusMap[status] || status;
};

export const getStatusConfig = (status) => {
    const configs = {
        draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
        pending_review: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
        needs_revision: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
        approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
        sent: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
        received: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
    };
    return configs[status] || configs.draft;
};

export const getDocTypeConfig = (type) => {
    const configs = {
        nota: { label: 'Nota Dinas', short: 'ND', light: 'bg-violet-50 text-violet-600' },
        sppd: { label: 'SPPD', short: 'SP', light: 'bg-emerald-50 text-emerald-600' },
        perj: { label: 'Perjanjian', short: 'PK', light: 'bg-orange-50 text-orange-600' },
    };
    return configs[type] || { label: type, short: type?.charAt(0)?.toUpperCase() ?? '?', light: 'bg-slate-50 text-slate-600' };
};

export const isDocEditable = (doc, currentUser) => {
    if (!doc || !currentUser) return false;
    if (doc.status === 'approved') return false;
    if (['sent', 'received'].includes(doc.status) && doc.distributions?.length > 0) return false;
    if (currentUser.role === 'admin') return true;

    const isAuthor = String(doc.author_id) === String(currentUser.id);
    const isAuthorEditable = isAuthor && ['draft', 'needs_revision'].includes(doc.status);

    const userGrps = [
        currentUser.group_name,
        ...(currentUser.groups || []).map(g => (typeof g === 'object' ? g.name : g)),
    ].filter(Boolean);

    const isGroup = doc.target_role === 'group' && userGrps.includes(doc.target_value);
    const isDispo = doc.target_role === 'dispo' && currentUser.role === 'reviewer';
    const isTargetUser = doc.target_role === 'user' && doc.target_value === currentUser.email;

    const isRecipient = isGroup || isDispo || isTargetUser;
    const isRecipientEditable = isRecipient && ['pending_review', 'sent', 'received'].includes(doc.status);

    return isAuthorEditable || isRecipientEditable;
};

export const getRoleLabel = (role) => {
    const map = { admin: 'Administrator', reviewer: 'Reviewer', user: 'Staff' };
    return map[role] || role;
};

export const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
