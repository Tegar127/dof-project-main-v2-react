import * as documentRepository from '../repositories/document.repository.js';
import * as documentService from './document.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import db from '../config/database.js';

export const getApprovals = async (documentId) => {
    return await documentRepository.getApprovals(documentId);
};

export const approveDocument = async (documentId, approvalId, user, notes) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const approval = await db('document_approvals')
        .where({ document_id: documentId, id: approvalId })
        .first();

    if (!approval) throw new NotFoundError('Approval not found');

    if (approval.approver_id && approval.approver_id !== user.id) {
        throw new ForbiddenError('Anda tidak memiliki izin untuk menyetujui dokumen ini.');
    }

    // Role-based hierarchy check. In Laravel this was a custom helper `canApprove`. 
    // We will assume exact role matches or admin for simplicity unless extended.
    if (approval.approver_position && approval.approver_position !== user.position && user.role !== 'admin') {
        throw new ForbiddenError('Posisi anda tidak memenuhi syarat untuk menyetujui dokumen ini.');
    }

    // Check if previous approvals are completed
    const previousPending = await db('document_approvals')
        .where('document_id', documentId)
        .where('sequence', '<', approval.sequence)
        .where('status', 'pending')
        .first();

    if (previousPending) {
        throw new BadRequestError('Approval sebelumnya harus diselesaikan terlebih dahulu.');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await documentRepository.updateApproval(approvalId, {
        status: 'approved',
        approver_id: user.id,
        approver_name: user.name,
        notes: notes || null,
        approved_at: now
    });

    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'approved',
        details: notes || 'Dokumen disetujui',
        created_at: now,
        updated_at: now
    });

    // Check if all approvals are completed
    const pendingCount = await db('document_approvals')
        .where('document_id', documentId)
        .where('status', 'pending')
        .count('id as count')
        .first();

    if (pendingCount.count === 0 && document.status === 'pending_review') {
        await documentRepository.update(documentId, { status: 'approved' });
        await documentRepository.createLog({
            document_id: documentId,
            user_id: user.id,
            action: 'updated',
            details: 'Semua approval selesai',
            old_status: 'pending_review',
            new_status: 'approved',
            created_at: now,
            updated_at: now
        });
    }

    return await documentService.getDocumentById(documentId, user);
};

export const rejectDocument = async (documentId, approvalId, user, notes) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const approval = await db('document_approvals')
        .where({ document_id: documentId, id: approvalId })
        .first();

    if (!approval) throw new NotFoundError('Approval not found');

    if (approval.approver_id && approval.approver_id !== user.id) {
        throw new ForbiddenError('Anda tidak memiliki izin untuk menolak dokumen ini.');
    }

    if (approval.approver_position && approval.approver_position !== user.position && user.role !== 'admin') {
        throw new ForbiddenError('Posisi anda tidak memenuhi syarat untuk menolak dokumen ini.');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await documentRepository.updateApproval(approvalId, {
        status: 'rejected',
        approver_id: user.id,
        approver_name: user.name,
        notes: notes,
        approved_at: now
    });

    await documentRepository.update(documentId, { status: 'needs_revision' });

    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'rejected',
        details: notes,
        old_status: document.status,
        new_status: 'needs_revision',
        created_at: now,
        updated_at: now
    });

    return await documentService.getDocumentById(documentId, user);
};

export const updateSequence = async (documentId, approvals, user) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    if (document.author_id !== user.id) {
        throw new ForbiddenError('Hanya pembuat dokumen yang dapat mengubah urutan approval.');
    }

    for (const app of approvals) {
        await db('document_approvals')
            .where({ id: app.id, document_id: documentId })
            .update({ sequence: app.sequence });
    }

    return await getApprovals(documentId);
};
