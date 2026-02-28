import * as distRepository from '../repositories/documentDistribution.repository.js';
import * as documentRepository from '../repositories/document.repository.js';
import * as groupService from './group.service.js';
import * as notificationService from './notification.service.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import db from '../config/database.js';

export const getMonitoringData = async (user) => {
    const documents = await distRepository.getDistributedDocuments(user);

    const monitoringData = await Promise.all(documents.map(async (doc) => {
        const distributions = await distRepository.getDocumentDistributions(doc.id);
        const readReceipts = await documentRepository.getReadReceipts(doc.id);

        // Calculate unique expected recipients
        let recipientUserIds = [];
        let isAll = false;

        for (const dist of distributions) {
            if (dist.recipient_type === 'all') {
                isAll = true;
                break;
            } else if (dist.recipient_type === 'group') {
                const group = await groupService.getGroupById(dist.recipient_id);
                if (group && group.members) {
                    recipientUserIds.push(...group.members.map(m => m.id));
                }
            } else if (dist.recipient_type === 'user') {
                recipientUserIds.push(dist.recipient_id);
            }
        }

        let totalExpected = 0;
        let readCount = 0;

        if (isAll) {
            const allUsersCount = await db('users').whereNot('id', doc.author_id).count('id as count').first();
            totalExpected = allUsersCount.count;
            // Filter read receipts to exclude author
            const uniqueReadReceipts = new Set(readReceipts.filter(r => r.user_id !== doc.author_id).map(r => r.user_id));
            readCount = uniqueReadReceipts.size;
        } else {
            const uniqueRecipients = [...new Set(recipientUserIds)];
            totalExpected = uniqueRecipients.length;
            const uniqueReadReceipts = new Set(readReceipts.filter(r => uniqueRecipients.includes(r.user_id)).map(r => r.user_id));
            readCount = uniqueReadReceipts.size;
        }

        // Find latest distributed_at from distributions
        let latestDistAt = null;
        if (distributions.length > 0) {
            latestDistAt = distributions.reduce((max, d) => (d.created_at > max ? d.created_at : max), distributions[0].created_at);
        }

        const statusLabels = {
            'draft': 'Draft',
            'pending_review': 'Menunggu Review',
            'needs_revision': 'Perlu Revisi',
            'approved': 'Disetujui',
            'sent': 'Dikirim',
            'received': 'Diterima'
        };

        return {
            id: doc.id,
            title: doc.title,
            author_name: doc.author_name,
            status: doc.status,
            status_label: statusLabels[doc.status] || doc.status,
            distributed_at: latestDistAt,
            total_expected: totalExpected,
            read_count: readCount,
            percentage: totalExpected > 0 ? Math.round((readCount / totalExpected) * 100) : 0,
        };
    }));

    return monitoringData;
};

const notifyRecipients = async (document, recipient, excludeUserId) => {
    let userIdsToNotify = [];

    if (recipient.type === 'all') {
        const users = await db('users').select('id');
        userIdsToNotify = users.map(u => u.id);
    } else if (recipient.type === 'group') {
        const group = await groupService.getGroupById(recipient.id);
        if (group && group.members) {
            userIdsToNotify = group.members.map(m => m.id);
        }
    } else if (recipient.type === 'user') {
        userIdsToNotify = [recipient.id];
    }

    // De-duplicate and exclude author
    userIdsToNotify = [...new Set(userIdsToNotify)].filter(id => id !== excludeUserId);

    // Create notifications for each
    for (const userId of userIdsToNotify) {
        await notificationService.createNotification(userId, 'App\\Notifications\\DocumentDistributedNotification', {
            document_id: document.id,
            title: document.title,
            message: `Dokumen baru telah didistribusikan: ${document.title}`
        });
    }
};

export const distributeDocument = async (documentId, user, recipients, notes) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    // Only Admin can distribute final approved documents
    if (user.role !== 'admin') {
        throw new ForbiddenError('Hanya Admin yang memiliki otorisasi untuk mendistribusikan dokumen final.');
    }

    if (!['approved', 'sent', 'received'].includes(document.status)) {
        throw new BadRequestError('Hanya dokumen yang sudah disetujui yang dapat didistribusikan.');
    }

    const oldStatus = document.status;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const recipient of recipients) {
        await distRepository.createDistribution({
            document_id: document.id,
            recipient_type: recipient.type,
            recipient_id: recipient.id || null,
            notes: notes || null,
            created_at: now,
            updated_at: now
        });

        await notifyRecipients(document, recipient, user.id);
    }

    if (document.status === 'approved') {
        await documentRepository.update(document.id, { status: 'sent', updated_at: now });
        await documentRepository.createLog({
            document_id: document.id,
            user_id: user.id,
            action: 'distributed',
            details: 'Dokumen didistribusikan',
            old_status: oldStatus,
            new_status: 'sent',
            created_at: now,
            updated_at: now
        });

        // Notify author that their document was distributed
        if (document.author_id !== user.id) {
            await notificationService.createNotification(document.author_id, 'App\\Notifications\\DocumentDistributedToAuthor', {
                document_id: document.id,
                title: document.title,
                message: `Dokumen Anda "${document.title}" telah didistribusikan oleh Admin.`
            });
        }
    } else {
        await documentRepository.createLog({
            document_id: document.id,
            user_id: user.id,
            action: 'redistributed',
            details: 'Dokumen didistribusikan ulang',
            old_status: oldStatus,
            new_status: document.status,
            created_at: now,
            updated_at: now
        });
    }

    return true;
};

export const getDistributionDetails = async (documentId) => {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const distributions = await distRepository.getDocumentDistributions(document.id);
    const readReceipts = await documentRepository.getReadReceipts(document.id);

    let recipientIds = [];
    let sentToAll = false;

    for (const dist of distributions) {
        if (dist.recipient_type === 'all') {
            sentToAll = true;
            break;
        } else if (dist.recipient_type === 'group') {
            const group = await groupService.getGroupById(dist.recipient_id);
            if (group && group.members) {
                recipientIds.push(...group.members.map(m => m.id));
            }
        } else if (dist.recipient_type === 'user') {
            recipientIds.push(dist.recipient_id);
        }
    }

    recipientIds = [...new Set(recipientIds)];

    let recipients = [];
    if (sentToAll) {
        recipients = await db('users');
    } else {
        recipients = await db('users').whereIn('id', recipientIds);
    }

    const readUserIds = readReceipts.map(r => r.user_id);

    const details = recipients.map(u => {
        const receipt = readReceipts.find(r => r.user_id === u.id);
        return {
            user_id: u.id,
            user_name: u.name,
            user_position: u.position,
            is_read: readUserIds.includes(u.id),
            read_at: receipt ? receipt.read_at : null
        };
    });

    const statusLabels = {
        'draft': 'Draft',
        'pending_review': 'Menunggu Review',
        'needs_revision': 'Perlu Revisi',
        'approved': 'Disetujui',
        'sent': 'Dikirim',
        'received': 'Diterima'
    };

    return {
        document: {
            id: document.id,
            title: document.title,
            status: statusLabels[document.status] || document.status
        },
        recipients: details
    };
};
