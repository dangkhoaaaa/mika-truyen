/**
 * Search results page
 * Displays search results for comics
 */
'use client'

import { useSearchParams } from 'next/navigation'
import { useSearchComicsQuery } from '@/lib/services/comicApi'
import ComicCard from '@/components/ComicCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useState } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useSearchComicsQuery(
    { keyword, page },
    { skip: !keyword }
  )

  if (!keyword) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-gray-400">Vui lòng nhập từ khóa tìm kiếm</p>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-gray-400">Có lỗi xảy ra khi tìm kiếm</p>
      </div>
    )
  }

  const { items, params } = data.data
  const totalPages = Math.ceil(
    params.pagination.totalItems / params.pagination.totalItemsPerPage
  )

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Kết quả tìm kiếm: &quot;{keyword}&quot;
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-400">Không tìm thấy truyện nào</p>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Tìm thấy {params.pagination.totalItems} kết quả
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {items.map((comic) => (
                <ComicCard
                  key={comic._id}
                  comic={comic}
                  cdnUrl={data.data.APP_DOMAIN_CDN_IMAGE}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-netflix-gray/50 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-netflix-gray transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-netflix-gray/50 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-netflix-gray transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

