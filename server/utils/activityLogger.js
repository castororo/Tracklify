import Activity from '../models/Activity.js';

/**
 * Log a user activity
 * @param {string} userId - ID of the user performing the action
 * @param {string} type - Type of activity (enum: 'task_completed', 'project_created', 'member_added', 'status_changed', 'comment_added')
 * @param {string} message - Descriptive message
 * @param {string} [projectId] - Optional Project ID associated with the activity
 */
export const logActivity = async (userId, type, message, projectId = null) => {
    try {
        const activity = new Activity({
            user: userId,
            type,
            message,
            project: projectId
        });
        await activity.save();
    } catch (err) {
        console.error('Failed to log activity:', err);
        // We do not throw here to prevent blocking the main operation
    }
};
