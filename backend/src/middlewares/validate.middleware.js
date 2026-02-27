import { BadRequestError } from '../utils/errors.js';

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        // Extract readable errors from ZodError
        let errors;
        try {
            errors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
        } catch {
            errors = [{ field: 'unknown', message: result.error?.message || 'Validation failed' }];
        }
        return next(new BadRequestError('Validation failed', errors));
    }

    // Replace req.body with validated and sanitized data
    if (result.data?.body) req.body = result.data.body;

    next();
};

