import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'tracklify_token';
const AUTH_USER_KEY = 'tracklify_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount (via HttpOnly Cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await authApi.getMe();
        // Also sync with localStorage for user details persistence if needed, 
        // but source of truth is the API call success.
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        // If API fails (401), clear local user data
        localStorage.removeItem(AUTH_TOKEN_KEY); // Legacy cleanup
        localStorage.removeItem(AUTH_USER_KEY);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // Backend sets httpOnly cookie. Response contains user object.
      const { user } = await authApi.login(email, password);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      // No token handling needed here
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // Backend sets httpOnly cookie.
      const { user } = await authApi.register(name, email, password);
      // Auto-login after register (if backend sets cookie)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      // Update local storage and state with new user details
      const currentUser = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || '{}');
      const mergedUser = { ...currentUser, ...updatedUser };

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mergedUser));
      setAuthState(prev => ({ ...prev, user: mergedUser }));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
