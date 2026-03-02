import prisma from '../config/database.js';

export const findAll = async () => {
    return await prisma.user.findMany({
        orderBy: { created_at: 'desc' }
    });
};

export const findByEmail = async (email) => {
    return await prisma.user.findUnique({ where: { email } });
};

export const findById = async (id) => {
    return await prisma.user.findUnique({ where: { id: Number(id) } });
};

export const create = async (userData) => {
    const user = await prisma.user.create({ data: userData });
    return user.id;
};

export const update = async (id, userData) => {
    await prisma.user.update({ where: { id: Number(id) }, data: userData });
    return true;
};

export const destroy = async (id) => {
    await prisma.user.delete({ where: { id: Number(id) } });
    return true;
};

export const syncGroups = async (userId, groupIds) => {
    await prisma.$transaction(async (tx) => {
        await tx.groupUser.deleteMany({ where: { user_id: Number(userId) } });

        if (groupIds && groupIds.length > 0) {
            await tx.groupUser.createMany({
                data: groupIds.map((groupId) => ({
                    user_id: Number(userId),
                    group_id: Number(groupId)
                }))
            });
        }
    });
};

export const getUserGroups = async (userId) => {
    const memberships = await prisma.groupUser.findMany({
        where: { user_id: Number(userId) },
        include: { group: true }
    });
    return memberships.map((m) => m.group);
};

export const getUserTotalWorkLogDuration = async (userId) => {
    const aggregate = await prisma.documentWorkLog.aggregate({
        _sum: {
            duration_minutes: true,
        },
        where: {
            user_id: Number(userId),
        },
    });
    return aggregate._sum.duration_minutes || 0;
};
