import axios from 'axios';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CreateCommentDto {
  contentType: 'movie' | 'comic';
  contentId: string;
  content: string;
  parentId?: string;
}

export interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    avatar: string;
    fullName: string;
  };
  contentType: 'movie' | 'comic';
  contentId: string;
  content: string;
  parentId: string | null;
  likes: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CommentsResponse {
  items: Comment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
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

export const commentsService = {
  /**
   * Create a comment
   */
  create: async (data: CreateCommentDto): Promise<Comment> => {
    const authApi = createAuthApi();
    const response = await authApi.post<Comment>(`${API_BASE_URL}/comments`, data);
    return response.data;
  },

  /**
   * Get comments for content (public)
   */
  getComments: async (
    contentType: 'movie' | 'comic',
    contentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CommentsResponse> => {
    const params = new URLSearchParams();
    params.append('contentType', contentType);
    params.append('contentId', contentId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axios.get<CommentsResponse>(
      `${API_BASE_URL}/comments?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get comment replies
   */
  getReplies: async (
    parentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CommentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axios.get<CommentsResponse>(
      `${API_BASE_URL}/comments/replies/${parentId}?${params.toString()}`,
    );
    return response.data;
  },
};
