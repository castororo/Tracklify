import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/search
// @desc    Search projects and users
// @access  Private
router.get('/', auth, async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.json({ projects: [], members: [] });
        }

        const query = q.toString();
        const regex = new RegExp(query, 'i'); // Case-insensitive search

        // Search Projects:
        // 1. Matches name or description
        // 2. AND is accessible by the user (Team Member)
        const projects = await Project.find({
            $and: [
                {
                    $or: [
                        { name: regex },
                        { description: regex }
                    ]
                },
                { teamMembers: req.user.id } // Security: Only my projects
            ]
        }).select('name description status priority deadline');

        // Search Users:
        // Search by name or email
        // For now, allow searching all users (Directory style) to facilitate invites
        const members = await User.find({
            $or: [
                { name: regex },
                { email: regex }
            ]
        }).select('name email role avatar');

        res.json({ projects, members });
    } catch (err) {
        next(err);
    }
});

export default router;
