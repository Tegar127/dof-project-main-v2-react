import * as groupRepository from '../repositories/group.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

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

    // document_work_logs table not in current schema, return empty
    return {
        group: { ...group, members, total_minutes },
        documents: []
    };
};
