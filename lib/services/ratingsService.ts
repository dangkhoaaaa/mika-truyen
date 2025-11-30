import axios from 'axios';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CreateRatingDto {
  contentType: 'movie' | 'comic';
  contentId: string;
  stars: number; // 1-5
}

export interface Rating {
  _id: string;
  userId: string;
  contentType: 'movie' | 'comic';
  contentId: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentRating {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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
    },
  });
};

export const ratingsService = {
  /**
   * Create or update a rating
   */
  createOrUpdate: async (data: CreateRatingDto): Promise<Rating> => {
    const authApi = createAuthApi();
    const response = await authApi.post<Rating>(`${API_BASE_URL}/ratings`, data);
    return response.data;
  },

  /**
   * Get content rating statistics (public)
   */
  getContentRating: async (
    contentType: 'movie' | 'comic',
    contentId: string,
  ): Promise<ContentRating> => {
    const params = new URLSearchParams();
    params.append('contentType', contentType);
    params.append('contentId', contentId);

    const response = await axios.get<ContentRating>(
      `${API_BASE_URL}/ratings/content?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get user's rating for content
   */
  getUserRating: async (
    contentType: 'movie' | 'comic',
    contentId: string,
  ): Promise<Rating | null> => {
    const authApi = createAuthApi();
    try {
      const params = new URLSearchParams();
      params.append('contentType', contentType);
      params.append('contentId', contentId);

      const response = await authApi.get<Rating>(`${API_BASE_URL}/ratings/user?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
