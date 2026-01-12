import {
  mockProjects,
  mockTasks,
  mockTeamMembers,
  mockActivities,
  mockAnalytics,
  mockDashboardStats,
  mockUsers,
  mockComments
} from '@/data/mockData';
import { Project, Task, TeamMember, Activity, AnalyticsData, DashboardStats, User, Comment } from '@/types';

// API Base URL - change this to your Express server URL when running backend
// API Base URL - handle various VITE_API_URL formats (with/without slash, with/without /api/v1)
const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';
  // Remove trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // Remove /api/v1 if it's already there (to avoid duplication)
  if (url.endsWith('/api/v1')) {
    url = url.slice(0, -7);
  }
  return `${url}/api/v1`;
};
const API_BASE_URL = getApiBaseUrl();

// Use mock data by default (set to false when Express backend is running)
const USE_MOCK = false;

// Helper to get auth headers (Token is now handled via httpOnly cookie)
// Helper to get auth headers (Token is now handled via httpOnly cookie)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// ============== Auth API ==============
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      const user = mockUsers.find(u => u.email === email);
      if (user && password.length >= 6) {
        return { user, token: 'mock-jwt-token-' + Date.now() };
      }
      throw new Error('Invalid credentials');
    }
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  register: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        email,
        role: 'member',
        createdAt: new Date().toISOString(),
      };
      return { user: newUser, token: 'mock-jwt-token-' + Date.now() };
    }
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    // Return dummy data since we don't login anymore
    return { user: { id: '', name: '', email: '', role: 'member', createdAt: '' }, token: '' };
  },

  verifyEmail: async (token: string): Promise<void> => {
    if (USE_MOCK) return;
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`);
    if (!res.ok) throw new Error('Verification failed');
  },

  forgotPassword: async (email: string): Promise<void> => {
    if (USE_MOCK) {
      console.log(`Mock reset email sent to ${email}`);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to send reset email');
    }
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    if (USE_MOCK) {
      console.log('Mock password reset success');
      return;
    }
    const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      // Mock update logic could go here, but for now just return existing
      throw new Error('Not implemented in mock mode');
    }
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    if (USE_MOCK) {
      throw new Error('Not implemented in mock mode');
    }
    const res = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update password');
    }
  },

  getMe: async (): Promise<User> => {
    if (USE_MOCK) return mockUsers[0];
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to get user');
    return res.json();
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK) return;
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
};

// ============== Projects API ==============
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    if (USE_MOCK) return [...mockProjects];
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  getById: async (id: string): Promise<Project | undefined> => {
    if (USE_MOCK) return mockProjects.find(p => p.id === id);
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return undefined;
    return res.json();
  },

  create: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>): Promise<Project> => {
    if (USE_MOCK) {
      const newProject: Project = {
        ...project,
        id: 'p' + (mockProjects.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: [],
      };
      mockProjects.push(newProject);
      return newProject;
    }
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...updates, updatedAt: new Date().toISOString() };
        return mockProjects[index];
      }
      throw new Error('Project not found');
    }
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) mockProjects.splice(index, 1);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete project');
    }
  },
};

// ============== Tasks API ==============
export const tasksApi = {
  getByProject: async (projectId: string): Promise<Task[]> => {
    if (USE_MOCK) return mockTasks.filter(t => t.projectId === projectId);
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    if (USE_MOCK) {
      const newTask: Task = {
        ...task,
        id: 't' + (mockTasks.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return newTask;
    }
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    if (USE_MOCK) {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTasks[index] = { ...mockTasks[index], ...updates, updatedAt: new Date().toISOString() };
        return mockTasks[index];
      }
      throw new Error('Task not found');
    }
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index !== -1) mockTasks.splice(index, 1);
      return;
    }
    await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  },
};

// ============== Team API ==============
export const teamApi = {
  getAll: async (): Promise<TeamMember[]> => {
    if (USE_MOCK) return [...mockTeamMembers];
    const res = await fetch(`${API_BASE_URL}/team`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch team');
    return res.json();
  },

  getById: async (id: string): Promise<TeamMember | undefined> => {
    if (USE_MOCK) return mockTeamMembers.find(m => m.id === id);
    const res = await fetch(`${API_BASE_URL}/team/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return undefined;
    return res.json();
  },

  invite: async (email: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/team/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to invite member');
  },

  updateRole: async (id: string, role: 'admin' | 'member'): Promise<TeamMember> => {
    const res = await fetch(`${API_BASE_URL}/team/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to remove member');
  },
};

// ============== Analytics API ==============
export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK) return { ...mockDashboardStats };
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    if (USE_MOCK) return { ...mockAnalytics };
    const res = await fetch(`${API_BASE_URL}/analytics`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};

// ============== Activities API ==============
export const activitiesApi = {
  getRecent: async (limit = 10): Promise<Activity[]> => {
    if (USE_MOCK) {
      return mockActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }
    const res = await fetch(`${API_BASE_URL}/activities?limit=${limit}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },

  markRead: async (): Promise<void> => {
    if (USE_MOCK) return; // No-op in mock
    await fetch(`${API_BASE_URL}/activities/mark-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  },
};

// ============== Comments API ==============
export const commentsApi = {
  getByTask: async (taskId: string): Promise<Comment[]> => {
    if (USE_MOCK) return mockComments.filter(c => c.taskId === taskId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  create: async (data: { content: string, taskId: string, userId: string }): Promise<Comment> => {
    if (USE_MOCK) {
      const newComment: Comment = {
        id: 'c' + (mockComments.length + 1),
        content: data.content,
        taskId: data.taskId,
        userId: data.userId,
        user: mockUsers.find(u => u.id === data.userId)!,
        createdAt: new Date().toISOString(),
      };
      mockComments.push(newComment);
      return newComment;
    }
    const res = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  },
};

// ============== Search API ==============
export const searchApi = {
  search: async (query: string): Promise<{ projects: Project[], members: TeamMember[] }> => {
    if (!query) return { projects: [], members: [] };

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (USE_MOCK) {
      const lowerQuery = query.toLowerCase();
      const projects = mockProjects.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
      const members = mockTeamMembers.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.email.toLowerCase().includes(lowerQuery)
      );
      return { projects, members };
    }

    const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
  },
};
