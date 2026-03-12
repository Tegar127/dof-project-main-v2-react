import * as documentRepository from '../repositories/document.repository.js';
import * as notificationService from './notification.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';
import { canSendDocument } from '../utils/roleUtils.js';

// Human-readable labels for content_data fields
const FIELD_LABELS = {
    // Nota Dinas
    docNumber: 'Nomor Surat', date: 'Tanggal', to: 'Tujuan', cc: 'Tembusan', ccs: 'Tembusan',
    from: 'Dari', plh_pjs: 'Status Jabatan', subject: 'Perihal', content: 'Isi Surat', body: 'Isi Surat',
    closing: 'Kalimat Penutup', location: 'Tempat', signerName: 'Nama Penandatangan',
    signerPosition: 'Jabatan Penandatangan', paraf: 'Paraf', basis: 'Dasar Pelaksanaan',
    remembers: 'Menimbang', basisStyle: 'Gaya Penomoran', deadline: 'Batas Waktu', title: 'Judul',
    // SPPD fields
    travelerName: 'Nama Pelaksana', travelerPosition: 'Jabatan Pelaksana', travelerNip: 'NIP Pelaksana',
    travelerGrade: 'Golongan', destination: 'Kota Tujuan', purpose: 'Tujuan Perjalanan',
    startDate: 'Tanggal Berangkat', endDate: 'Tanggal Kembali', days: 'Jumlah Hari',
    transport: 'Transportasi', accommodation: 'Akomodasi', chargedTo: 'Biaya Dibebankan',
    // Perjanjian fields
    partyA: 'Pihak Pertama', partyAPos: 'Jabatan Pihak Pertama', partyB: 'Pihak Kedua',
    partyBPos: 'Jabatan Pihak Kedua', agreementDate: 'Tanggal Perjanjian',
    agreementNumber: 'Nomor Perjanjian', agreementSubject: 'Perihal Perjanjian', clauses: 'Pasal/Klausul',
};

const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
};

const generateChangeSummary = (oldData = {}, newData = {}) => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
        const label = FIELD_LABELS[key];
        if (!label) continue;
        const oldVal = oldData[key];
        const newVal = newData[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            let oldDisplay = formatFieldValue(oldVal, key);
            let newDisplay = formatFieldValue(newVal, key);
            if (oldDisplay.length > 100) oldDisplay = oldDisplay.substring(0, 100) + '...';
            if (newDisplay.length > 100) newDisplay = newDisplay.substring(0, 100) + '...';
            if (oldDisplay && newDisplay) changes.push(`• ${label}: "${oldDisplay}" → "${newDisplay}"`);
            else if (newDisplay) changes.push(`• ${label} diisi: "${newDisplay}"`);
            else if (oldDisplay) changes.push(`• ${label} dihapus`);
        }
    }
    return changes.length > 0 ? changes.join('\n') : null;
};

