import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/v1/auth/google/callback',
                proxy: true
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // 1. Check if user exists with googleId
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        return done(null, user);
                    }

                    // 2. Check if user exists with email (Link account)
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        user.googleId = profile.id;
                        if (!user.avatar) user.avatar = profile.photos[0].value;
                        await user.save();
                        return done(null, user);
                    }

                    // 3. Create new user
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        avatar: profile.photos[0].value,
                        role: 'member'
                    });
                    await user.save();
                    done(null, user);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );
};

export default configurePassport;
