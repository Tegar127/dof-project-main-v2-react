import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};
