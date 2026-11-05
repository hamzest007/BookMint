import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

// Reactotron for debugging
const tron = (console as any).tron;

const AUTH_STORAGE_KEY = '@bookmint_auth';
const TOKEN_STORAGE_KEY = '@bookmint_token';
const USER_STORAGE_KEY = '@bookmint_user';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUri?: string;
  handle: string;
  bio?: string;
  readingStats?: any;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (name: string, email: string, password: string, avatarUri?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      if (tron) {
        tron.log('Loading auth data...');
      }
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

      if (token && userData && authData === 'true') {
        apiService.setToken(token);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        if (tron) {
          tron.log('Auth data loaded successfully', { user: JSON.parse(userData) });
        }
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      if (tron) {
        tron.error('Failed to load auth data', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, avatarUri?: string) => {
    try {
      if (tron) {
        tron.log('Starting signup', { name, email });
      }
      const response = await apiService.post('/auth/register', {
        name,
        email,
        password,
        avatarUri
      });

      const { token, user } = response;

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');

      apiService.setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      if (tron) {
        tron.log('Signup successful', { user });
      }
    } catch (error) {
      console.error('Signup failed:', error);
      if (tron) {
        tron.error('Signup failed', error);
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (tron) {
        tron.log('Starting login', { email });
      }
      const response = await apiService.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response;

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');

      apiService.setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      if (tron) {
        tron.log('Login successful', { user });
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (tron) {
        tron.error('Login failed', error);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tron) {
        tron.log('Starting logout');
      }
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'false');
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);

      apiService.clearToken();
      setUser(null);
      setIsAuthenticated(false);

      if (tron) {
        tron.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      if (tron) {
        tron.error('Logout failed', error);
      }
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return;

      const response = await apiService.put('/auth/updatedetails', updates);
      const updatedUser = response.user;

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
