import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/sendEmail.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return next(new AppError('User already exists', 400));
        }

        user = new User({
            name,
            email,
            password,
            verificationToken: crypto.randomBytes(20).toString('hex'),
            isVerified: false // Explicitly set to false
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        await user.save();

        // Send verification email
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${user.verificationToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your email for Tracklify',
                html: `
                    <h1>Welcome to Tracklify!</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });

            res.json({ message: 'Registration successful. Please check your email to verify your account.' });
        } catch (err) {
            await User.findByIdAndDelete(user._id); // Rollback user creation
            return next(new AppError('Email could not be sent', 500));
        }
    } catch (err) {
        next(err);
    }
});

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public


router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('Invalid credentials', 400));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError('Invalid credentials', 400));
        }

        // Check verification
        if (!user.isVerified) {
            return next(new AppError('Please verify your email address before logging in', 401));
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 36000 },
            (err, token) => {
                if (err) throw err;
                res
                    .cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 36000000 // 10 hours
                    })
                    .json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
            }
        );
    } catch (err) {
        next(err);
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
// @access  Private

router.put('/profile', auth, async (req, res) => {
    const { name, email } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;

    try {
        let user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        );

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', auth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new AppError('Please provide both current and new passwords', 400));
        }

        const user = await User.findById(req.user.id);

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Invalid current password', 401));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Optional: Re-issue token to invalidate old ones (basic implementation keeps same token valid for now)
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
});

// @route   POST api/auth/logout
// @desc    Clear auth cookie
// @access  Public
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Logged out' });
});

// @route   GET api/auth/me
// @desc    Get current user (Session Check)
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/forgot-password
// @desc    Forgot Password (Simulated Email)
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next(new AppError('There is no user with that email', 404));
        }

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>You requested a password reset. Please click the link below to reset your password:</p>
                    <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
                    <p>This link will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
            res.json({ message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return next(new AppError('Email could not be sent', 500));
        }
    } catch (err) {
        next(err);
    }
});

// @route   PUT api/auth/reset-password/:resetToken
// @desc    Reset Password
// @access  Public
router.put('/reset-password/:resetToken', async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Invalid token', 400));
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // Clear fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Log user in automatically (optional, but requested flow described 'Log in with new password', so maybe just return success)
        // Let's just return success so they can login cleanly.
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
});

// @route   GET api/auth/google
// @desc    Google Auth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback
// @desc    Google Auth Callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
    (req, res) => {
        // Successful authentication
        const payload = {
            user: {
                id: req.user.id
            }
        };

        // Generate Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;

                // Set Cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 360000000 // 100 hours
                });

                // Redirect to Dashboard
                res.redirect(`${process.env.CLIENT_URL}/dashboard`);
            }
        );
    }
);

// @route   GET api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res, next) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return next(new AppError('Invalid or expired token', 400));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;
