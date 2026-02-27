import * as authService from '../services/auth.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return sendSuccess(res, 200, 'Login successful', result);
});

export const logout = catchAsync(async (req, res) => {
    // Extract token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    await authService.logout(token);

    return sendSuccess(res, 200, 'Logged out successfully');
});

export const user = catchAsync(async (req, res) => {
    // req.user is populated by the requireAuth middleware
    const { password, ...safeUser } = req.user;
    return res.status(200).json(safeUser);
});
