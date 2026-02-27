import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    // Note: Laravel uses standard bcrypt out of the box, we use bcryptjs
    // They are compatible. We need to check password.
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Create JWT Token
    const token = generateToken({ id: user.id, role: user.role });

    // Strip password before sending to client
    const { password: _pw, ...safeUser } = user;

    return {
        user: safeUser,
        token
    };
};

export const logout = async (token) => {
    // In a stateless JWT implementation, logout is usually handled client-side
    // by deleting the token. If token invalidation is really needed,
    // we could implement a blacklist table here. For now, we return success.
    return true;
};
