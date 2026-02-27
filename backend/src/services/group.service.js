import * as groupRepository from '../repositories/group.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import db from '../config/database.js';

export const getAllGroups = async (user) => {
    const groups = await groupRepository.findAll(user);

    // Attach total_minutes
    const groupsWithDetails = await Promise.all(groups.map(async (group) => {
        const total_minutes = await groupRepository.getGroupTotalWorkLogDuration(group.name);
        return {
            ...group,
            total_minutes
        };
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
    if (existingGroup) {
        throw new BadRequestError('Group name already exists');
    }

    const { invited_users, ...groupData } = data;
    groupData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    groupData.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
        if (existingGroup) {
            throw new BadRequestError('Group name already exists');
        }
    }

    updateData.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

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

    // Stats Logic: aggregate document work logs for this group
    let logs = [];
    try {
        logs = await db('document_work_logs')
            .where('group_name', group.name)
            .join('documents', 'document_work_logs.document_id', 'documents.id')
            .select(
                'documents.id',
                'documents.title',
                'documents.type',
                'documents.status',
                'document_work_logs.duration_minutes',
                'document_work_logs.end_time'
            );
    } catch {
        // Table may not exist yet
    }

    // Group by document ID
    const documentsMap = {};
    logs.forEach(log => {
        if (!documentsMap[log.id]) {
            documentsMap[log.id] = {
                id: log.id,
                title: log.title,
                type: log.type,
                status: log.status,
                total_minutes: 0,
                last_worked: log.end_time
            };
        }
        documentsMap[log.id].total_minutes += log.duration_minutes || 0;
        if (new Date(log.end_time) > new Date(documentsMap[log.id].last_worked)) {
            documentsMap[log.id].last_worked = log.end_time;
        }
    });

    return {
        group: { ...group, members, total_minutes },
        documents: Object.values(documentsMap)
    };
};
