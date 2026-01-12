import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Task title is required'),
        description: z.string().optional(),
        status: z.enum(['todo', 'in-progress', 'done']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        projectId: z.string().min(1, 'Project ID is required'), // Basic check, MongoDB ID check can be stricter if needed
        dueDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
        assignee: z.string().optional().nullable(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in-progress', 'done', 'completed']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        projectId: z.string().optional(),
        dueDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
        assignee: z.string().optional().nullable(),
    }),
});
