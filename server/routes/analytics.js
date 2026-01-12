import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// @route   GET api/analytics/dashboard
// @desc    Get dashboard stats
// @access  Private
router.get('/dashboard', auth, async (req, res, next) => {
    try {
        console.log('Analytics Dashboard Request for user:', req.user.id);
        const activeProjects = await Project.countDocuments({
            $or: [{ lead: req.user.id }, { teamMembers: req.user.id }],
            status: 'active'
        });
        const completedProjects = await Project.countDocuments({
            $or: [{ lead: req.user.id }, { teamMembers: req.user.id }],
            status: 'completed'
        });
        const pendingTasks = await Task.countDocuments({
            assignee: req.user.id,
            status: { $ne: 'done' }
        });
        // Count unique team members across user's projects (simplified for now to just all users, or better 0 if not implemented)
        // For now, let's keep it global or maybe just count users in shared projects.
        // Let's count global users for "Community" feel or just 1 (self).
        // A better query finding all unique users in projects I'm in:
        const teamMembers = await User.countDocuments(); // Keep global for now or change if requested.

        res.json({
            activeProjects,
            completedProjects,
            pendingTasks,
            teamMembers,
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET api/analytics
// @desc    Get full analytics data
// @access  Private
router.get('/', auth, async (req, res, next) => {
    try {
        // 1. Weekly Productivity (Tasks completed in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const productivityStats = await Task.aggregate([
            {
                $match: {
                    status: 'done',
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$updatedAt' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const createdStats = await Task.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        // Map aggregation results to ordered week format
        const weeklyProductivity = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayOfWeek = date.getDay() + 1; // MongoDB is 1-based (Sun=1)

            const completedStat = productivityStats.find(s => s._id === dayOfWeek);
            const createdStat = createdStats.find(s => s._id === dayOfWeek);

            return {
                day: days[date.getDay()],
                tasksCompleted: completedStat ? completedStat.count : 0,
                tasksCreated: createdStat ? createdStat.count : 0
            };
        });

        // 2. Project Completion Stats
        const projectStats = await Project.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const projectCompletion = [
            {
                name: 'Completed',
                value: projectStats.find(s => s._id === 'completed')?.count || 0,
                color: 'hsl(var(--success))'
            },
            {
                name: 'Active',
                value: projectStats.find(s => s._id === 'active')?.count || 0,
                color: 'hsl(var(--primary))'
            },
            {
                name: 'On Hold',
                value: projectStats.find(s => s._id === 'on-hold')?.count || 0,
                color: 'hsl(var(--warning))'
            },
        ];

        res.json({
            weeklyProductivity,
            projectCompletion,
            teamWorkload: [], // Placeholder for future feature
            monthlyTrends: [], // Placeholder for future feature
        });
    } catch (err) {
        next(err);
    }
});

export default router;
