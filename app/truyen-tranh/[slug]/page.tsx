/**
 * Comic detail page
 * Displays comic information and chapter list
 */
'use client'

import { useParams } from 'next/navigation'
import { useGetComicBySlugQuery } from '@/lib/services/comicApi'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useState } from 'react'

export default function ComicDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data, isLoading, error } = useGetComicBySlugQuery(slug)
  const [selectedServer, setSelectedServer] = useState(0)

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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Danh Sách Chapter</h2>

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
                    href={`/chapter?url=${encodeURIComponent(chapter.chapter_api_data)}`}
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
    </div>
  )
}

