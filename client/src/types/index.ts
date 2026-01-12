// Core Types for Tracklify

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface TeamMember extends User {
  tasksAssigned: number;
  tasksCompleted: number;
  workload: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'bug' | 'feature' | 'task' | 'improvement' | 'other';
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  assignee?: TeamMember | string;
  projectId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startDate?: string;
  deadline: string;
  lead?: User;
  createdAt: string;
  updatedAt: string;
  teamMembers: string[];
  tasks: Task[];
}

export interface Activity {
  id: string;
  type: 'task_completed' | 'project_created' | 'member_added' | 'status_changed' | 'comment_added';
  message: string;
  userId: string;
  user?: User;
  projectId?: string;
  project?: Project;
  timestamp: string;
  isRead?: boolean;
}

export interface AnalyticsData {
  weeklyProductivity: {
    week: string;
    tasksCompleted: number;
    tasksCreated: number;
  }[];
  projectCompletion: {
    name: string;
    value: number;
    color: string;
  }[];
  teamWorkload: {
    name: string;
    tasks: number;
    completed: number;
  }[];
  monthlyTrends: {
    month: string;
    projects: number;
    tasks: number;
  }[];
}

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  teamMembers: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
}
