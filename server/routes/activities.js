import express from 'express';
import Activity from '../models/Activity.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/activities
// @desc    Get recent activities
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = await Activity.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('user', 'name avatar')
            .populate('project', 'name');

        // Transform to add isRead flag for the frontend
        const result = activities.map(activity => ({
            ...activity.toObject(),
            isRead: activity.readBy && activity.readBy.some(id => id.toString() === req.user.id.toString())
        }));

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/activities
// @desc    Create an activity
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newActivity = new Activity({
            ...req.body,
            user: req.user.id
        });
        const activity = await newActivity.save();
        res.json(activity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/activities/mark-read
// @desc    Mark activities as read for current user
// @access  Private
router.put('/mark-read', auth, async (req, res) => {
    try {
        await Activity.updateMany(
            { readBy: { $ne: req.user.id } }, // Find all not read by me
            { $addToSet: { readBy: req.user.id } } // Add me to readBy
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
