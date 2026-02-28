import * as documentRepository from '../repositories/document.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';

// Human-readable labels for content_data fields
const FIELD_LABELS = {
    // Nota Dinas
    docNumber: 'Nomor Surat',
    date: 'Tanggal',
    to: 'Tujuan',
    cc: 'Tembusan',
    ccs: 'Tembusan',
    from: 'Dari',
    plh_pjs: 'Status Jabatan',
    subject: 'Perihal',
    content: 'Isi Surat',
    body: 'Isi Surat',
    closing: 'Kalimat Penutup',
    location: 'Tempat',
    signerName: 'Nama Penandatangan',
    signerPosition: 'Jabatan Penandatangan',
    paraf: 'Paraf',
    basis: 'Dasar Pelaksanaan',
    remembers: 'Menimbang',
    basisStyle: 'Gaya Penomoran',
    deadline: 'Batas Waktu',
    title: 'Judul',
    // SPPD fields
    travelerName: 'Nama Pelaksana',
    travelerPosition: 'Jabatan Pelaksana',
    travelerNip: 'NIP Pelaksana',
    travelerGrade: 'Golongan',
    destination: 'Kota Tujuan',
    purpose: 'Tujuan Perjalanan',
    startDate: 'Tanggal Berangkat',
    endDate: 'Tanggal Kembali',
    days: 'Jumlah Hari',
    transport: 'Transportasi',
    accommodation: 'Akomodasi',
    chargedTo: 'Biaya Dibebankan',
    // Perjanjian fields
    partyA: 'Pihak Pertama',
    partyAPos: 'Jabatan Pihak Pertama',
    partyB: 'Pihak Kedua',
    partyBPos: 'Jabatan Pihak Kedua',
    agreementDate: 'Tanggal Perjanjian',
    agreementNumber: 'Nomor Perjanjian',
    agreementSubject: 'Perihal Perjanjian',
    clauses: 'Pasal/Klausul',
};

// Strip HTML tags for readable display
const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
};

/**
 * Compare two content_data objects and return a human-readable summary of changes.
 */
const generateChangeSummary = (oldData = {}, newData = {}) => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
        const label = FIELD_LABELS[key];
        if (!label) continue; // skip unlabeled internal fields

        const oldVal = oldData[key];
        const newVal = newData[key];
        const oldStr = JSON.stringify(oldVal);
        const newStr = JSON.stringify(newVal);

        if (oldStr !== newStr) {
            // Format values for readability
            let oldDisplay = formatFieldValue(oldVal, key);
            let newDisplay = formatFieldValue(newVal, key);

            // Truncate long strings
            if (oldDisplay.length > 100) oldDisplay = oldDisplay.substring(0, 100) + '...';
            if (newDisplay.length > 100) newDisplay = newDisplay.substring(0, 100) + '...';

            if (oldDisplay && newDisplay) {
                changes.push(`• ${label}: "${oldDisplay}" → "${newDisplay}"`);
            } else if (newDisplay) {
                changes.push(`• ${label} diisi: "${newDisplay}"`);
            } else if (oldDisplay) {
                changes.push(`• ${label} dihapus`);
            }
        }
    }

    return changes.length > 0 ? changes.join('\n') : null;
};

