import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// @route   GET api/team
// @desc    Get all team members
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/team/:id
// @desc    Get team member by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/team/invite
// @desc    Invite a member (Simulated)
// @access  Private (Admin only - TODO)
router.post('/invite', auth, async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/register?email=${encodeURIComponent(email)}`;

        try {
            await sendEmail({
                email: email,
                subject: 'You have been invited to join Tracklify',
                html: `
                    <h1>Join the Team on Tracklify</h1>
                    <p>You have been invited to collaborate on Tracklify.</p>
                    <p>Click the link below to create your account and get started:</p>
                    <a href="${inviteUrl}" clicktracking=off>${inviteUrl}</a>
                    <p>If you didn't expect this invitation, please ignore this email.</p>
                `
            });
            res.json({ message: `Invitation sent to ${email}` });
        } catch (err) {
            console.error('Email send error:', err);
            return res.status(500).json({ message: 'Failed to send invitation email' });
        }
    } catch (err) {
        next(err);
    }
});

// @route   PUT api/team/:id/role
// @desc    Update member role
// @access  Private
router.put('/:id/role', auth, async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
});

// @route   DELETE api/team/:id
// @desc    Remove member
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ message: 'User removed from team' });
    } catch (err) {
        next(err);
    }
});

export default router;
