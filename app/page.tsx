/**
 * Home page component
 * Main landing page with hero banner and comic carousels
 */
'use client'

import { useGetHomeComicsQuery } from '@/lib/services/comicApi'
import HeroBanner from '@/components/HeroBanner'
import ComicCarousel from '@/components/ComicCarousel'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const { data, isLoading, error } = useGetHomeComicsQuery()

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
        />

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


