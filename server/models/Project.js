import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['planning', 'active', 'completed', 'on-hold'], default: 'planning' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    progress: { type: Number, default: 0 },
    startDate: { type: Date },
    deadline: { type: Date },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
}, { timestamps: true });

// Add compound index for dashboard status filtering
projectSchema.index({ teamMembers: 1, status: 1 });

// Virtual to populate tasks if needed, though we might query tasks separately
projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
});

projectSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});
projectSchema.set('toObject', { virtuals: true });

export default mongoose.model('Project', projectSchema);
