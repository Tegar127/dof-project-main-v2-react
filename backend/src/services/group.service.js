import * as groupRepository from '../repositories/group.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import prisma from '../config/database.js';

export const getAllGroups = async (user) => {
    const groups = await groupRepository.findAll(user);
    const groupsWithDetails = await Promise.all(groups.map(async (group) => {
        const total_minutes = await groupRepository.getGroupTotalWorkLogDuration(group.name);
        return { ...group, total_minutes };
    }));
    return groupsWithDetails;
};

export const getGroupById = async (id) => {
    const group = await groupRepository.findById(id);
    if (!group) throw new NotFoundError('Group not found');
    const members = await groupRepository.getGroupMembers(id);
    return { ...group, members };
};

export const createGroup = async (data) => {
    const existingGroup = await groupRepository.findByName(data.name);
    if (existingGroup) throw new BadRequestError('Group name already exists');

    const { invited_users, ...groupData } = data;
    const groupId = await groupRepository.create(groupData);

    if (invited_users && invited_users.length > 0) {
        await groupRepository.syncMembers(groupId, invited_users);
    }
    return await getGroupById(groupId);
};

export const updateGroup = async (id, data) => {
    const group = await groupRepository.findById(id);
    if (!group) throw new NotFoundError('Group not found');

    const { invited_users, ...updateData } = data;

    if (updateData.name && updateData.name !== group.name) {
        const existingGroup = await groupRepository.findByName(updateData.name);
        if (existingGroup) throw new BadRequestError('Group name already exists');
    }

    await groupRepository.update(id, updateData);

    if (invited_users !== undefined) {
        await groupRepository.syncMembers(id, invited_users);
    }
    return await getGroupById(id);
};

export const deleteGroup = async (id) => {
    const group = await groupRepository.findById(id);
    if (!group) throw new NotFoundError('Group not found');
    await groupRepository.destroy(id);
    return true;
};

export const getGroupStats = async (id) => {
    const group = await groupRepository.findById(id);
    if (!group) throw new NotFoundError('Group not found');

    const members = await groupRepository.getGroupMembers(id);
    const total_minutes = await groupRepository.getGroupTotalWorkLogDuration(group.name);

    // Dapatkan daftar ID dokumen unik yang pernah dikerjakan grup ini
    const logs = await prisma.documentWorkLog.findMany({
        where: { group_name: group.name },
        distinct: ['document_id'],
        select: { document_id: true }
    });

    const documentIds = logs.map(l => l.document_id);

    let documents = [];
    if (documentIds.length > 0) {
        const rootDocs = await prisma.document.findMany({
            where: { id: { in: documentIds } },
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                created_at: true,
                updated_at: true
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        // Group the logs by document_id and sum their duration_minutes
        const groupedLogs = await prisma.documentWorkLog.groupBy({
            by: ['document_id'],
            where: {
                group_name: group.name,
                document_id: { in: documentIds }
            },
            _sum: {
                duration_minutes: true
            }
        });

        // Map the sums back to the actual document array
        documents = rootDocs.map(doc => {
            const sumData = groupedLogs.find(g => g.document_id === doc.id);
            return {
                ...doc,
                total_minutes: sumData?._sum?.duration_minutes || 0,
                last_worked: doc.updated_at
            };
        });
    }

    return {
        group: { ...group, members, total_minutes },
        documents
    };
};

export const resetGroupTime = async (id) => {
    const group = await prisma.group.findUnique({
        where: { id: parseInt(id) }
    });

    if (!group) {
        throw new NotFoundError('Group not found');
    }

    // Delete all work logs associated with this group's name
    await prisma.documentWorkLog.deleteMany({
        where: { group_name: group.name }
    });

    return true;
};
