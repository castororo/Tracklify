import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['task_completed', 'project_created', 'member_added', 'status_changed', 'comment_added'],
        required: true
    },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    timestamp: { type: Date, default: Date.now },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('Activity', activitySchema);
