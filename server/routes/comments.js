import express from 'express';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/activityLogger.js';
import { auth } from '../middleware/auth.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// @route   POST api/comments
// @desc    Add a comment to a task
// @access  Private
router.post('/', auth, async (req, res, next) => {
    try {
        const { content, taskId } = req.body;

        if (!content || !taskId) {
            return next(new AppError('Content and Task ID are required', 400));
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (project) {
            const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
            if (!isMember) {
                return next(new AppError('Not authorized to comment on this task', 403));
            }
        }

        const newComment = new Comment({
            content,
            task: taskId,
            user: req.user.id
        });

        const comment = await newComment.save();

        // Populate user for immediate display
        await comment.populate('user', 'name avatar');

        // Log Activity
        await logActivity(req.user.id, 'comment_added', `Commented on task "${task.title}"`, task.project);

        res.json(comment);
    } catch (err) {
        next(err);
    }
});

export default router;
