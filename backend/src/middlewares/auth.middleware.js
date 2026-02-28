import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import prisma from '../config/database.js';

export const requireAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return next(new UnauthorizedError('Invalid token or token expired. Please log in again.'));
        }

        const user = await prisma.user.findUnique({ where: { id: Number(decoded.id) } });

        if (!user) {
            return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new UnauthorizedError('You do not have permission to perform this action'));
        }
        next();
    };
};
