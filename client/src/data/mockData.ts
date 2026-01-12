import { User, TeamMember, Project, Task, Activity, AnalyticsData, DashboardStats, Comment } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@tracklify.com', avatar: '', role: 'admin', createdAt: '2024-01-15' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@tracklify.com', avatar: '', role: 'member', createdAt: '2024-02-01' },
  { id: '3', name: 'Mike Williams', email: 'mike@tracklify.com', avatar: '', role: 'member', createdAt: '2024-02-10' },
  { id: '4', name: 'Emily Davis', email: 'emily@tracklify.com', avatar: '', role: 'member', createdAt: '2024-03-01' },
  { id: '5', name: 'James Wilson', email: 'james@tracklify.com', avatar: '', role: 'admin', createdAt: '2024-03-15' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@tracklify.com', avatar: '', role: 'member', createdAt: '2024-04-01' },
];

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  { ...mockUsers[0], tasksAssigned: 12, tasksCompleted: 8, workload: 'high' },
  { ...mockUsers[1], tasksAssigned: 8, tasksCompleted: 6, workload: 'medium' },
  { ...mockUsers[2], tasksAssigned: 5, tasksCompleted: 4, workload: 'low' },
  { ...mockUsers[3], tasksAssigned: 10, tasksCompleted: 7, workload: 'high' },
  { ...mockUsers[4], tasksAssigned: 6, tasksCompleted: 5, workload: 'medium' },
  { ...mockUsers[5], tasksAssigned: 4, tasksCompleted: 3, workload: 'low' },
];

