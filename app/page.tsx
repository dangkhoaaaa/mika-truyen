/**
 * Home page component
 * Main landing page with hero banner and comic carousels
 */
'use client'

import { useState } from 'react'
import {
  useGetHomeComicsQuery,
  useGetComicsDangPhatHanhQuery,
  useGetComicsSapRaMatQuery,
  useGetComicsHoanThanhQuery,
} from '@/lib/services/comicApi'
import HeroBanner from '@/components/HeroBanner'
import ComicCarousel from '@/components/ComicCarousel'
import ComicCarouselWithPagination from '@/components/ComicCarouselWithPagination'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const [dangPhatHanhPage, setDangPhatHanhPage] = useState(1)
  const [sapRaMatPage, setSapRaMatPage] = useState(1)
  const [hoanThanhPage, setHoanThanhPage] = useState(1)

  const { data, isLoading, error } = useGetHomeComicsQuery()
  const {
    data: dangPhatHanhData,
    isLoading: dangPhatHanhLoading,
  } = useGetComicsDangPhatHanhQuery({ page: dangPhatHanhPage })
  const {
    data: sapRaMatData,
    isLoading: sapRaMatLoading,
  } = useGetComicsSapRaMatQuery({ page: sapRaMatPage })
  const {
    data: hoanThanhData,
    isLoading: hoanThanhLoading,
  } = useGetComicsHoanThanhQuery({ page: hoanThanhPage })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-400">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  const { items, APP_DOMAIN_CDN_IMAGE } = data.data

  // Split comics into different sections
  const featuredComics = items.slice(0, 5)
  const newComics = items.slice(0, 20)
  const allComics = items

  // Get data for new sections
  const dangPhatHanhComics = dangPhatHanhData?.data?.items || []
  const dangPhatHanhTotalPages = dangPhatHanhData?.data?.params?.pagination
    ? Math.ceil(
        dangPhatHanhData.data.params.pagination.totalItems /
          (dangPhatHanhData.data.params.pagination.totalItemsPerPage || 24)
      )
    : 1

  const sapRaMatComics = sapRaMatData?.data?.items || []
  const sapRaMatTotalPages = sapRaMatData?.data?.params?.pagination
    ? Math.ceil(
        sapRaMatData.data.params.pagination.totalItems /
          (sapRaMatData.data.params.pagination.totalItemsPerPage || 24)
      )
    : 1

  const hoanThanhComics = hoanThanhData?.data?.items || []
  const hoanThanhTotalPages = hoanThanhData?.data?.params?.pagination
    ? Math.ceil(
        hoanThanhData.data.params.pagination.totalItems /
          (hoanThanhData.data.params.pagination.totalItemsPerPage || 24)
      )
    : 1

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner comics={featuredComics} cdnUrl={APP_DOMAIN_CDN_IMAGE} />

      {/* Content Section */}
      <div className="mt-8 pb-16">
        {/* New Comics */}
        <ComicCarousel
          title="Truyện Mới Cập Nhật"
          comics={newComics}
          cdnUrl={APP_DOMAIN_CDN_IMAGE}
          useSwiper
        />

        {/* Đang Phát Hành */}
        {!dangPhatHanhLoading && dangPhatHanhComics.length > 0 && (
          <ComicCarouselWithPagination
            title="Đang Phát Hành"
            comics={dangPhatHanhComics}
            cdnUrl={APP_DOMAIN_CDN_IMAGE}
            totalPages={dangPhatHanhTotalPages}
            currentPage={dangPhatHanhPage}
            onPageChange={(page) => {
              setDangPhatHanhPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            viewAllLink="/danh-sach/dang-phat-hanh"
          />
        )}

        {/* Sắp Ra Mắt */}
        {!sapRaMatLoading && sapRaMatComics.length > 0 && (
          <ComicCarouselWithPagination
            title="Sắp Ra Mắt"
            comics={sapRaMatComics}
            cdnUrl={APP_DOMAIN_CDN_IMAGE}
            totalPages={sapRaMatTotalPages}
            currentPage={sapRaMatPage}
            onPageChange={(page) => {
              setSapRaMatPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            viewAllLink="/danh-sach/sap-ra-mat"
          />
        )}

        {/* Hoàn Thành */}
        {!hoanThanhLoading && hoanThanhComics.length > 0 && (
          <ComicCarouselWithPagination
            title="Hoàn Thành"
            comics={hoanThanhComics}
            cdnUrl={APP_DOMAIN_CDN_IMAGE}
            totalPages={hoanThanhTotalPages}
            currentPage={hoanThanhPage}
            onPageChange={(page) => {
              setHoanThanhPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            viewAllLink="/danh-sach/hoan-thanh"
          />
        )}

        {/* All Comics */}
        <ComicCarousel
          title="Tất Cả Truyện"
          comics={allComics}
          cdnUrl={APP_DOMAIN_CDN_IMAGE}
        />
      </div>
    </main>
  )
}


