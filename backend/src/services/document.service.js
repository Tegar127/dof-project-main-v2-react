import * as documentRepository from '../repositories/document.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';

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
    // Parse stringified JSON fields
    for (const doc of documents) {
        if (typeof doc.content_data === 'string') {
            try { doc.content_data = JSON.parse(doc.content_data); } catch { doc.content_data = {}; }
        }
        if (typeof doc.history_log === 'string') {
            try { doc.history_log = JSON.parse(doc.history_log); } catch { doc.history_log = []; }
        }
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

    // Parse JSON strings back to objects
    if (typeof document.content_data === 'string') document.content_data = JSON.parse(document.content_data);
    if (typeof document.history_log === 'string') document.history_log = JSON.parse(document.history_log);

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Only mark user as read, avoid group check logic repetition or implement correctly
    await documentRepository.markAsRead(id, user.id);

    // If opened by receiver group member and status is 'sent', update to 'received'
    if (document.status === 'sent' && document.target_role === 'group') {
        const userGroups = [user.group_name]; // Basic group validation
        if (userGroups.includes(document.target_value)) {
            const oldStatus = document.status;
            await documentRepository.update(id, { status: 'received', updated_at: now });
            document.status = 'received';

            await documentRepository.createLog({
                document_id: id,
                user_id: user.id,
                action: 'received',
                details: 'Dokumen diterima oleh ' + document.target_value,
                old_status: oldStatus,
                new_status: 'received',
                created_at: now,
                updated_at: now
            });
        }
    }

    const logs = await documentRepository.getLogs(id);
    const approvals = await documentRepository.getApprovals(id);
    const readReceipts = await documentRepository.getReadReceipts(id);

    return { ...document, logs, approvals, read_receipts: readReceipts };
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

    if (typeof document.content_data === 'string') document.content_data = JSON.parse(document.content_data);

    // Prevent editing final documents
    const isFinal = ['approved', 'sent', 'received'].includes(document.status);
    if (isFinal && !data.status && !data.target) {
        if (data.content_data) {
            throw new BadRequestError('Dokumen final tidak dapat diubah kontennya.');
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
    }

    await documentRepository.createLog({
        document_id: id,
        user_id: user.id,
        action,
        details: notes,
        old_status: (updateData.status && updateData.status !== oldStatus) ? oldStatus : null,
        new_status: (updateData.status && updateData.status !== oldStatus) ? updateData.status : null,
        changes_summary: shouldVersion ? changeSummary : null,
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
