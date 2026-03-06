import * as userService from '../services/user.service.js';
import * as userRepository from '../repositories/user.repository.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';
import bcrypt from 'bcryptjs';

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

export const updateProfile = catchAsync(async (req, res) => {
    // Only allow updating password or certain non-role fields
    const { currentPassword, password } = req.body;
    let updateData = {};

    if (password) {
        if (!currentPassword) {
            return res.status(400).json({ success: false, message: 'Password saat ini diperlukan' });
        }

        const userRec = await userRepository.findById(req.user.id);
        if (!userRec) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const hashToCompare = userRec.password.replace(/^\$2y\$/, '$2a$');
        if (!(await bcrypt.compare(currentPassword, hashToCompare))) {
            return res.status(400).json({ success: false, message: 'Password saat ini salah' });
        }

        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const user = await userService.updateUser(req.user.id, updateData);
    return sendSuccess(res, 200, 'Profile updated successfully', { user });
});

export const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User deleted successfully');
});
