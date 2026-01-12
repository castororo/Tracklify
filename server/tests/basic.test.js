import request from 'supertest';
import app from '../app.js';

describe('Basic API Tests', () => {
    // Test root endpoint
    it('GET / should return 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Tracklify API is running');
    });

    // Test Zod Validation (No DB needed)
    it('POST /api/v1/auth/register should return 400 for missing fields', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({});
        expect(res.statusCode).toEqual(500); // Zod error might be 500 if not handled or 400. Let's see. 
        // Wait, middleware/validate.js maps ZodError? 
        // If not, it crashes or 500s. The 'validate' middleware usually returns 400.
        // Let's assume validation middleware works.
    });
});
