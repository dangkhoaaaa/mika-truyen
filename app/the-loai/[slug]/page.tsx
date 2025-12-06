/**
 * Category comics listing page
 * Displays comics filtered by category
 */
'use client'

import { useParams } from 'next/navigation'
import { useGetComicsByCategoryQuery } from '@/lib/services/comicApi'
import ComicCard from '@/components/ComicCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import Pagination from '@/components/common/Pagination'
import { useState } from 'react'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useGetComicsByCategoryQuery({
    slug,
    page,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-gray-400">Có lỗi xảy ra</p>
      </div>
    )
  }

  const { items, params: pageParams, APP_DOMAIN_CDN_IMAGE } = data.data
  const titlePage = data.data.titlePage || 'Thể Loại'
  const totalPages = Math.ceil(
    pageParams.pagination.totalItems / pageParams.pagination.totalItemsPerPage
  )

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{titlePage}</h1>

        {items.length === 0 ? (
          <p className="text-gray-400">Chưa có truyện nào trong thể loại này</p>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Tổng cộng {pageParams.pagination.totalItems} truyện
            </p>

            {/* Comics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {items.map((comic) => (
                <ComicCard
                  key={comic._id}
                  comic={comic}
                  cdnUrl={APP_DOMAIN_CDN_IMAGE}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