const formatFieldValue = (val, key = '') => {
    if (val === null || val === undefined || val === '') return '';
    if ((key === 'content' || key === 'body') && typeof val === 'string') return stripHtml(val);
    if (Array.isArray(val)) {
        if (val.length === 0) return '';
        if (typeof val[0] === 'string') return val.filter(Boolean).join(', ');
        if (typeof val[0] === 'object' && val[0]?.text !== undefined) return val.map(v => v.text).filter(Boolean).join(', ');
        if (typeof val[0] === 'object') return val.map(v => v.name || v.code || '').filter(Boolean).join(', ');
        return String(val.length) + ' item(s)';
    }
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

const getStatusChangeNote = (status) => {
    const notes = {
        'draft': 'Dokumen disimpan sebagai draft',
        'pending_review': 'Dokumen dikirim untuk review',
        'needs_revision': 'Dokumen memerlukan revisi',
        'approved': 'Dokumen disetujui',
        'sent': 'Dokumen dikirim',
        'received': 'Dokumen diterima',
    };
    return notes[status] || 'Status dokumen diubah';
};

export const getAllDocuments = async (user, filters) => {
    const documents = await documentRepository.findAllForUser(user, filters);

    for (const doc of documents) {
        if (typeof doc.content_data === 'string' && doc.content_data) {
            try { doc.content_data = JSON.parse(doc.content_data); } catch { doc.content_data = {}; }
        } else if (!doc.content_data) { doc.content_data = {}; }
        if (typeof doc.history_log === 'string' && doc.history_log) {
            try { doc.history_log = JSON.parse(doc.history_log); } catch { doc.history_log = []; }
        } else if (!doc.history_log) { doc.history_log = []; }

        const dists = await documentRepository.getDistributions(doc.id);
        doc.distributions = dists;
    }
    return documents;
};

export const createDocument = async (user, data) => {
    const contentData = data.content_data || {};
    if (!contentData.to) contentData.to = [''];
    if (!contentData.from) contentData.from = user.name;
    if (!contentData.signerName) contentData.signerName = user.name;
    if (!contentData.signerPosition) contentData.signerPosition = (user.position || '').toUpperCase();
    if (!contentData.paraf) contentData.paraf = [{ code: '', name: '', signature: '' }];

    const documentData = {
        title: data.title,
        type: data.type,
        status: data.status || 'draft',
        author_id: user.id,
        author_name: user.name,
        content_data: contentData,
        history_log: data.history_log || [],
        target_role: data.target?.type || null,
        target_value: data.target?.value || null,
        folder_id: data.folder_id || null,
        version: '1.0',
        deadline: data.deadline || null,
        approval_count: data.approval_count || 0,
    };

    const documentId = await documentRepository.create(documentData);

    await documentRepository.createVersion({
        document_id: documentId,
        version_number: '1.0',
        content_data: contentData,
        updated_by: user.id
    });

    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'created',
        details: 'Dokumen dibuat'
    });

    if (data.approvals && data.approvals.length > 0) {
        for (let i = 0; i < data.approvals.length; i++) {
            await documentRepository.createApproval({
                document_id: documentId,
                sequence: i + 1,
                approver_position: data.approvals[i].position || null,
                approver_id: data.approvals[i].approver_id || null,
                status: 'pending'
            });
        }
    }

    return await getDocumentById(documentId, user);
};

export const getDocumentById = async (id, user) => {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    const distributions = await documentRepository.getDistributions(id);

    if (typeof document.content_data === 'string' && document.content_data) {
        try { document.content_data = JSON.parse(document.content_data); } catch { document.content_data = {}; }
    } else if (!document.content_data) { document.content_data = {}; }
    if (typeof document.history_log === 'string' && document.history_log) {
        try { document.history_log = JSON.parse(document.history_log); } catch { document.history_log = []; }
    } else if (!document.history_log) { document.history_log = []; }

    await documentRepository.markAsRead(id, user.id);

    const userGroups = [user.group_name, ...(user.groups || []).map(g => typeof g === 'object' ? g.name : g)].filter(Boolean);
    const isRecipient = distributions.some(d =>
        d.recipient_type === 'all' ||
        (d.recipient_type === 'user' && String(d.recipient_id) === String(user.id)) ||
        (d.recipient_type === 'group' && userGroups.includes(d.recipient_id))
    );

    if (document.status === 'sent' && (isRecipient || (document.target_role === 'group' && userGroups.includes(document.target_value)))) {
        const oldStatus = document.status;
        await documentRepository.update(id, { status: 'received' });
        document.status = 'received';
        await documentRepository.createLog({
            document_id: id,
            user_id: user.id,
            action: 'received',
            details: 'Dokumen diterima dan dibaca.',
            old_status: oldStatus,
            new_status: 'received'
        });
    }

    const logs = await documentRepository.getLogs(id);
    const approvals = await documentRepository.getApprovals(id);
    const readReceipts = await documentRepository.getReadReceipts(id);

    return { ...document, logs, approvals, read_receipts: readReceipts, distributions };
};

