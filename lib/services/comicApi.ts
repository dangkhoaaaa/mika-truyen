/**
 * RTK Query API slice for comic data fetching
 * Handles all API calls to the otruyenapi.com endpoints
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = 'https://otruyenapi.com/v1/api'

// Type definitions for API responses
export interface Comic {
  _id: string
  name: string
  slug: string
  origin_name: string[]
  status: 'ongoing' | 'completed'
  thumb_url: string
  sub_docquyen: boolean
  category: Category[]
  updatedAt: string
  chaptersLatest?: Chapter[]
  content?: string
  author?: string[]
  chapters?: ChapterGroup[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Chapter {
  filename: string
  chapter_name: string
  chapter_title: string
  chapter_api_data: string
}

export interface ChapterGroup {
  server_name: string
  server_data: Chapter[]
}

export interface HomeResponse {
  status: string
  message: string
  data: {
    items: Comic[]
    seoOnPage: {
      titleHead: string
      descriptionHead: string
      og_image: string[]
    }
    params: {
      pagination: {
        totalItems: number
        totalItemsPerPage: number
        currentPage: number
      }
    }
    APP_DOMAIN_CDN_IMAGE: string
  }
}

export interface ComicDetailResponse {
  status: string
  message: string
  data: {
    item: Comic
    seoOnPage: {
      titleHead: string
      descriptionHead: string
    }
    APP_DOMAIN_CDN_IMAGE: string
  }
}

export interface CategoryListResponse {
  status: string
  message: string
  data: {
    items: Category[]
  }
}

export interface SearchResponse {
  status: string
  message: string
  data: {
    items: Comic[]
    params: {
      keyword: string
      pagination: {
        totalItems: number
        currentPage: number
      }
    }
  }
}

export interface ChapterImage {
  image_page: number
  image_file: string
}

export interface ChapterData {
  status: string
  data: {
    domain_cdn: string
    item: {
      _id: string
      comic_name: string
      chapter_name: string
      chapter_title: string
      chapter_path: string
      chapter_image: ChapterImage[]
    }
  }
}

/**
 * RTK Query API slice
 * Provides endpoints for fetching comic data
 */
export const comicApi = createApi({
  reducerPath: 'comicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['Comic', 'Home', 'Category'],
  endpoints: (builder) => ({
    // Get home page comics
    getHomeComics: builder.query<HomeResponse, void>({
      query: () => '/home',
      providesTags: ['Home'],
    }),

    // Get comic by slug
    getComicBySlug: builder.query<ComicDetailResponse, string>({
      query: (slug) => `/truyen-tranh/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Comic', id: slug }],
    }),

    // Get comics by category
    getComicsByCategory: builder.query<
      HomeResponse,
      { slug: string; page?: number }
    >({
      query: ({ slug, page = 1 }) => `/the-loai/${slug}?page=${page}`,
      providesTags: (result, error, { slug }) => [
        { type: 'Category', id: slug },
      ],
    }),

    // Get comics by list type
    getComicsByList: builder.query<
      HomeResponse,
      { type: string; page?: number }
    >({
      query: ({ type, page = 1 }) => `/danh-sach/${type}?page=${page}`,
      providesTags: ['Home'],
    }),

    // Get all categories
    getCategories: builder.query<CategoryListResponse, void>({
      query: () => '/the-loai',
      providesTags: ['Category'],
    }),

    // Search comics
    searchComics: builder.query<SearchResponse, { keyword: string; page?: number }>({
      query: ({ keyword, page = 1 }) =>
        `/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    }),

    // Get chapter data
    getChapterData: builder.query<ChapterData, string>({
      query: (chapterUrl) => chapterUrl,
    }),
  }),
})

export const {
  useGetHomeComicsQuery,
  useGetComicBySlugQuery,
  useGetComicsByCategoryQuery,
  useGetComicsByListQuery,
  useGetCategoriesQuery,
  useSearchComicsQuery,
  useGetChapterDataQuery,
} = comicApi

