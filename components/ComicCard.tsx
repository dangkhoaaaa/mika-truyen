/**
 * Comic card component
 * Displays comic thumbnail with hover effects (Netflix-style)
 */
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Comic } from '@/lib/services/comicApi'
import { useState } from 'react'

interface ComicCardProps {
  comic: Comic
  cdnUrl?: string
}

export default function ComicCard({ comic, cdnUrl = 'https://img.otruyenapi.com' }: ComicCardProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = `${cdnUrl}/uploads/comics/${comic.thumb_url}`

  // Get latest chapter number
  const latestChapter = comic.chaptersLatest?.[0]?.chapter_name || 'N/A'

  return (
    <Link
      href={`/truyen-tranh/${comic.slug}`}
      className="group relative block transition-transform duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-netflix-dark">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={comic.name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-70"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-netflix-gray">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-sm font-semibold line-clamp-2 mb-1">
            {comic.name}
          </h3>
          <p className="text-xs text-gray-300">
            Chap {latestChapter}
          </p>
          {comic.status && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                comic.status === 'ongoing'
                  ? 'bg-green-600'
                  : 'bg-blue-600'
              }`}
            >
              {comic.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}
            </span>
          )}
        </div>
      </div>

      {/* Title below card (mobile) */}
      <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-netflix-red transition-colors md:hidden">
        {comic.name}
      </h3>
    </Link>
  )
}

