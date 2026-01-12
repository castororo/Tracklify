import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Project name is required'),
        description: z.string().optional(),
        status: z.enum(['active', 'completed', 'on-hold']).optional(),
        deadline: z.string().datetime({ offset: true }).optional().or(z.string().optional()), // Allow ISO string
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['active', 'completed', 'on-hold']).optional(),
        deadline: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
    }),
});
