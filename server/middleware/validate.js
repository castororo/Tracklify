import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: err.errors.map(e => ({ path: e.path, message: e.message })),
            });
        }
        next(err);
    }
};
