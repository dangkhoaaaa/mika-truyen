import { createAuthApi } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CreateWatchHistoryDto {
  contentType: 'movie' | 'comic';
  contentId: string;
  contentTitle: string;
  contentSlug?: string;
  contentThumb?: string;
  episodeId?: string;
  episodeName?: string;
  episodeNumber?: number;
  chapterId?: string;
  chapterName?: string;
  chapterNumber?: number;
  duration?: number;
  totalDuration?: number;
  progress?: number;
}

export interface WatchHistory {
  _id: string;
  userId: string;
  contentType: 'movie' | 'comic';
  contentId: string;
  contentTitle: string;
  contentThumb: string;
  contentSlug?: string;
  episodeId?: string;
  episodeName?: string;
  chapterId?: string;
  chapterName?: string;
  watchTime: number;
  totalDuration: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchHistoryResponse {
  items: WatchHistory[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


export const watchHistoryService = {
  /**
   * Create or update watch history
   */
  createOrUpdate: async (data: CreateWatchHistoryDto): Promise<WatchHistory> => {
    const authApi = createAuthApi();
    const response = await authApi.post<WatchHistory>(`${API_BASE_URL}/watch-history`, data);
    return response.data;
  },

  /**
   * Get user watch history
   */
  getWatchHistory: async (
    contentType?: 'movie' | 'comic',
    page: number = 1,
    limit: number = 20,
  ): Promise<WatchHistoryResponse> => {
    const authApi = createAuthApi();
    const params = new URLSearchParams();
    if (contentType) params.append('contentType', contentType);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await authApi.get<WatchHistoryResponse>(
      `${API_BASE_URL}/watch-history?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get specific watch history
   */
  getWatchHistoryByContentId: async (contentId: string): Promise<WatchHistory | null> => {
    const authApi = createAuthApi();
    try {
      const response = await authApi.get<WatchHistory>(
        `${API_BASE_URL}/watch-history/${contentId}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update watch history
   */
  updateWatchHistory: async (
    contentId: string,
    data: Partial<CreateWatchHistoryDto>,
  ): Promise<WatchHistory> => {
    const authApi = createAuthApi();
    const response = await authApi.put<WatchHistory>(
      `${API_BASE_URL}/watch-history/${contentId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete watch history
   */
  deleteWatchHistory: async (contentId: string): Promise<void> => {
    const authApi = createAuthApi();
    await authApi.delete(`${API_BASE_URL}/watch-history/${contentId}`);
  },

  /**
   * Clear all watch history
   */
  clearWatchHistory: async (contentType?: 'movie' | 'comic'): Promise<void> => {
    const authApi = createAuthApi();
    const params = contentType ? `?contentType=${contentType}` : '';
    await authApi.delete(`${API_BASE_URL}/watch-history${params}`);
  },
};
