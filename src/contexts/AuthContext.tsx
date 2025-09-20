import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { dataStorage, secureStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await dataStorage.getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For demo purposes, we'll use mock data
      const mockUsers = [
        {
          id: '1',
          email: 'admin@school.com',
          name: 'Admin User',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'teacher@school.com',
          name: 'Teacher User',
          role: 'teacher' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      // In a real app, verify password hash
      if (password !== 'password123') {
        return { success: false, error: 'Invalid email or password' };
      }

      // Store user data
      await dataStorage.saveUser(foundUser);
      setUser(foundUser);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Store user data
      await dataStorage.saveUser(newUser);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An error occurred during signup' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await dataStorage.clearUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
