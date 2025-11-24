/**
 * Chapter reader page
 * Displays comic chapter images
 */
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useGetChapterDataQuery, useGetComicBySlugQuery } from '@/lib/services/comicApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FiChevronLeft, FiChevronRight, FiX, FiMinimize2, FiMaximize2 } from 'react-icons/fi'
import { useState, useEffect, Suspense } from 'react'

function ChapterReaderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const chapterUrl = searchParams.get('url')
  const comicSlug = searchParams.get('comic')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const [isFullScale, setIsFullScale] = useState(true)

  // Get comic data to access chapter list
  const { data: comicData } = useGetComicBySlugQuery(comicSlug || '', {
    skip: !comicSlug,
  })

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

  // Get current chapter info and find prev/next chapters
  const currentChapterName = data?.data?.item?.chapter_name
  const chapters = comicData?.data?.item?.chapters?.[0]?.server_data || []
  const sortedChapters = [...chapters].reverse() // Reverse to get chronological order
  
  const currentChapterIndex = sortedChapters.findIndex(
    (ch) => ch.chapter_api_data === chapterUrl
  )
  const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null

  // Auto-hide UI when page changes
  useEffect(() => {
    setShowUI(false)
  }, [currentImageIndex])

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
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Full Scale Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsFullScale((prev) => !prev)
          setShowUI(true)
        }}
        className={`fixed top-4 left-4 z-[100] p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-300 backdrop-blur-sm shadow-lg ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Toggle scale"
      >
        {isFullScale ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
      </button>
      {/* Close Button - Floating on top right, overlay on comic */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          router.back()
        }}
        className={`fixed top-4 right-4 z-[100] p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Close"
      >
        <FiX className="w-6 h-6 text-white" />
      </button>

      {/* Image Viewer */}
      <div
        className={`fixed inset-0 w-full ${isFullScale ? 'h-full overflow-hidden' : 'min-h-full overflow-y-auto bg-black'}`}
        onClick={() => setShowUI(!showUI)}
      >
        <div
          className={`w-full ${isFullScale ? 'h-full flex items-center justify-center' : 'flex flex-col items-center py-8 space-y-4'}`}
        >
          {images.length > 0 ? (
            images.map((imageUrl: string, index: number) => (
              <div
                key={index}
                className={`${
                  isFullScale ? 'absolute inset-0' : 'relative w-full'
                } flex items-center justify-center cursor-pointer ${
                  index === currentImageIndex ? 'block' : 'hidden'
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`Page ${index + 1}`}
                  width={1200}
                  height={1800}
                  className={
                    isFullScale
                      ? 'w-full h-full object-contain pointer-events-none'
                      : 'w-full h-auto object-contain pointer-events-none'
                  }
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
            <div className="text-center text-gray-400">
              <p>Không có ảnh nào trong chapter này</p>
            </div>
          )}
        </div>
      </div>

      {/* Left Navigation Button - Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
        }}
        disabled={currentImageIndex === 0}
        className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-40 h-full w-1/4 md:w-1/6 flex items-center justify-start pl-4 hover:bg-black/20 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Previous page"
        style={{ pointerEvents: currentImageIndex === 0 ? 'none' : 'auto' }}
      >
        <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110">
          <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </button>

      {/* Right Navigation Button - Next */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setCurrentImageIndex(
            Math.min(images.length - 1, currentImageIndex + 1)
          )
        }}
        disabled={currentImageIndex === images.length - 1}
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-40 h-full w-1/4 md:w-1/6 flex items-center justify-end pr-4 hover:bg-black/20 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Next page"
        style={{ pointerEvents: currentImageIndex === images.length - 1 ? 'none' : 'auto' }}
      >
        <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110">
          <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </button>

      {/* Page Counter - Bottom Center */}
      <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-netflix-gray/80 backdrop-blur-sm rounded-full px-4 py-2 transition-all ${
        showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <span className="text-sm">
          {currentImageIndex + 1} / {images.length}
        </span>
      </div>

      {/* Next chapter Button - Bottom Left */}
      {nextChapter && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/chapter?url=${encodeURIComponent(nextChapter.chapter_api_data)}&comic=${comicSlug}`)
            setCurrentImageIndex(0)
          }}
          className={`fixed bottom-4 left-4 z-[100] px-4 py-2 bg-black/70 hover:bg-black/90 rounded-lg transition-all backdrop-blur-sm shadow-lg flex items-center space-x-2 ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Next chapter"
        >
          <FiChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-medium">Chap {nextChapter.chapter_name}</span>
        </button>
      )}

      {/* Previous chapter Button - Bottom Right */}
      {prevChapter && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/chapter?url=${encodeURIComponent(prevChapter.chapter_api_data)}&comic=${comicSlug}`)
            setCurrentImageIndex(0)
          }}
          className={`fixed bottom-4 right-4 z-[100] px-4 py-2 bg-black/70 hover:bg-black/90 rounded-lg transition-all backdrop-blur-sm shadow-lg flex items-center space-x-2 ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Previous chapter"
        >
          <span className="text-white text-sm font-medium">Chap {prevChapter.chapter_name}</span>
          <FiChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
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

