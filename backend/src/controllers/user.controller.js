import * as userService from '../services/user.service.js';
import * as userRepository from '../repositories/user.repository.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
});

export const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, 201, 'User created successfully', { user });
});

export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(user);
});

export const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 200, 'User updated successfully', { user });
});

export const updateProfile = catchAsync(async (req, res) => {
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

/**
 * GET /api/users/available-groups
 *
 * Returns the list of groups the current user is ALLOWED to send a document to,
 * based on jabatan (position):
 *  - Admin / Kadiv → all groups
 *  - Staff / Kabid  → only their own group
 */
export const getAvailableGroups = catchAsync(async (req, res) => {
    const { getAllowedGroupNames } = await import('../utils/roleUtils.js');
    const prisma = (await import('../config/database.js')).default;

    const allGroups = await prisma.group.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    });

    const allowedNames = getAllowedGroupNames(req.user, allGroups.map(g => g.name));
    const filtered = allGroups.filter(g => allowedNames.includes(g.name));

    return res.status(200).json(filtered);
});
