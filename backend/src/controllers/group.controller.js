import * as groupService from '../services/group.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getAllGroups = catchAsync(async (req, res) => {
    const groups = await groupService.getAllGroups(req.user);
    return res.status(200).json(groups);
});

export const getGroup = catchAsync(async (req, res) => {
    const group = await groupService.getGroupById(req.params.id);
    return res.status(200).json(group);
});

export const createGroup = catchAsync(async (req, res) => {
    const group = await groupService.createGroup(req.body);
    return sendSuccess(res, 201, 'Group created successfully', { group });
});

export const updateGroup = catchAsync(async (req, res) => {
    const group = await groupService.updateGroup(req.params.id, req.body);
    return sendSuccess(res, 200, 'Group updated successfully', { group });
});

export const deleteGroup = catchAsync(async (req, res) => {
    await groupService.deleteGroup(req.params.id);
    return sendSuccess(res, 200, 'Group deleted successfully');
});

export const getGroupStats = catchAsync(async (req, res) => {
    const stats = await groupService.getGroupStats(req.params.id);
    return res.status(200).json(stats);
});
