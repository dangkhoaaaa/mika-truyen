/**
 * Comic carousel with pagination
 * Similar to ComicCarousel but with pagination support
 */
'use client'

import React, { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ComicCard from './ComicCard'
import { Comic } from '@/lib/services/comicApi'
import Pagination from './common/Pagination'
import Link from 'next/link'

interface ComicCarouselWithPaginationProps {
  title: string
  comics: Comic[]
  cdnUrl?: string
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  viewAllLink?: string
}

export default function ComicCarouselWithPagination({
  title,
  comics,
  cdnUrl,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  viewAllLink,
}: ComicCarouselWithPaginationProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (!comics || comics.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="flex items-center gap-4">
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Xem tất cả →
            </Link>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-netflix-gray/50 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-netflix-gray/50 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto hide-scrollbar px-4 lg:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {comics.map((comic) => (
            <div
              key={comic._id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]"
            >
              <ComicCard comic={comic} cdnUrl={cdnUrl} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 lg:px-8 mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

