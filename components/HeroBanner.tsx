/**
 * Hero banner component
 * Netflix-style featured comic banner with background image
 */
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Comic } from '@/lib/services/comicApi'
import { useState, useEffect } from 'react'

interface HeroBannerProps {
  comics: Comic[]
  cdnUrl?: string
}

export default function HeroBanner({ comics, cdnUrl = 'https://img.otruyenapi.com' }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate featured comics
  useEffect(() => {
    if (comics.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(comics.length, 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [comics.length])

  if (!comics || comics.length === 0) return null

  const featuredComic = comics[currentIndex]
  const imageUrl = `${cdnUrl}/uploads/comics/${featuredComic.thumb_url}`
  const latestChapter = featuredComic.chaptersLatest?.[0]?.chapter_name || '1'

  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={featuredComic.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 line-clamp-2">
              {featuredComic.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 line-clamp-3">
              {featuredComic.origin_name?.[0] || 'Đọc truyện tranh online miễn phí'}
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href={`/truyen-tranh/${featuredComic.slug}`}
                className="px-8 py-3 bg-white text-netflix-black font-semibold rounded hover:bg-opacity-90 transition-all"
              >
                Đọc Ngay
              </Link>
              <Link
                href={`/truyen-tranh/${featuredComic.slug}?chapter=${latestChapter}`}
                className="px-8 py-3 bg-netflix-gray/70 text-white font-semibold rounded hover:bg-netflix-gray/90 transition-all"
              >
                Chap {latestChapter}
              </Link>
            </div>

            {/* Category tags */}
            {featuredComic.category && featuredComic.category.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {featuredComic.category.slice(0, 3).map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-netflix-gray/50 rounded-full text-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicators */}
      {comics.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {Array.from({ length: Math.min(comics.length, 5) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}


