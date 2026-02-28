import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Konversi hash PHP Laravel ($2y$) ke format Node.js bcryptjs ($2a$)
    // Keduanya secara algoritma identik, bcryptjs hanya memvalidasi prefix secara ketat
    const hashToCompare = user.password.replace(/^\$2y\$/, '$2a$');

    if (!(await bcrypt.compare(password, hashToCompare))) {
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
