import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { logActivity } from '../utils/activityLogger.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/projectSchemas.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// @route   GET api/projects
// @desc    Get all projects
// @access  Private
router.get('/', auth, async (req, res, next) => {
    try {
        // Security: Only return projects where the user is a team member
        const projects = await Project.find({ teamMembers: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        next(err);
    }
});

// @route   GET api/projects/:id/tasks
// @desc    Get tasks by project
// @access  Private
router.get('/:id/tasks', auth, async (req, res, next) => {
    try {
        const tasks = await Task.find({ project: req.params.id })
            .populate('assignee', 'name avatar email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id).populate('teamMembers', 'name avatar');
        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        // Security: Check if user is a member of this project
        // Convert ObjectIds to strings for comparison
        const isMember = project.teamMembers.some(member =>
            member._id.toString() === req.user.id || member.id === req.user.id
        );

        if (!isMember) {
            return next(new AppError('Not authorized to view this project', 403));
        }

        res.json(project);
    } catch (err) {
        next(err);
    }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post('/', auth, validate(createProjectSchema), async (req, res, next) => {
    try {
        const projectData = {
            ...req.body,
            // Ensure creator is added as a team member automatically if not present (optional, but good practice)
            // Assuming req.body.teamMembers is handled, or we enforce it here:
            teamMembers: req.body.teamMembers ? [...new Set([...req.body.teamMembers, req.user.id])] : [req.user.id]
        };

        const newProject = new Project(projectData);
        const project = await newProject.save();

        // Log Activity
        await logActivity(req.user.id, 'project_created', `Created project "${project.name}"`, project.id);

        res.json(project);
    } catch (err) {
        next(err);
    }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, validate(updateProjectSchema), async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        // Security: Check ownership/membership
        const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
        if (!isMember) {
            return next(new AppError('Not authorized to update this project', 403));
        }

        project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(project);
    } catch (err) {
        next(err);
    }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        // Security: Check ownership/membership
        const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
        if (!isMember) {
            return next(new AppError('Not authorized to delete this project', 403));
        }

        // Only allow if user is the LEAD (if lead exists)
        if (project.lead && project.lead.toString() !== req.user.id) {
            return next(new AppError('Not authorized to delete this project (Lead only)', 403));
        }

        // Delete all tasks associated with this project
        try {
            console.log(`[DEBUG] Deleting tasks for project ${req.params.id}`);
            await Task.deleteMany({ project: req.params.id });
            console.log(`[DEBUG] Tasks deleted`);
        } catch (taskErr) {
            console.error('[ERROR] Failed to delete project tasks:', taskErr);
            throw taskErr; // Re-throw to hit main catch block
        }

        await project.deleteOne();
        res.json({ message: 'Project and associated tasks removed' });
    } catch (err) {
        console.error('[ERROR] Project delete route failed:', err);
        next(err);
    }
});

export default router;
