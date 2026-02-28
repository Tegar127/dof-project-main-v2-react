import db from '../config/database.js';

export const findAllForUser = async (user, filters = {}) => {
    let query = db('documents')
        .leftJoin('users as author', 'documents.author_id', 'author.id')
        .select('documents.*', 'author.name as author_name')
        .orderBy('documents.created_at', 'desc');

    // Filter logic (port from Document::forUser scope)
    if (user.role !== 'admin') {
        query.where(function () {
            this.where('documents.author_id', user.id)
                .orWhere(function () {
                    this.where('documents.target_role', 'user')
                        .where('documents.target_value', user.email);
                })
                .orWhere(function () {
                    this.where('documents.target_role', 'position')
                        .where('documents.target_value', user.position);
                })
                .orWhereExists(function () {
                    this.select('id').from('document_approvals')
                        .whereRaw('document_approvals.document_id = documents.id')
                        .andWhere(function () {
                            this.where('document_approvals.approver_id', user.id)
                                .orWhere('document_approvals.approver_position', user.position);
                        });
                });

            // Handling group target
            const userGroup = user.group_name;
            if (userGroup) {
                this.orWhere(function () {
                    this.where('documents.target_role', 'group')
                        .where('documents.target_value', userGroup);
                });
            }

            // [NEW] Check document_distributions table for multi-target distribute
            this.orWhereExists(function () {
                this.select('id').from('document_distributions as dd')
                    .whereRaw('dd.document_id = documents.id')
                    .andWhere(function () {
                        // 1. All
                        this.where('dd.recipient_type', 'all')
                            // 2. Specific User by ID
                            .orWhere(function () {
                                this.where('dd.recipient_type', 'user')
                                    .where('dd.recipient_id', String(user.id));
                            })
                            // 3. Specific Group by Name
                            .orWhere(function () {
                                this.where('dd.recipient_type', 'group')
                                    .where('dd.recipient_id', userGroup);
                            });
                    });
            });
        });
    }

    if (filters.search) {
        query.where(function () {
            this.where('documents.title', 'like', `%${filters.search}%`)
                .orWhere('documents.content_data', 'like', `%${filters.search}%`);
        });
    }
    if (filters.status) query.where('documents.status', filters.status);
    if (filters.type) query.where('documents.type', filters.type);
    if (filters.folder_id) query.where('documents.folder_id', filters.folder_id);

    return await query;
};

export const findById = async (id) => {
    return await db('documents').where({ id }).first();
};

export const create = async (data) => {
    if (data.content_data) data.content_data = JSON.stringify(data.content_data);
    if (data.history_log) data.history_log = JSON.stringify(data.history_log);

    const [id] = await db('documents').insert(data);
    return id;
};

export const update = async (id, data) => {
    if (data.content_data) data.content_data = JSON.stringify(data.content_data);
    if (data.history_log) data.history_log = JSON.stringify(data.history_log);

    await db('documents').where({ id }).update(data);
    return true;
};

export const destroy = async (id) => {
    await db('documents').where({ id }).del();
    return true;
};

export const getLogs = async (documentId) => {
    return await db('document_logs')
        .leftJoin('users', 'document_logs.user_id', 'users.id')
        .where('document_id', documentId)
        .select('document_logs.*', 'users.name as user_name')
        .orderBy('document_logs.created_at', 'desc')
        .orderBy('document_logs.id', 'desc');
};

export const createLog = async (logData) => {
    await db('document_logs').insert(logData);
};

export const getApprovals = async (documentId) => {
    return await db('document_approvals')
        .leftJoin('users as approver', 'document_approvals.approver_id', 'approver.id')
        .where('document_id', documentId)
        .select('document_approvals.*', 'approver.name as approver_name')
        .orderBy('sequence', 'asc');
};

export const createApproval = async (approvalData) => {
    await db('document_approvals').insert(approvalData);
};

export const updateApproval = async (id, approvalData) => {
    await db('document_approvals').where({ id }).update(approvalData);
};

export const clearApprovals = async (documentId) => {
    await db('document_approvals').where({ document_id: documentId }).del();
};

export const getVersions = async (documentId) => {
    return await db('document_versions')
        .leftJoin('users as updater', 'document_versions.updated_by', 'updater.id')
        .where('document_id', documentId)
        .select('document_versions.*', 'updater.name as updater_name')
        .orderBy('document_versions.created_at', 'desc')
        .orderBy('document_versions.id', 'desc');
};

export const createVersion = async (versionData) => {
    if (versionData.content_data) versionData.content_data = JSON.stringify(versionData.content_data);
    await db('document_versions').insert(versionData);
};

export const getVersionById = async (versionId) => {
    return await db('document_versions').where({ id: versionId }).first();
};

export const markAsRead = async (documentId, userId) => {
    const existing = await db('document_read_receipts')
        .where({ document_id: documentId, user_id: userId })
        .first();

    if (!existing) {
        await db('document_read_receipts').insert({
            document_id: documentId,
            user_id: userId,
            read_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
    }
};

export const getReadReceipts = async (documentId) => {
    return await db('document_read_receipts')
        .leftJoin('users', 'document_read_receipts.user_id', 'users.id')
        .where('document_id', documentId)
        .select('document_read_receipts.*', 'users.name as user_name');
};

export const getDistributions = async (documentId) => {
    return await db('document_distributions').where('document_id', documentId);
};
