import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/user.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const getAllUsers = async () => {
    const users = await userRepository.findAll();

    // Attach extra groups and total work log
    // N+1 problem here, but for manageable user base it is acceptable as a direct translation
    const usersWithExtras = await Promise.all(users.map(async (user) => {
        delete user.password;
        const groups = await userRepository.getUserGroups(user.id);
        const work_logs_sum_duration_minutes = await userRepository.getUserTotalWorkLogDuration(user.id);

        return {
            ...user,
            groups,
            work_logs_sum_duration_minutes
        };
    }));

    return usersWithExtras;
};

export const getUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    delete user.password;
    const groups = await userRepository.getUserGroups(user.id);

    return {
        ...user,
        groups
    };
};

export const createUser = async (data) => {
    // Check email
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
        throw new BadRequestError('Email already exists');
    }

    const { extra_groups, ...userData } = data;

    // Hash password — created_at/updated_at handled by Prisma @default/@updatedAt
    userData.password = await bcrypt.hash(userData.password, 10);

    const userId = await userRepository.create(userData);

    if (extra_groups && extra_groups.length > 0) {
        await userRepository.syncGroups(userId, extra_groups);
    }

    return await getUserById(userId);
};

export const updateUser = async (id, data) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const { extra_groups, ...updateData } = data;

    if (updateData.email && updateData.email !== user.email) {
        const existingUser = await userRepository.findByEmail(updateData.email);
        if (existingUser) {
            throw new BadRequestError('Email already exists');
        }
    }

    if (updateData.password) {
        const bcryptHashRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
        if (!bcryptHashRegex.test(updateData.password)) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
    }

    // updated_at handled automatically by Prisma @updatedAt
    await userRepository.update(id, updateData);

    // Sync groups only if extra_groups is present in request
    if (extra_groups !== undefined) {
        await userRepository.syncGroups(id, extra_groups);
    }

    return await getUserById(id);
};

export const deleteUser = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    await userRepository.destroy(id);
    return true;
};