// Mock Tasks
export const mockTasks: Task[] = [
  { id: 't1', title: 'Design homepage mockups', description: 'Create wireframes and high-fidelity mockups', status: 'done', priority: 'high', type: 'task', assigneeId: '1', projectId: 'p1', dueDate: '2024-12-20', createdAt: '2024-12-01', updatedAt: '2024-12-18' },
  { id: 't2', title: 'Implement user authentication', description: 'Set up login and registration flows', status: 'in-progress', priority: 'high', type: 'feature', assigneeId: '2', projectId: 'p1', dueDate: '2024-12-25', createdAt: '2024-12-05', updatedAt: '2024-12-20' },
  { id: 't3', title: 'Write API documentation', description: 'Document all REST endpoints', status: 'todo', priority: 'medium', type: 'task', assigneeId: '3', projectId: 'p1', dueDate: '2024-12-30', createdAt: '2024-12-10', updatedAt: '2024-12-10' },
  { id: 't4', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for deployment', status: 'done', priority: 'high', type: 'task', assigneeId: '4', projectId: 'p2', dueDate: '2024-12-15', createdAt: '2024-12-01', updatedAt: '2024-12-14' },
  { id: 't5', title: 'Database optimization', description: 'Optimize queries and add indexes', status: 'in-progress', priority: 'medium', type: 'improvement', assigneeId: '5', projectId: 'p2', dueDate: '2024-12-28', createdAt: '2024-12-08', updatedAt: '2024-12-19' },
  { id: 't6', title: 'Mobile responsive design', description: 'Ensure all pages work on mobile', status: 'todo', priority: 'high', type: 'feature', assigneeId: '1', projectId: 'p3', dueDate: '2025-01-05', createdAt: '2024-12-15', updatedAt: '2024-12-15' },
  { id: 't7', title: 'User testing sessions', description: 'Conduct usability tests with 5 users', status: 'todo', priority: 'medium', type: 'task', assigneeId: '2', projectId: 'p3', dueDate: '2025-01-10', createdAt: '2024-12-18', updatedAt: '2024-12-18' },
  { id: 't8', title: 'Performance audit', description: 'Run Lighthouse and fix issues', status: 'done', priority: 'low', type: 'improvement', assigneeId: '6', projectId: 'p4', dueDate: '2024-12-12', createdAt: '2024-12-01', updatedAt: '2024-12-11' },
  { id: 't9', title: 'Security review', description: 'Audit for vulnerabilities', status: 'in-progress', priority: 'high', type: 'task', assigneeId: '3', projectId: 'p4', dueDate: '2024-12-22', createdAt: '2024-12-10', updatedAt: '2024-12-20' },
  { id: 't10', title: 'Create marketing assets', description: 'Design social media graphics', status: 'todo', priority: 'low', type: 'task', assigneeId: '4', projectId: 'p5', dueDate: '2025-01-15', createdAt: '2024-12-20', updatedAt: '2024-12-20' },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    status: 'active',
    priority: 'high',
    progress: 65,
    deadline: '2025-01-31',
    createdAt: '2024-10-01',
    updatedAt: '2024-12-20',
    teamMembers: ['1', '2', '3'],
    tasks: mockTasks.filter(t => t.projectId === 'p1'),
  },
  {
    id: 'p2',
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application for iOS and Android',
    status: 'active',
    priority: 'high',
    progress: 40,
    deadline: '2025-03-15',
    createdAt: '2024-11-01',
    updatedAt: '2024-12-19',
    teamMembers: ['4', '5'],
    tasks: mockTasks.filter(t => t.projectId === 'p2'),
  },
  {
    id: 'p3',
    name: 'CRM Dashboard',
    description: 'Customer relationship management dashboard',
    status: 'active',
    priority: 'medium',
    progress: 25,
    deadline: '2025-02-28',
    createdAt: '2024-11-15',
    updatedAt: '2024-12-18',
    teamMembers: ['1', '2'],
    tasks: mockTasks.filter(t => t.projectId === 'p3'),
  },
  {
    id: 'p4',
    name: 'Healthcare Portal',
    description: 'Patient management and appointment scheduling system',
    status: 'completed',
    priority: 'high',
    progress: 100,
    deadline: '2024-12-15',
    createdAt: '2024-08-01',
    updatedAt: '2024-12-15',
    teamMembers: ['3', '6'],
    tasks: mockTasks.filter(t => t.projectId === 'p4'),
  },
  {
    id: 'p5',
    name: 'Marketing Website',
    description: 'Company marketing website redesign',
    status: 'on-hold',
    priority: 'low',
    progress: 15,
    deadline: '2025-04-01',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-20',
    teamMembers: ['4'],
    tasks: mockTasks.filter(t => t.projectId === 'p5'),
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  { id: 'a1', type: 'task_completed', message: 'completed "Design homepage mockups"', userId: '1', projectId: 'p1', timestamp: '2024-12-20T14:30:00Z' },
  { id: 'a2', type: 'status_changed', message: 'changed status of "Implement user authentication" to In Progress', userId: '2', projectId: 'p1', timestamp: '2024-12-20T12:15:00Z' },
  { id: 'a3', type: 'member_added', message: 'was added to E-commerce Platform', userId: '3', projectId: 'p1', timestamp: '2024-12-19T16:45:00Z' },
  { id: 'a4', type: 'project_created', message: 'created new project "Marketing Website"', userId: '5', projectId: 'p5', timestamp: '2024-12-18T09:00:00Z' },
  { id: 'a5', type: 'task_completed', message: 'completed "Set up CI/CD pipeline"', userId: '4', projectId: 'p2', timestamp: '2024-12-17T17:20:00Z' },
  { id: 'a6', type: 'comment_added', message: 'commented on "Database optimization"', userId: '5', projectId: 'p2', timestamp: '2024-12-17T11:30:00Z' },
  { id: 'a7', type: 'task_completed', message: 'completed "Performance audit"', userId: '6', projectId: 'p4', timestamp: '2024-12-16T15:00:00Z' },
  { id: 'a8', type: 'status_changed', message: 'marked Healthcare Portal as Completed', userId: '3', projectId: 'p4', timestamp: '2024-12-15T18:00:00Z' },
];

// Mock Analytics Data
export const mockAnalytics: AnalyticsData = {
  weeklyProductivity: [
    { week: 'Week 1', tasksCompleted: 12, tasksCreated: 15 },
    { week: 'Week 2', tasksCompleted: 18, tasksCreated: 14 },
    { week: 'Week 3', tasksCompleted: 15, tasksCreated: 20 },
    { week: 'Week 4', tasksCompleted: 22, tasksCreated: 18 },
  ],
  projectCompletion: [
    { name: 'Completed', value: 25, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: 50, color: 'hsl(var(--primary))' },
    { name: 'On Hold', value: 15, color: 'hsl(var(--warning))' },
    { name: 'Not Started', value: 10, color: 'hsl(var(--muted))' },
  ],
  teamWorkload: [
    { name: 'Alex J.', tasks: 12, completed: 8 },
    { name: 'Sarah C.', tasks: 8, completed: 6 },
    { name: 'Mike W.', tasks: 5, completed: 4 },
    { name: 'Emily D.', tasks: 10, completed: 7 },
    { name: 'James W.', tasks: 6, completed: 5 },
    { name: 'Lisa A.', tasks: 4, completed: 3 },
  ],
  monthlyTrends: [
    { month: 'Jul', projects: 3, tasks: 25 },
    { month: 'Aug', projects: 4, tasks: 32 },
    { month: 'Sep', projects: 5, tasks: 45 },
    { month: 'Oct', projects: 6, tasks: 52 },
    { month: 'Nov', projects: 5, tasks: 48 },
    { month: 'Dec', projects: 5, tasks: 55 },
  ],
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  activeProjects: mockProjects.filter(p => p.status === 'active').length,
  completedProjects: mockProjects.filter(p => p.status === 'completed').length,
  pendingTasks: mockTasks.filter(t => t.status !== 'done').length,
  teamMembers: mockTeamMembers.length,
};

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => mockUsers.find(u => u.id === id);

// Helper function to get team member by ID
export const getTeamMemberById = (id: string): TeamMember | undefined => mockTeamMembers.find(m => m.id === id);

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'c1',
    content: 'Great progress on the homepage designs! I really like the color scheme.',
    taskId: 't1',
    userId: '2',
    user: mockUsers[1],
    createdAt: '2024-12-18T10:00:00Z'
  },
  {
    id: 'c2',
    content: 'Can we add a dark mode variant as well?',
    taskId: 't1',
    userId: '3',
    user: mockUsers[2],
    createdAt: '2024-12-18T11:30:00Z'
  },
  {
    id: 'c3',
    content: 'I will start working on the authentication logic tomorrow.',
    taskId: 't2',
    userId: '2',
    user: mockUsers[1],
    createdAt: '2024-12-06T09:15:00Z'
  }
];
