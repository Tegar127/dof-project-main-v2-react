import * as documentRepository from '../repositories/document.repository.js';
import * as documentService from './document.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

export const getApprovals = async (documentId) => {
    return await documentRepository.getApprovals(documentId);
};

export const approveDocument = async (documentId, approvalId, user, notes) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const approval = await prisma.documentApproval.findFirst({
        where: { id: Number(approvalId), document_id: Number(documentId) }
    });
    if (!approval) throw new NotFoundError('Approval not found');

    if (approval.approver_id && approval.approver_id !== user.id) {
        throw new ForbiddenError('Anda tidak memiliki izin untuk menyetujui dokumen ini.');
    }
    if (approval.approver_position && approval.approver_position !== user.position && user.role !== 'admin') {
        throw new ForbiddenError('Posisi anda tidak memenuhi syarat untuk menyetujui dokumen ini.');
    }

    const previousPending = await prisma.documentApproval.findFirst({
        where: {
            document_id: Number(documentId),
            sequence: { lt: approval.sequence },
            status: 'pending'
        }
    });
    if (previousPending) {
        throw new BadRequestError('Approval sebelumnya harus diselesaikan terlebih dahulu.');
    }

    const now = new Date().toISOString();

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
        details: notes || 'Dokumen disetujui'
    });

    const pendingCount = await prisma.documentApproval.count({
        where: { document_id: Number(documentId), status: 'pending' }
    });

    if (pendingCount === 0 && document.status === 'pending_review') {
        await documentRepository.update(documentId, { status: 'approved' });
        await documentRepository.createLog({
            document_id: documentId,
            user_id: user.id,
            action: 'updated',
            details: 'Semua approval selesai',
            old_status: 'pending_review',
            new_status: 'approved'
        });
    }

    return await documentService.getDocumentById(documentId, user);
};

export const rejectDocument = async (documentId, approvalId, user, notes) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const approval = await prisma.documentApproval.findFirst({
        where: { id: Number(approvalId), document_id: Number(documentId) }
    });
    if (!approval) throw new NotFoundError('Approval not found');

    if (approval.approver_id && approval.approver_id !== user.id) {
        throw new ForbiddenError('Anda tidak memiliki izin untuk menolak dokumen ini.');
    }
    if (approval.approver_position && approval.approver_position !== user.position && user.role !== 'admin') {
        throw new ForbiddenError('Posisi anda tidak memenuhi syarat untuk menolak dokumen ini.');
    }

    await documentRepository.updateApproval(approvalId, {
        status: 'rejected',
        approver_id: user.id,
        approver_name: user.name,
        notes: notes,
        approved_at: new Date().toISOString()
    });

    await documentRepository.update(documentId, { status: 'needs_revision' });
    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'rejected',
        details: notes,
        old_status: document.status,
        new_status: 'needs_revision'
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
        await prisma.documentApproval.updateMany({
            where: { id: Number(app.id), document_id: Number(documentId) },
            data: { sequence: app.sequence }
        });
    }

    return await getApprovals(documentId);
};
