import db from '../config/database.js';

export const findAll = async () => {
    // Including total work logs and groups is complex in SQLite with Knex directly,
    // We will do basic fetch first and map the extra groups and sum in service.
    return await db('users').orderBy('created_at', 'desc');
};

export const findByEmail = async (email) => {
    return await db('users').where({ email }).first();
};

export const findById = async (id) => {
    return await db('users').where({ id }).first();
};

export const create = async (userData) => {
    const [id] = await db('users').insert(userData);
    return id;
};

export const update = async (id, userData) => {
    await db('users').where({ id }).update(userData);
    return true;
};

export const destroy = async (id) => {
    await db('users').where({ id }).del();
    return true;
};

export const syncGroups = async (userId, groupIds) => {
    await db.transaction(async (trx) => {
        // Delete existing
        await trx('group_user').where({ user_id: userId }).del();

        if (groupIds && groupIds.length > 0) {
            // Insert new
            const insertions = groupIds.map(groupId => ({
                user_id: userId,
                group_id: groupId
            }));
            await trx('group_user').insert(insertions);
        }
    });
};

export const getUserGroups = async (userId) => {
    return await db('groups')
        .join('group_user', 'groups.id', 'group_user.group_id')
        .where('group_user.user_id', userId)
        .select('groups.*');
};

export const getUserTotalWorkLogDuration = async (userId) => {
    try {
        const result = await db('document_work_logs')
            .where({ user_id: userId })
            .sum('duration_minutes as total_duration')
            .first();
        return result?.total_duration || 0;
    } catch {
        // Table may not exist yet
        return 0;
    }
};