const formatFieldValue = (val, key = '') => {
    if (val === null || val === undefined || val === '') return '';
    // Strip HTML for CKEditor content fields
    if ((key === 'content' || key === 'body') && typeof val === 'string') {
        return stripHtml(val);
    }
    if (Array.isArray(val)) {
        if (val.length === 0) return '';
        // Array of strings
        if (typeof val[0] === 'string') return val.filter(Boolean).join(', ');
        // Array of objects with 'text'
        if (typeof val[0] === 'object' && val[0]?.text !== undefined) {
            return val.map(v => v.text).filter(Boolean).join(', ');
        }
        // Array of objects (paraf)
        if (typeof val[0] === 'object') {
            return val.map(v => v.name || v.code || '').filter(Boolean).join(', ');
        }
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

    // Parse stringified JSON fields & attached distributions
    for (const doc of documents) {
        if (typeof doc.content_data === 'string' && doc.content_data) {
            try { doc.content_data = JSON.parse(doc.content_data); } catch { doc.content_data = {}; }
        } else if (!doc.content_data) { doc.content_data = {}; }
        if (typeof doc.history_log === 'string' && doc.history_log) {
            try { doc.history_log = JSON.parse(doc.history_log); } catch { doc.history_log = []; }
        } else if (!doc.history_log) { doc.history_log = []; }

        // Attach distributions
        const dists = await documentRepository.getDistributions(doc.id);
        doc.distributions = dists;
    }

    return documents;
};

export const createDocument = async (user, data) => {
    const contentData = data.content_data || {};

    // Ensure defaults for new requirements
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
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const documentId = await documentRepository.create(documentData);

    // Create initial version
    await documentRepository.createVersion({
        document_id: documentId,
        version_number: '1.0',
        content_data: contentData,
        updated_by: user.id,
        created_at: documentData.created_at,
        updated_at: documentData.updated_at
    });

    // Create initial log entry
    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'created',
        details: 'Dokumen dibuat',
        created_at: documentData.created_at,
        updated_at: documentData.updated_at
    });

    // Create approval records if specified
    if (data.approvals && data.approvals.length > 0) {
        for (let i = 0; i < data.approvals.length; i++) {
            await documentRepository.createApproval({
                document_id: documentId,
                sequence: i + 1,
                approver_position: data.approvals[i].position || null,
                approver_id: data.approvals[i].approver_id || null,
                status: 'pending',
                created_at: documentData.created_at,
                updated_at: documentData.updated_at
            });
        }
    }

    return await getDocumentById(documentId, user);
};

export const getDocumentById = async (id, user) => {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    // Get distributions early to check recipient status
    const distributions = await documentRepository.getDistributions(id);

    // Parse JSON strings back to objects (with safety guards)
    if (typeof document.content_data === 'string' && document.content_data) {
        try { document.content_data = JSON.parse(document.content_data); } catch { document.content_data = {}; }
    } else if (!document.content_data) { document.content_data = {}; }
    if (typeof document.history_log === 'string' && document.history_log) {
        try { document.history_log = JSON.parse(document.history_log); } catch { document.history_log = []; }
    } else if (!document.history_log) { document.history_log = []; }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Only mark user as read, avoid group check logic repetition or implement correctly
    await documentRepository.markAsRead(id, user.id);

    // Check if user is a valid recipient through distributions
    const userGroups = [user.group_name, ...(user.groups || []).map(g => typeof g === 'object' ? g.name : g)].filter(Boolean);
    const isRecipient = distributions.some(d =>
        d.recipient_type === 'all' ||
        (d.recipient_type === 'user' && String(d.recipient_id) === String(user.id)) ||
        (d.recipient_type === 'group' && userGroups.includes(d.recipient_id))
    );

    // If opened by receiver and status is 'sent', update to 'received'
    if (document.status === 'sent' && (isRecipient || (document.target_role === 'group' && userGroups.includes(document.target_value)))) {
        const oldStatus = document.status;
        await documentRepository.update(id, { status: 'received', updated_at: now });
        document.status = 'received';

        await documentRepository.createLog({
            document_id: id,
            user_id: user.id,
            action: 'received',
            details: 'Dokumen diterima dan dibaca.',
            old_status: oldStatus,
            new_status: 'received',
            created_at: now,
            updated_at: now
        });
    }

    const logs = await documentRepository.getLogs(id);
    const approvals = await documentRepository.getApprovals(id);
    const readReceipts = await documentRepository.getReadReceipts(id);

    return { ...document, logs, approvals, read_receipts: readReceipts, distributions };
};

const incrementVersionString = (versionStr, major = false) => {
    let [maj, min] = versionStr.split('.').map(Number);
    if (major) {
        maj += 1;
        min = 0;
    } else {
        min += 1;
    }
    return `${maj}.${min}`;
};

