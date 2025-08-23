import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthToken, LoginRequest, RegisterRequest, ApiResponse } from '@auragen/shared';
import { authAPI } from '../services/authAPI';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize auth state on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      
      // Get stored tokens and user data
      const [accessToken, refreshToken, userData] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (accessToken && userData) {
        // Set auth header for API calls
        authAPI.setAuthToken(accessToken);
        
        // Parse and set user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Verify token is still valid
        try {
          await authAPI.checkAuth();
        } catch (error) {
          // Token might be expired, try refreshing
          if (refreshToken) {
            try {
              await handleRefreshToken(refreshToken);
            } catch (refreshError) {
              // Refresh failed, logout user
              await logout();
            }
          } else {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async (storedRefreshToken?: string) => {
    try {
      const refreshToken = storedRefreshToken || await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      
      // Store new tokens
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, response.tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.tokens.refreshToken),
      ]);

      // Set new auth header
      authAPI.setAuthToken(response.tokens.accessToken);

      // Get updated user profile
      const profileResponse = await authAPI.getProfile();
      const updatedUser = profileResponse.user;
      
      setUser(updatedUser);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      const { user: userData, tokens } = response;

      // Store tokens and user data
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
      ]);

      // Set auth header for future requests
      authAPI.setAuthToken(tokens.accessToken);
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.register(userData);
      const { user: newUser, tokens } = response;

      // Store tokens and user data
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
      ]);

      // Set auth header for future requests
      authAPI.setAuthToken(tokens.accessToken);
      
      setUser(newUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Try to logout on server (optional, don't throw if it fails)
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn('Server logout failed:', error);
      }

      // Clear all stored data
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);

      // Clear auth header
      authAPI.setAuthToken(null);
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    await handleRefreshToken();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update stored user data
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)).catch(error => {
        console.error('Failed to update stored user data:', error);
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}