/**
 * Comic detail page
 * Displays comic information and chapter list
 */
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useGetComicBySlugQuery } from '@/lib/services/comicApi'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import WatchLaterButton from '@/components/watch-later/WatchLaterButton'
import CommentsSection from '@/components/comments/CommentsSection'
import RatingSection from '@/components/ratings/RatingSection'
import { useState, useEffect } from 'react'
import { watchHistoryService } from '@/lib/services/watchHistoryService'
import { authService } from '@/lib/services/authService'

export default function ComicDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { data, isLoading, error } = useGetComicBySlugQuery(slug)
  const [selectedServer, setSelectedServer] = useState(0)
  const [watchHistory, setWatchHistory] = useState<any>(null)

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (authService.isAuthenticated() && data?.data?.item?._id) {
        try {
          const history = await watchHistoryService.getWatchHistoryByContentId(data.data.item._id);
          if (history) {
            setWatchHistory(history);
          }
        } catch (error) {
          if ((error as any)?.response?.status !== 404) {
            console.error('Failed to fetch watch history:', error);
          }
        }
      }
    };

    fetchWatchHistory();
  }, [data]);

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data || !data.data.item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy truyện</h2>
          <Link
            href="/"
            className="text-netflix-red hover:underline"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const comic = data.data.item
  const cdnUrl = data.data.APP_DOMAIN_CDN_IMAGE
  const imageUrl = `${cdnUrl}/uploads/comics/${comic.thumb_url}`
  const chapters = comic.chapters || []
  const defaultServer = chapters[0]
  const firstChapter = defaultServer?.server_data?.[0]
  const latestChapter =
    defaultServer?.server_data &&
    defaultServer.server_data[defaultServer.server_data.length - 1]
  const activeServer = chapters[selectedServer] || defaultServer

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={comic.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/80 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 max-w-6xl">
              {/* Thumbnail */}
              <div className="relative w-48 h-64 md:w-56 md:h-80 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={comic.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 224px"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {comic.name}
                </h1>
                {comic.origin_name && comic.origin_name.length > 0 && (
                  <p className="text-lg text-gray-300 mb-4">
                    {comic.origin_name.join(', ')}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {comic.status && (
                    <span
                      className={`px-3 py-1 rounded ${
                        comic.status === 'ongoing'
                          ? 'bg-green-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {comic.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}
                    </span>
                  )}
                  {comic.author && comic.author.length > 0 && (
                    <span className="text-gray-300">
                      Tác giả: {comic.author.join(', ')}
                    </span>
                  )}
                </div>

                {/* Categories */}
                {comic.category && comic.category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {comic.category.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/the-loai/${cat.slug}`}
                        className="px-3 py-1 bg-netflix-gray/50 rounded-full text-sm hover:bg-netflix-gray transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Description */}
                {comic.content && (
                  <div
                    className="text-gray-300 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: comic.content }}
                  />
                )}

                <div className="mt-6 flex flex-wrap gap-4 items-center">
                  {watchHistory && (
                    <button
                      onClick={() => {
                        router.push(
                          `/chapter?url=${encodeURIComponent(watchHistory.chapterId)}&comic=${slug}`
                        )
                      }}
                      className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Đọc Tiếp
                      {watchHistory.chapterName && ` - ${watchHistory.chapterName}`}
                    </button>
                  )}

                  {(firstChapter || latestChapter) && (
                    <>
                      {firstChapter && (
                        <button
                          onClick={async () => {
                            // Save watch history before navigating
                            if (authService.isAuthenticated()) {
                              try {
                                await watchHistoryService.createOrUpdate({
                                  contentType: 'comic',
                                  contentId: comic._id || slug,
                                  contentTitle: comic.name,
                                  contentThumb: imageUrl,
                                  chapterId: firstChapter.chapter_api_data,
                                  chapterName: firstChapter.chapter_name,
                                  chapterNumber: 1,
                                  progress: 0,
                                });
                              } catch (error) {
                                console.error('Failed to save watch history:', error);
                              }
                            }
                            router.push(
                              `/chapter?url=${encodeURIComponent(firstChapter.chapter_api_data)}&comic=${slug}`
                            );
                          }}
                          className="inline-flex items-center px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Đọc Từ Đầu
                        </button>
                      )}
                      {latestChapter && (
                        <button
                          onClick={async () => {
                            // Save watch history before navigating
                            if (authService.isAuthenticated()) {
                              try {
                                await watchHistoryService.createOrUpdate({
                                  contentType: 'comic',
                                  contentId: comic._id || slug,
                                  contentTitle: comic.name,
                                  contentThumb: imageUrl,
                                  chapterId: latestChapter.chapter_api_data,
                                  chapterName: latestChapter.chapter_name,
                                  chapterNumber: Number(latestChapter.chapter_name.split(' ')[1]),
                                  progress: 0,
                                });
                              } catch (error) {
                                console.error('Failed to save watch history:', error);
                              }
                            }
                            router.push(
                              `/chapter?url=${encodeURIComponent(latestChapter.chapter_api_data)}&comic=${slug}`
                            );
                          }}
                          className="inline-flex items-center px-6 py-3 bg-netflix-gray/80 hover:bg-netflix-gray text-white font-semibold rounded-lg transition-colors border border-white/10"
                        >
                          Chap Mới Nhất
                        </button>
                      )}
                    </>
                  )}
                  <FavoriteButton
                    contentId={comic._id || slug}
                    contentTitle={comic.name}
                    contentThumb={imageUrl}
                    contentSlug={slug}
                  />
                  <WatchLaterButton
                    contentId={comic._id || slug}
                    contentTitle={comic.name}
                    contentThumb={imageUrl}
                    contentSlug={slug}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Danh Sách Chapter</h2>
          {activeServer?.server_data && activeServer.server_data.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Nhảy tới:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return
                  router.push(`/chapter?url=${encodeURIComponent(e.target.value)}&comic=${slug}`)
                }}
                className="bg-netflix-dark border border-netflix-gray text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-netflix-red min-w-[200px]"
              >
                <option value="" disabled>
                  Chọn chapter
                </option>
                {activeServer.server_data
                  .slice()
                  .reverse()
                  .map((chapter) => (
                    <option key={chapter.chapter_api_data} value={chapter.chapter_api_data}>
                      Chap {chapter.chapter_name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {chapters.length === 0 ? (
          <p className="text-gray-400">Chưa có chapter nào</p>
        ) : (
          <>
            {/* Server Selection */}
            {chapters.length > 1 && (
              <div className="flex gap-2 mb-4">
                {chapters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedServer(index)}
                    className={`px-4 py-2 rounded ${
                      selectedServer === index
                        ? 'bg-netflix-red'
                        : 'bg-netflix-gray/50 hover:bg-netflix-gray'
                    } transition-colors`}
                  >
                    {chapters[index].server_name}
                  </button>
                ))}
              </div>
            )}

            {/* Chapter List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {chapters[selectedServer]?.server_data
                .slice()
                .reverse()
                .map((chapter) => (
                  <Link
                    key={chapter.chapter_api_data}
                    href={`/chapter?url=${encodeURIComponent(chapter.chapter_api_data)}&comic=${slug}`}
                    onClick={async () => {
                      // Save watch history when clicking chapter
                      if (authService.isAuthenticated()) {
                        try {
                          await watchHistoryService.createOrUpdate({
                            contentType: 'comic',
                            contentId: comic._id || slug,
                            contentTitle: comic.name,
                            contentThumb: imageUrl,
                            chapterId: chapter.chapter_api_data,
                            chapterName: chapter.chapter_name,
                            chapterNumber: Number(chapter.chapter_name.split(' ')[1]),
                            progress: 0,
                          });
                        } catch (error) {
                          console.error('Failed to save watch history:', error);
                        }
                      }
                    }}
                    className="p-3 bg-netflix-dark rounded hover:bg-netflix-gray transition-colors text-center"
                  >
                    <p className="text-sm font-medium">
                      {chapter.chapter_name}
                    </p>
                    {chapter.chapter_title && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {chapter.chapter_title}
                      </p>
                    )}
                  </Link>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Ratings Section */}
      <div className="container mx-auto px-4 lg:px-8">
        <RatingSection contentType="comic" contentId={comic._id || slug} />
      </div>

      {/* Comments Section */}
      <div className="container mx-auto px-4 lg:px-8">
        <CommentsSection contentType="comic" contentId={comic._id || slug} />
      </div>
    </div>
  )
}

