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
import { useState, useEffect, Suspense, useRef } from 'react'
import { watchHistoryService } from '@/lib/services/watchHistoryService'
import { authService } from '@/lib/services/authService'

type ReadingMode = 'single' | 'scroll'

function ChapterReaderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const chapterUrl = searchParams.get('url')
  const comicSlug = searchParams.get('comic')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const [isFullScale, setIsFullScale] = useState(true)
  const [readingMode, setReadingMode] = useState<ReadingMode>('single')
  const touchStartX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 60
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const singlePageScrollRef = useRef<HTMLDivElement | null>(null)

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

  // Save watch history when chapter loads
  useEffect(() => {
    if (data?.data?.item && comicData?.data?.item && authService.isAuthenticated()) {
      const saveWatchHistory = async () => {
        try {
          const comic = comicData.data.item;
          const chapter = data.data.item;
          const cdnUrl = comicData.data.APP_DOMAIN_CDN_IMAGE;
          const imageUrl = `${cdnUrl}/uploads/comics/${comic.thumb_url}`;
          
          await watchHistoryService.createOrUpdate({
            contentType: 'comic',
            contentId: comic._id || comicSlug || '',
            contentTitle: comic.name,
            contentThumb: imageUrl,
            contentSlug: comicSlug,
            contentStatus: comic.status,
            contentTotalChapters: comic.chapters[0].server_data.length,
            chapterId: chapterUrl || '',
            chapterName: chapter.chapter_name || currentChapterName || '',
          });
        } catch (error) {
          console.error('Failed to save watch history:', error);
        }
      };
      
      saveWatchHistory();
    }
  }, [data, comicData, chapterUrl, comicSlug, currentChapterName]);

  // Auto-hide UI when page changes (single mode only)
  useEffect(() => {
    if (readingMode === 'single') {
      setShowUI(false)
    }
  }, [currentImageIndex, readingMode])

  // Keyboard navigation
  useEffect(() => {
    if (readingMode !== 'single') return
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
  }, [currentImageIndex, images.length, router, readingMode])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (readingMode !== 'single') return
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (readingMode !== 'single') return
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX > SWIPE_THRESHOLD && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (deltaX < -SWIPE_THRESHOLD && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    touchStartX.current = null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readingMode !== 'single') return
    mouseStartX.current = e.clientX
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (readingMode !== 'single') return
    if (mouseStartX.current === null) return
    const deltaX = e.clientX - mouseStartX.current
    if (deltaX > SWIPE_THRESHOLD && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (deltaX < -SWIPE_THRESHOLD && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    mouseStartX.current = null
  }

  // Scroll to top when chapter, page or mode changes
  useEffect(() => {
    if (readingMode === 'scroll' && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
    } else if (readingMode === 'single' && singlePageScrollRef.current) {
      singlePageScrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [chapterUrl, currentImageIndex, readingMode])

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
      {/* Full Scale Toggle (top-left) */}
      {readingMode === 'single' && (
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
      )}

      {/* Reading mode toggle (top center) */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex bg-black/70 backdrop-blur-sm rounded-full shadow-lg overflow-hidden border border-white/10 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            setReadingMode('single')
            setShowUI(true)
          }}
          className={`px-5 py-2 transition-colors ${
            readingMode === 'single' ? 'bg-netflix-red text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Từng trang
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setReadingMode('scroll')
            setShowUI(true)
          }}
          className={`px-5 py-2 transition-colors ${
            readingMode === 'scroll' ? 'bg-netflix-gray text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Cuộn dọc
        </button>
      </div>

      {/* Close Button - Floating on top right, overlay on comic */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (comicSlug) {
            router.push(`/truyen-tranh/${comicSlug}`)
          } else {
            router.push('/')
          }
        }}
        className={`fixed top-4 right-4 z-[100] p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Close"
      >
        <FiX className="w-6 h-6 text-white" />
      </button>

      {/* Image Viewer */}
      {readingMode === 'single' ? (
        <div
          ref={singlePageScrollRef}
          className={`fixed inset-0 w-full ${isFullScale ? 'h-full overflow-hidden' : 'min-h-full overflow-y-auto bg-black'}`}
          onClick={() => setShowUI(!showUI)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className={`w-full ${
              isFullScale ? 'h-full flex items-center justify-center' : 'flex flex-col items-center py-8 space-y-4'
            }`}
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
      ) : (
        <div
          ref={scrollRef}
          className="fixed inset-0 overflow-y-auto bg-black px-4 md:px-8 pt-20 pb-24"
          onClick={() => setShowUI(!showUI)}
        >
          {images.length > 0 ? (
            images.map((imageUrl: string, index: number) => (
              <div key={index} className="w-full flex justify-center">
                <Image
                  src={imageUrl}
                  alt={`Page ${index + 1}`}
                  width={1200}
                  height={1800}
                  className="w-full max-w-4xl h-auto object-contain pointer-events-none select-none"
                  priority={index < 2}
                  unoptimized
                />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">
              <p>Không có ảnh nào trong chapter này</p>
            </div>
          )}
        </div>
      )}

      {readingMode === 'single' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
            }}
            disabled={currentImageIndex === 0}
            className={`fixed left-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center hover:bg-black/30 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto rounded-full ${
              showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous page"
            style={{ pointerEvents: currentImageIndex === 0 ? 'none' : 'auto' }}
          >
            <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110 shadow-lg">
              <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))
            }}
            disabled={currentImageIndex === images.length - 1}
            className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center hover:bg-black/30 transition-all disabled:opacity-0 disabled:cursor-default group pointer-events-auto rounded-full ${
              showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next page"
            style={{ pointerEvents: currentImageIndex === images.length - 1 ? 'none' : 'auto' }}
          >
            <div className="p-3 bg-netflix-gray/80 hover:bg-netflix-gray rounded-full transition-all group-hover:scale-110 shadow-lg">
              <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </button>

          <div
            className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-netflix-gray/80 backdrop-blur-sm rounded-full px-4 py-2 transition-all ${
              showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-sm">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>
        </>
      )}

      {/* Chapter selector - bottom center */}
      {sortedChapters.length > 0 && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all ${
            showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <select
            value={chapterUrl || ''}
            onChange={(e) => {
              if (!e.target.value || e.target.value === chapterUrl) return
              router.push(`/chapter?url=${encodeURIComponent(e.target.value)}&comic=${comicSlug}`)
              if (readingMode === 'single') {
                setCurrentImageIndex(0)
              }
            }}
            className="bg-black/80 text-white border border-white/20 rounded-full px-4 py-2 min-w-[200px] focus:outline-none focus:border-netflix-red transition-colors text-sm"
          >
            {sortedChapters.map((chapter) => (
              <option key={chapter.chapter_api_data} value={chapter.chapter_api_data}>
                Chap {chapter.chapter_name || currentChapterName}
              </option>
            ))}
          </select>
        </div>
      )}

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

