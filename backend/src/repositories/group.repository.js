import db from '../config/database.js';

export const findAll = async (user = null) => {
    let query = db('groups');

    if (user && user.role !== 'admin') {
        query = query.where(function () {
            // User sees public groups
            this.where('groups.is_private', false)
                // OR groups where they are the primary member
                .orWhere('groups.name', user.group_name)
                // OR groups where they are a member via pivot
                .orWhereExists(function () {
                    this.select('id')
                        .from('group_user')
                        .whereRaw('group_user.group_id = groups.id')
                        .andWhere('group_user.user_id', user.id);
                });
        });
    }

    return await query;
};

export const findById = async (id) => {
    return await db('groups').where({ id }).first();
};

export const findByName = async (name) => {
    return await db('groups').where({ name }).first();
};

export const create = async (data) => {
    const [id] = await db('groups').insert(data);
    return id;
};

export const update = async (id, data) => {
    await db('groups').where({ id }).update(data);
    return true;
};

export const destroy = async (id) => {
    await db('groups').where({ id }).del();
    return true;
};

export const syncMembers = async (groupId, userIds) => {
    await db.transaction(async (trx) => {
        await trx('group_user').where({ group_id: groupId }).del();

        if (userIds && userIds.length > 0) {
            const insertions = userIds.map(userId => ({
                group_id: groupId,
                user_id: userId
            }));
            await trx('group_user').insert(insertions);
        }
    });
};

export const getGroupMembers = async (groupId) => {
    return await db('users')
        .join('group_user', 'users.id', 'group_user.user_id')
        .where('group_user.group_id', groupId)
        .select('users.id', 'users.name', 'users.email', 'users.role');
};

export const getGroupTotalWorkLogDuration = async (groupName) => {
    try {
        const result = await db('document_work_logs')
            .where({ group_name: groupName })
            .sum('duration_minutes as total')
            .first();
        return result?.total || 0;
    } catch {
        // Table may not exist yet
        return 0;
    }
};
