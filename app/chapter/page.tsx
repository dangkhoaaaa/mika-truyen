/**
 * Chapter reader page
 * Displays comic chapter images
 */
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useGetChapterDataQuery } from '@/lib/services/comicApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { useState, useEffect, Suspense } from 'react'

function ChapterReaderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const chapterUrl = searchParams.get('url')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { data, isLoading, error } = useGetChapterDataQuery(
    chapterUrl || '',
    { skip: !chapterUrl }
  )

  // Build image URLs from API response
  // Create a copy of the array before sorting (RTK Query returns frozen arrays)
  const images = data?.data?.item?.chapter_image
    ? [...data.data.item.chapter_image]
        .sort((a, b) => a.image_page - b.image_page)
        .map(
          (img) =>
            `${data.data.domain_cdn}/${data.data.item.chapter_path}/${img.image_file}`
        )
    : []

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
      } else if (e.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1)
      } else if (e.key === 'Escape') {
        router.back()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentImageIndex, images.length, router])

  if (!chapterUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Không tìm thấy chapter</p>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-400 mb-4">
            {error && 'message' in error ? String(error.message) : 'Không thể tải chapter'}
          </p>
          <button
            onClick={() => router.back()}
            className="text-netflix-red hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!data || images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không có dữ liệu</h2>
          <p className="text-gray-400 mb-4">Chapter này không có ảnh</p>
          <button
            onClick={() => router.back()}
            className="text-netflix-red hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-netflix-gray rounded transition-colors z-[101] relative"
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
          <p className="text-sm text-gray-300">
            {currentImageIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Image Viewer */}
      <div className="pt-16 pb-8">
        <div className="flex flex-col items-center space-y-4">
          {images.length > 0 ? (
            images.map((imageUrl: string, index: number) => (
              <div
                key={index}
                className={`w-full max-w-4xl ${index === currentImageIndex ? 'block' : 'hidden'}`}
              >
                <Image
                  src={imageUrl}
                  alt={`Page ${index + 1}`}
                  width={1200}
                  height={1800}
                  className="w-full h-auto"
                  priority={index <= currentImageIndex + 1}
                  unoptimized
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.png'
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Không có ảnh nào trong chapter này</p>
            </div>
          )}
        </div>
      </div>

      {/* Left Navigation Button - Previous */}
      <button
        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
        disabled={currentImageIndex === 0}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 h-full w-1/4 md:w-1/6 flex items-center justify-start pl-4 hover:bg-black/20 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto"
        aria-label="Previous page"
        style={{ pointerEvents: currentImageIndex === 0 ? 'none' : 'auto' }}
      >
        <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110">
          <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </button>

      {/* Right Navigation Button - Next */}
      <button
        onClick={() =>
          setCurrentImageIndex(
            Math.min(images.length - 1, currentImageIndex + 1)
          )
        }
        disabled={currentImageIndex === images.length - 1}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 h-full w-1/4 md:w-1/6 flex items-center justify-end pr-4 hover:bg-black/20 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto"
        aria-label="Next page"
        style={{ pointerEvents: currentImageIndex === images.length - 1 ? 'none' : 'auto' }}
      >
        <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110">
          <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </button>

      {/* Page Counter - Bottom Center */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-netflix-gray/80 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-sm">
          {currentImageIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  )
}

export default function ChapterReaderPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChapterReaderContent />
    </Suspense>
  )
}

