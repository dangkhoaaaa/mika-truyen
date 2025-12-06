import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Authentication service for truyenMika
 * Handles user registration, login, and token management
 */
export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    email: string;
    username: string;
    fullName: string;
    avatar: string;
  };
}

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

/**
 * Save auth token to localStorage
 */
export const saveAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (user: AuthResponse['user']): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userData', JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): AuthResponse['user'] | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userData');
};

/**
 * Create authenticated axios instance with 401 interceptor
 * Export this function so other services can use it
 */
export const createAuthApi = () => {
  const token = getAuthToken();
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  // Interceptor to handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear auth data
        removeAuthToken();
        removeUserData();
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data);
    if (response.data.accessToken) {
      saveAuthToken(response.data.accessToken);
      saveUserData(response.data.user);
    }
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, data);
    if (response.data.accessToken) {
      saveAuthToken(response.data.accessToken);
      saveUserData(response.data.user);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    removeAuthToken();
    removeUserData();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  /**
   * Get current user
   */
  getCurrentUser: (): AuthResponse['user'] | null => {
    return getUserData();
  },
};