const incrementVersionString = (versionStr, major = false) => {
    let [maj, min] = versionStr.split('.').map(Number);
    if (major) { maj += 1; min = 0; } else { min += 1; }
    return `${maj}.${min}`;
};

export const updateDocument = async (id, user, data) => {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    if (typeof document.content_data === 'string' && document.content_data) {
        try { document.content_data = JSON.parse(document.content_data); } catch { document.content_data = {}; }
    } else if (!document.content_data) { document.content_data = {}; }

    if (document.status === 'approved') {
        const allowedUpdates = Object.keys(data).filter(k => !['status', 'target'].includes(k));
        if (allowedUpdates.length > 0 && data.content_data) {
            throw new BadRequestError('Dokumen yang sudah disetujui (Final) tidak dapat diubah kontennya.');
        }
    }

    const updateData = {};
    const oldStatus = document.status;

    if (data.status !== undefined) updateData.status = data.status;
    if (data.content_data !== undefined) updateData.content_data = data.content_data;
    if (data.history_log !== undefined) updateData.history_log = data.history_log;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.forward_note !== undefined) updateData.forward_note = data.forward_note;
    if (data.target !== undefined) { updateData.target_role = data.target.type; updateData.target_value = data.target.value; }
    if (data.folder_id !== undefined) updateData.folder_id = data.folder_id;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;

    let shouldVersion = false;
    let changeSummary = null;
    let newVersion = document.version;

    if (data.content_data || data.increment_version) {
        shouldVersion = true;
        if (data.content_data) {
            changeSummary = 'Konten dokumen diperbarui';
            if (!data.increment_version) { newVersion = incrementVersionString(document.version, false); updateData.version = newVersion; }
        } else { changeSummary = 'Versi baru manual.'; }

        if (data.increment_version) { newVersion = incrementVersionString(document.version, false); updateData.version = newVersion; }

        await documentRepository.createVersion({
            document_id: id,
            version_number: newVersion,
            content_data: data.content_data || document.content_data,
            change_summary: changeSummary,
            updated_by: user.id
        });
    }

    await documentRepository.update(id, updateData);

    if (data.approvals) {
        await documentRepository.clearApprovals(id);
        for (let i = 0; i < data.approvals.length; i++) {
            await documentRepository.createApproval({
                document_id: id,
                sequence: i + 1,
                approver_position: data.approvals[i].approver_position || null,
                status: data.approvals[i].status || 'pending'
            });
        }
    }

    let fieldChangeSummary = null;
    if (data.content_data) {
        fieldChangeSummary = generateChangeSummary(document.content_data, data.content_data);
    }

    let action = 'updated';
    let notes = 'Dokumen diperbarui';
    const finalStatus = updateData.status !== undefined ? updateData.status : oldStatus;

    if (updateData.status && updateData.status !== oldStatus) {
        if (updateData.status === 'sent') {
            // ── Jabatan-based sending restriction ─────────────────────────────
            const sendTarget = updateData.target_role || document.target_role;
            const sendValue  = updateData.target_value || document.target_value;
            const { allowed, reason } = canSendDocument(user, sendTarget, sendValue);
            if (!allowed) {
                throw new ForbiddenError(reason || 'Anda tidak diizinkan mengirim dokumen ke divisi lain.');
            }
            // ──────────────────────────────────────────────────────────────────

            if (oldStatus === 'draft' || oldStatus === 'needs_revision') {
                action = 'sent';
                notes = 'Dokumen dikirim ke ' + (updateData.target_value || document.target_value);

                // Notify reviewers if sent to dispo
                if (updateData.target_role === 'dispo') {
                    prisma.user.findMany({ where: { role: 'reviewer' }, select: { id: true } }).then(reviewers => {
                        reviewers.forEach(reviewer => {
                            notificationService.createNotification(reviewer.id, 'App\\Notifications\\DocumentNeedsReview', {
                                document_id: id,
                                title: document.title || data.title,
                                message: `Dokumen baru "${document.title || data.title}" menunggu review Anda.`
                            }).catch(console.error);
                        });
                    }).catch(console.error);
                }

                if (oldStatus === 'needs_revision') {
                    newVersion = incrementVersionString(newVersion, false);
                    await documentRepository.update(id, { version: newVersion });
                    await documentRepository.createVersion({
                        document_id: id,
                        version_number: newVersion,
                        content_data: data.content_data || document.content_data,
                        change_summary: 'Dokumen dikirim kembali setelah revisi.',
                        updated_by: user.id
                    });
                }
            } else {
                action = 'sent';
                notes = 'Dokumen diteruskan ke ' + (updateData.target_value || document.target_value);
                newVersion = incrementVersionString(newVersion, true);
                await documentRepository.update(id, { version: newVersion });
                await documentRepository.createVersion({
                    document_id: id,
                    version_number: newVersion,
                    content_data: data.content_data || document.content_data,
                    change_summary: 'Dokumen diteruskan (Major Version Update).',
                    updated_by: user.id
                });
            }
        } else {
            action = updateData.status === 'pending_review' ? 'sent' : updateData.status;
            notes = getStatusChangeNote(updateData.status);

            if (updateData.status === 'pending_review' && updateData.target_role === 'dispo') {
                prisma.user.findMany({ where: { role: 'reviewer' }, select: { id: true } }).then(reviewers => {
                    reviewers.forEach(reviewer => {
                        notificationService.createNotification(reviewer.id, 'App\\Notifications\\DocumentNeedsReview', {
                            document_id: id,
                            title: document.title || data.title,
                            message: `Dokumen baru "${document.title || data.title}" menunggu review Anda.`
                        }).catch(console.error);
                    });
                }).catch(console.error);
            }

            if (updateData.status === 'approved' && oldStatus !== 'approved') {
                prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } }).then(admins => {
                    admins.forEach(admin => {
                        notificationService.createNotification(admin.id, 'App\\Notifications\\DocumentApproved', {
                            document_id: id,
                            title: document.title || data.title,
                            message: `Dokumen "${document.title || data.title}" telah disetujui (ACC) dan siap didistribusikan.`
                        }).catch(console.error);
                    });
                }).catch(console.error);
            }

            if (updateData.status === 'needs_revision' && oldStatus !== 'needs_revision') {
                notificationService.createNotification(document.author_id, 'App\\Notifications\\DocumentNeedsRevision', {
                    document_id: id,
                    title: document.title || data.title,
                    message: `Dokumen "${document.title || data.title}" dikembalikan untuk revisi.`
                }).catch(console.error);
            }
        }
    } else if (updateData.target_role) {
        notes = 'Tujuan dokumen diubah ke ' + (updateData.target_value || document.target_value);
    } else if (fieldChangeSummary) {
        notes = 'Konten dokumen diperbarui';
    }

    await documentRepository.createLog({
        document_id: id,
        user_id: user.id,
        action,
        details: notes,
        old_status: (updateData.status && updateData.status !== oldStatus) ? oldStatus : null,
        new_status: (updateData.status && updateData.status !== oldStatus) ? updateData.status : null,
        changes_summary: fieldChangeSummary || (shouldVersion ? changeSummary : null)
    });

    return await getDocumentById(id, user);
};

export const deleteDocument = async (id, user, reason) => {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    if (document.author_id !== user.id && user.role !== 'admin') {
        throw new ForbiddenError('Unauthorized');
    }
    if (document.status === 'approved') {
        throw new ForbiddenError('Cannot delete approved documents');
    }

    await documentRepository.destroy(id);
    return true;
};
