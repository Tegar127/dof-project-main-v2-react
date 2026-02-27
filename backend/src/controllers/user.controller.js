import * as userService from '../services/user.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    // Matching Laravel format which directly returns JSON array for index, or keep it wrapped.
    // We'll return it directly to match `return response()->json($users);` in Laravel
    return res.status(200).json(users);
});

export const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, 201, 'User created successfully', { user });
});

export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    // Match `return response()->json($user->load('groups'));`
    return res.status(200).json(user);
});

export const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 200, 'User updated successfully', { user });
});

export const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User deleted successfully');
});
