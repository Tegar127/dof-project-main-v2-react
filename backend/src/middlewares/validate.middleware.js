import { ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export const validate = (schema) => (req, res, next) => {
    try {
        const validData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Replace req.body with validated and sanitized data
        // Note: req.query and req.params are read-only in Express 5
        if (validData.body) req.body = validData.body;

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            next(new BadRequestError('Validation failed', errors));
        } else {
            next(error);
        }
    }
};
