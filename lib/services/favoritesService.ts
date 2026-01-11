import { createAuthApi } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CreateFavoriteDto {
  contentType: 'comic' | 'movie';
  contentId: string;
  contentTitle: string;
  contentThumb?: string;
  contentSlug?: string;
  contentStatus?: string;
  contentTotalChapters?: number;
}

export interface Favorite {
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
  contentStatus: string;
  contentTotalChapters: number;
}

export interface FavoritesResponse {
  items: Favorite[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


export const favoritesService = {
  /**
   * Add a comic to favorites
   */
  addFavorite: async (data: CreateFavoriteDto): Promise<Favorite> => {
    const authApi = createAuthApi();
    const response = await authApi.post<Favorite>(`${API_BASE_URL}/favorites`, data);
    return response.data;
  },

  /**
   * Update the contentStatus of a favorite item
   */
  updateFavoriteContentStatus: async (contentId: string, contentStatus: string): Promise<Favorite> => {
    const authApi = createAuthApi();
    const response = await authApi.patch<Favorite>(
      `${API_BASE_URL}/favorites/${contentId}/status`,
      { contentStatus },
    );
    return response.data;
  },

  /**
   * Get user's favorites
   */
  getFavorites: async (
    contentType?: 'movie' | 'comic',
    page: number = 1,
    limit: number = 20,
  ): Promise<FavoritesResponse> => {
    const authApi = createAuthApi();
    const params = new URLSearchParams();
    if (contentType) params.append('contentType', contentType);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await authApi.get<FavoritesResponse>(
      `${API_BASE_URL}/favorites?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Check if a comic is in favorites
   */
  checkFavorite: async (contentId: string): Promise<boolean> => {
    const authApi = createAuthApi();
    try {
      const response = await authApi.get<{ isFavorite: boolean }>(
        `${API_BASE_URL}/favorites/check/${contentId}`,
      );
      return response.data.isFavorite;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  /**
   * Remove a comic from favorites
   */
  removeFavorite: async (contentId: string): Promise<void> => {
    const authApi = createAuthApi();
    await authApi.delete(`${API_BASE_URL}/favorites/${contentId}`);
  },

  /**
   * Clear all favorites
   */
  clearFavorites: async (): Promise<void> => {
    const authApi = createAuthApi();
    await authApi.delete(`${API_BASE_URL}/favorites`);
  },
};
