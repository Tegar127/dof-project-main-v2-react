import prisma from '../config/database.js';

export const findAll = async (user = null) => {
    const where = {};

    if (user && user.role !== 'admin') {
        where.OR = [
            { is_private: false },
            { name: user.group_name },
            {
                members: {
                    some: { user_id: Number(user.id) }
                }
            }
        ];
    }

    return await prisma.group.findMany({ where });
};

export const findById = async (id) => {
    return await prisma.group.findUnique({ where: { id: Number(id) } });
};

export const findByName = async (name) => {
    return await prisma.group.findFirst({ where: { name } });
};

export const create = async (data) => {
    const group = await prisma.group.create({ data });
    return group.id;
};

export const update = async (id, data) => {
    await prisma.group.update({ where: { id: Number(id) }, data });
    return true;
};

export const destroy = async (id) => {
    await prisma.group.delete({ where: { id: Number(id) } });
    return true;
};

export const syncMembers = async (groupId, userIds) => {
    await prisma.$transaction(async (tx) => {
        await tx.groupUser.deleteMany({ where: { group_id: Number(groupId) } });

        if (userIds && userIds.length > 0) {
            await tx.groupUser.createMany({
                data: userIds.map((userId) => ({
                    group_id: Number(groupId),
                    user_id: Number(userId)
                }))
            });
        }
    });
};

export const getGroupMembers = async (groupId) => {
    const memberships = await prisma.groupUser.findMany({
        where: { group_id: Number(groupId) },
        include: {
            user: { select: { id: true, name: true, email: true, role: true } }
        }
    });
    return memberships.map((m) => m.user);
};

export const getGroupTotalWorkLogDuration = async (_groupName) => {
    // Table document_work_logs not in current schema
    return 0;
};
