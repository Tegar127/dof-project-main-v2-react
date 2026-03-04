import prisma from '../config/database.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const serializeJson = (value) => (value ? JSON.stringify(value) : null);

// ─── Find All (complex filter, uses raw SQL for multi-condition OR) ───────────

export const findAllForUser = async (user, filters = {}) => {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (user.role === 'reviewer') {
        conditions.push(`(
            d.author_id = $${idx}
            OR d.target_role = 'dispo'
            OR EXISTS (
                SELECT 1 FROM document_approvals da
                WHERE da.document_id = d.id
                AND (da.approver_id = $${idx} OR da.approver_position = $${idx + 1})
            )
        )`);
        values.push(user.id, user.position || '');
        idx += 2;
    } else if (user.role !== 'admin') {
        const userGroup = user.group_name || '';
        conditions.push(`(
            d.author_id = $${idx}
            OR (d.target_role = 'user'     AND d.target_value = $${idx + 1})
            OR (d.target_role = 'position' AND d.target_value = $${idx + 2})
            OR (d.target_role = 'group'    AND d.target_value = $${idx + 3})
            OR EXISTS (
                SELECT 1 FROM document_approvals da
                WHERE da.document_id = d.id
                AND (da.approver_id = $${idx} OR da.approver_position = $${idx + 2})
            )
            OR EXISTS (
                SELECT 1 FROM document_distributions dd
                WHERE dd.document_id = d.id
                AND (
                    dd.recipient_type = 'all'
                    OR (dd.recipient_type = 'user'  AND dd.recipient_id = $${idx + 4})
                    OR (dd.recipient_type = 'group' AND EXISTS (
                        SELECT 1 FROM groups g
                        WHERE g.id::text = dd.recipient_id
                        AND g.name = $${idx + 3}
                    ))
                )
            )
        )`);
        values.push(user.id, user.email || '', user.position || '', userGroup, String(user.id));
        idx += 5;
    }
    // admin: no WHERE filter → sees all documents

    if (filters.search) {
        conditions.push(`(d.title ILIKE $${idx} OR d.content_data ILIKE $${idx})`);
        values.push(`%${filters.search}%`);
        idx++;
    }
    if (filters.status) {
        conditions.push(`d.status = $${idx}`);
        values.push(filters.status);
        idx++;
    }
    if (filters.type) {
        conditions.push(`d.type = $${idx}`);
        values.push(filters.type);
        idx++;
    }
    if (filters.folder_id) {
        conditions.push(`d.folder_id = $${idx}`);
        values.push(Number(filters.folder_id));
        idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
        SELECT d.*, u.name AS author_name
        FROM documents d
        LEFT JOIN users u ON d.author_id = u.id
        ${whereClause}
        ORDER BY d.created_at DESC
    `;

    return await prisma.$queryRawUnsafe(sql, ...values);
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const findById = async (id) => {
    return await prisma.document.findUnique({ where: { id: Number(id) } });
};

export const create = async (data) => {
    const payload = {
        ...data,
        author_id: data.author_id ? Number(data.author_id) : null,
        folder_id: data.folder_id ? Number(data.folder_id) : null,
        content_data: serializeJson(data.content_data),
        history_log: serializeJson(data.history_log)
    };
    const doc = await prisma.document.create({ data: payload });
    return doc.id;
};

export const update = async (id, data) => {
    const payload = { ...data };
    if (data.content_data !== undefined) payload.content_data = serializeJson(data.content_data);
    if (data.history_log !== undefined) payload.history_log = serializeJson(data.history_log);
    if (data.author_id !== undefined) payload.author_id = data.author_id ? Number(data.author_id) : null;
    if (data.folder_id !== undefined) payload.folder_id = data.folder_id ? Number(data.folder_id) : null;

    await prisma.document.update({ where: { id: Number(id) }, data: payload });
    return true;
};

export const destroy = async (id) => {
    await prisma.document.delete({ where: { id: Number(id) } });
    return true;
};

// ─── Logs ─────────────────────────────────────────────────────────────────────

export const getLogs = async (documentId) => {
    return await prisma.documentLog.findMany({
        where: { document_id: Number(documentId) },
        include: { user: { select: { name: true } } },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }]
    });
};

export const createLog = async (logData) => {
    await prisma.documentLog.create({
        data: {
            ...logData,
            document_id: Number(logData.document_id),
            user_id: logData.user_id ? Number(logData.user_id) : null
        }
    });
};

// ─── Approvals ────────────────────────────────────────────────────────────────

export const getApprovals = async (documentId) => {
    return await prisma.documentApproval.findMany({
        where: { document_id: Number(documentId) },
        include: { approver: { select: { name: true } } },
        orderBy: { sequence: 'asc' }
    });
};

export const createApproval = async (approvalData) => {
    await prisma.documentApproval.create({
        data: {
            ...approvalData,
            document_id: Number(approvalData.document_id),
            approver_id: approvalData.approver_id ? Number(approvalData.approver_id) : null
        }
    });
};

export const updateApproval = async (id, approvalData) => {
    await prisma.documentApproval.update({
        where: { id: Number(id) },
        data: approvalData
    });
};

export const clearApprovals = async (documentId) => {
    await prisma.documentApproval.deleteMany({
        where: { document_id: Number(documentId) }
    });
};

// ─── Versions ─────────────────────────────────────────────────────────────────

export const getVersions = async (documentId) => {
    return await prisma.documentVersion.findMany({
        where: { document_id: Number(documentId) },
        include: { updater: { select: { name: true } } },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }]
    });
};

export const createVersion = async (versionData) => {
    await prisma.documentVersion.create({
        data: {
            ...versionData,
            document_id: Number(versionData.document_id),
            updated_by: versionData.updated_by ? Number(versionData.updated_by) : null,
            content_data: serializeJson(versionData.content_data)
        }
    });
};

export const getVersionById = async (versionId) => {
    return await prisma.documentVersion.findUnique({ where: { id: Number(versionId) } });
};

// ─── Read Receipts ────────────────────────────────────────────────────────────

export const markAsRead = async (documentId, userId) => {
    await prisma.documentReadReceipt.upsert({
        where: {
            document_id_user_id: {
                document_id: Number(documentId),
                user_id: Number(userId)
            }
        },
        create: {
            document_id: Number(documentId),
            user_id: Number(userId),
            read_at: new Date().toISOString()
        },
        update: {
            read_at: new Date().toISOString()
        }
    });
};

export const getReadReceipts = async (documentId) => {
    return await prisma.documentReadReceipt.findMany({
        where: { document_id: Number(documentId) },
        include: { user: { select: { name: true } } }
    });
};

// ─── Distributions ────────────────────────────────────────────────────────────

export const getDistributions = async (documentId) => {
    return await prisma.documentDistribution.findMany({
        where: { document_id: Number(documentId) }
    });
};
