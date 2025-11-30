import axios from 'axios';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UpdateUserDto {
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
}

export interface UserResponse {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  bio?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create authenticated axios instance
 */
const createAuthApi = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserResponse> => {
    const authApi = createAuthApi();
    const response = await authApi.get<UserResponse>(`${API_BASE_URL}/users/profile`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateUserDto): Promise<UserResponse> => {
    const authApi = createAuthApi();
    const response = await authApi.put<UserResponse>(`${API_BASE_URL}/users/profile`, data);
    return response.data;
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File): Promise<UserResponse> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  },
};
