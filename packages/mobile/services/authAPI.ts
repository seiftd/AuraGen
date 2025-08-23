import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthToken, 
  ApiResponse, 
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest 
} from '@auragen/shared';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class AuthAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/auth`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error.response?.data) {
          throw new Error(error.response.data.error?.message || 'An error occurred');
        }
        throw new Error(error.message || 'Network error');
      }
    );
  }

  // Set auth token for requests
  public setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Register new user
  public async register(userData: RegisterRequest): Promise<{ user: User; tokens: AuthToken }> {
    const response: ApiResponse = await this.api.post('/register', userData);
    return response.data;
  }

  // Login user
  public async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthToken }> {
    const response: ApiResponse = await this.api.post('/login', credentials);
    return response.data;
  }

  // Logout user
  public async logout(): Promise<void> {
    await this.api.post('/logout');
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<{ tokens: AuthToken }> {
    const response: ApiResponse = await this.api.post('/refresh', { refreshToken });
    return response.data;
  }

  // Get user profile
  public async getProfile(): Promise<{ user: User }> {
    const response: ApiResponse = await this.api.get('/profile');
    return response.data;
  }

  // Check authentication status
  public async checkAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const response: ApiResponse = await this.api.get('/check');
    return response.data;
  }

  // Verify email
  public async verifyEmail(token: string): Promise<{ user: User }> {
    const response: ApiResponse = await this.api.get(`/verify-email?token=${token}`);
    return response.data;
  }

  // Request password reset
  public async forgotPassword(email: string): Promise<void> {
    await this.api.post('/forgot-password', { email });
  }

  // Reset password
  public async resetPassword(data: ResetPasswordRequest): Promise<{ user: User }> {
    const response: ApiResponse = await this.api.post('/reset-password', data);
    return response.data;
  }

  // Change password
  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.api.post('/change-password', data);
  }

  // Resend verification email
  public async resendVerificationEmail(email: string): Promise<void> {
    await this.api.post('/resend-verification', { email });
  }
}

export const authAPI = new AuthAPI();