export const updateDocument = async (id, user, data) => {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    if (typeof document.content_data === 'string' && document.content_data) {
        try { document.content_data = JSON.parse(document.content_data); } catch { document.content_data = {}; }
    } else if (!document.content_data) { document.content_data = {}; }

    // Prevent editing approved/final documents
    if (document.status === 'approved') {
        const allowedUpdates = Object.keys(data).filter(k => !['status', 'target'].includes(k));
        // If they are trying to update anything other than status/target (e.g. content) on an approved doc
        if (allowedUpdates.length > 0 && data.content_data) {
            throw new BadRequestError('Dokumen yang sudah disetujui (Final) tidak dapat diubah kontennya.');
        }
    }

    const updateData = { updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') };
    const oldStatus = document.status;

    if (data.status !== undefined) updateData.status = data.status;
    if (data.content_data !== undefined) updateData.content_data = data.content_data;
    if (data.history_log !== undefined) updateData.history_log = data.history_log;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.forward_note !== undefined) updateData.forward_note = data.forward_note;
    if (data.target !== undefined) {
        updateData.target_role = data.target.type;
        updateData.target_value = data.target.value;
    }
    if (data.folder_id !== undefined) updateData.folder_id = data.folder_id;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;

    // Handle Versioning
    let shouldVersion = false;
    let changeSummary = null;
    let newVersion = document.version;

    if (data.content_data || data.increment_version) {
        shouldVersion = true;

        if (data.content_data) {
            changeSummary = 'Konten dokumen diperbarui';
            if (!data.increment_version) {
                newVersion = incrementVersionString(document.version, false);
                updateData.version = newVersion;
            }
        } else {
            changeSummary = 'Versi baru manual.';
        }

        if (data.increment_version) {
            newVersion = incrementVersionString(document.version, false);
            updateData.version = newVersion;
        }

        await documentRepository.createVersion({
            document_id: id,
            version_number: newVersion,
            content_data: data.content_data || document.content_data,
            change_summary: changeSummary,
            updated_by: user.id,
            created_at: updateData.updated_at,
            updated_at: updateData.updated_at
        });
    }

    await documentRepository.update(id, updateData);

    // Update approvals if provided
    if (data.approvals) {
        await documentRepository.clearApprovals(id);
        for (let i = 0; i < data.approvals.length; i++) {
            await documentRepository.createApproval({
                document_id: id,
                sequence: i + 1,
                approver_position: data.approvals[i].approver_position || null,
                status: data.approvals[i].status || 'pending',
                created_at: updateData.updated_at,
                updated_at: updateData.updated_at
            });
        }
    }

    // Generate detailed field-level change summary
    let fieldChangeSummary = null;
    if (data.content_data) {
        fieldChangeSummary = generateChangeSummary(document.content_data, data.content_data);
    }

    // Determine action for logging
    let action = 'updated';
    let notes = 'Dokumen diperbarui';
    const finalStatus = updateData.status !== undefined ? updateData.status : oldStatus;

    if (updateData.status && updateData.status !== oldStatus) {
        if (updateData.status === 'sent') {
            if (oldStatus === 'draft' || oldStatus === 'needs_revision') {
                action = 'sent';
                notes = 'Dokumen dikirim ke ' + (updateData.target_value || document.target_value);

                if (oldStatus === 'needs_revision') {
                    newVersion = incrementVersionString(newVersion, false);
                    await documentRepository.update(id, { version: newVersion });
                    await documentRepository.createVersion({
                        document_id: id,
                        version_number: newVersion,
                        content_data: data.content_data || document.content_data,
                        change_summary: 'Dokumen dikirim kembali setelah revisi.',
                        updated_by: user.id,
                        created_at: updateData.updated_at,
                        updated_at: updateData.updated_at
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
                    updated_by: user.id,
                    created_at: updateData.updated_at,
                    updated_at: updateData.updated_at
                });
            }
        } else {
            action = updateData.status === 'pending_review' ? 'sent' : updateData.status;
            notes = getStatusChangeNote(updateData.status);
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
        changes_summary: fieldChangeSummary || (shouldVersion ? changeSummary : null),
        created_at: updateData.updated_at,
        updated_at: updateData.updated_at
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

    // In Laravel we had notifications here. We'll implement those later in notification module.
    await documentRepository.destroy(id);
    return true;
};
