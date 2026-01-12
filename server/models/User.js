import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    googleId: { type: String, sparse: true, unique: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    },
    toObject: { virtuals: true }
});

export default mongoose.model('User', userSchema);
