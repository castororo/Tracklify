import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Activity from './models/Activity.js';

// Load env vars
dotenv.config();

// Mock Data (Adapted for DB)
const seedUsers = [
    { name: 'Alex Johnson', email: 'alex@tracklify.com', password: 'password123', role: 'admin' },
    { name: 'Sarah Chen', email: 'sarah@tracklify.com', password: 'password123', role: 'member' },
    { name: 'Mike Williams', email: 'mike@tracklify.com', password: 'password123', role: 'member' },
];

const seedProjects = [
    { name: 'E-commerce Platform', description: 'Full-stack solution', status: 'active', priority: 'high', deadline: new Date('2025-01-31') },
    { name: 'Mobile Banking App', description: 'iOS and Android app', status: 'active', priority: 'high', deadline: new Date('2025-03-15') },
    { name: 'CRM Dashboard', description: 'Customer management', status: 'on-hold', priority: 'medium', deadline: new Date('2025-02-28') },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Activity.deleteMany({});
        console.log('Data Cleared...');

        // Insert Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany(seedUsers.map(u => ({ ...u, password: hashedPassword })));
        console.log(`Imported ${users.length} Users...`);

        // Insert Projects
        const projects = await Project.insertMany(seedProjects.map(p => ({ ...p, teamMembers: [users[0]._id, users[1]._id] })));
        console.log(`Imported ${projects.length} Projects...`);

        // Insert Tasks
        const tasks = await Task.insertMany([
            { title: 'Design Homepage', status: 'completed', priority: 'high', project: projects[0]._id, assignee: users[0]._id },
            { title: 'Setup API', status: 'in-progress', priority: 'high', project: projects[0]._id, assignee: users[1]._id },
            { title: 'Database Schema', status: 'todo', priority: 'medium', project: projects[1]._id, assignee: users[2]._id },
        ]);
        console.log(`Imported ${tasks.length} Tasks...`);

        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
