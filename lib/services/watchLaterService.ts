import { createAuthApi } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CreateWatchLaterDto {
  contentType: 'comic' | 'movie';
  contentId: string;
  contentTitle: string;
  contentThumb?: string;
  contentSlug?: string;
}

export interface WatchLater {
  _id: string;
  userId: string;
  contentType: 'comic' | 'movie';
  contentId: string;
  contentTitle: string;
  contentThumb: string;
  contentSlug: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchLaterResponse {
  items: WatchLater[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


export const watchLaterService = {
  /**
   * Add a content to watch later
   */
  addWatchLater: async (data: CreateWatchLaterDto): Promise<WatchLater> => {
    const authApi = createAuthApi();
    const response = await authApi.post<WatchLater>(`${API_BASE_URL}/watch-later`, data);
    return response.data;
  },

  /**
   * Get user's watch later list
   */
  getWatchLater: async (
    contentType?: 'movie' | 'comic',
    page: number = 1,
    limit: number = 20,
  ): Promise<WatchLaterResponse> => {
    const authApi = createAuthApi();
    const params = new URLSearchParams();
    if (contentType) params.append('contentType', contentType);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await authApi.get<WatchLaterResponse>(
      `${API_BASE_URL}/watch-later?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Check if content is in watch later
   */
  checkWatchLater: async (contentId: string): Promise<boolean> => {
    const authApi = createAuthApi();
    try {
      const response = await authApi.get<{ isInWatchLater: boolean }>(
        `${API_BASE_URL}/watch-later/check/${contentId}`,
      );
      return response.data.isInWatchLater;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  /**
   * Remove content from watch later
   */
  removeWatchLater: async (contentId: string): Promise<void> => {
    const authApi = createAuthApi();
    await authApi.delete(`${API_BASE_URL}/watch-later/${contentId}`);
  },

  /**
   * Clear all watch later
   */
  clearWatchLater: async (): Promise<void> => {
    const authApi = createAuthApi();
    await authApi.delete(`${API_BASE_URL}/watch-later`);
  },
};

