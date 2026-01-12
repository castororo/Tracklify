import express from 'express';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/activityLogger.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas.js';
import AppError from '../utils/AppError.js';

const router = express.Router();


// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, validate(createTaskSchema), async (req, res, next) => {
    try {
        const { projectId, ...taskData } = req.body;

        // Security: Verify user is a member of the project
        const project = await Project.findById(projectId);
        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
        if (!isMember) {
            return next(new AppError('Not authorized to create tasks in this project', 403));
        }

        const newTask = new Task({
            ...taskData,
            project: projectId
        });
        const task = await newTask.save();

        // Log Activity (Task Created) - Mapped to 'status_changed' as generic 'task created' isn't in enum, 
        // OR use 'status_changed' with "Created task". 
        // Actually, Activity.js enum lacks 'task_created'. 
        // I'll use 'status_changed' for now or 'comment_added' is wrong.
        // Wait, let's check enum: ['task_completed', 'project_created', 'member_added', 'status_changed', 'comment_added']
        // I'll use 'status_changed' with "Created task".
        await logActivity(req.user.id, 'status_changed', `Created task "${task.title}"`, projectId);

        res.json(task);
    } catch (err) {
        next(err);
    }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, validate(updateTaskSchema), async (req, res, next) => {
    try {
        console.log(`[DEBUG] Updating task ${req.params.id}`);
        console.log(`[DEBUG] Payload:`, req.body);
        console.log(`[DEBUG] User:`, req.user.id);

        let task = await Task.findById(req.params.id);
        if (!task) {
            console.log('[DEBUG] Task not found');
            return next(new AppError('Task not found', 404));
        }

        // Security: Check project membership via the task's project
        // Note: This requires an extra DB call to check the project.
        const project = await Project.findById(task.project);
        if (project) {
            const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
            if (!isMember) {
                return next(new AppError('Not authorized to update this task', 403));
            }
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        // Log Activity
        if (req.body.status === 'done') {
            await logActivity(req.user.id, 'task_completed', `Completed task "${task.title}"`, task.project);
        } else if (req.body.status) {
            await logActivity(req.user.id, 'status_changed', `Task "${task.title}" is now ${req.body.status}`, task.project);
        }

        res.json(task);
    } catch (err) {
        next(err);
    }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (project) {
            const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
            if (!isMember) {
                return next(new AppError('Not authorized to delete this task', 403));
            }
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (err) {
        next(err);
    }
});

// @route   GET api/tasks/:id/comments
// @desc    Get comments for a task
// @access  Private
router.get('/:id/comments', auth, async (req, res, next) => {
    try {
        const comments = await Comment.find({ task: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        next(err);
    }
});

export default router;
