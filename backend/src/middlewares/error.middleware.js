import { sendError } from '../utils/responses.js';
import config from '../config/env.js';

export const globalErrorHandler = (err, req, res, next) => {
    if (config.nodeEnv === 'development') {
        console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    // Don't leak stack traces to client in production
    const errors = err.errors || (config.nodeEnv === 'development' && !err.isOperational ? { stack: err.stack } : null);

    sendError(res, statusCode, message, errors);
};
