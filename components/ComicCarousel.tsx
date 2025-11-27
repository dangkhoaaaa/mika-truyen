/**
 * Horizontal scrolling carousel component
 * Netflix-style row of comic cards
 * Can use either manual scroll or a Swiper carousel
 */
'use client'

import React, { useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/autoplay'
import ComicCard from './ComicCard'
import { Comic } from '@/lib/services/comicApi'

interface ComicCarouselProps {
  title: string
  comics: Comic[]
  cdnUrl?: string
  useSwiper?: boolean
}

export default function ComicCarousel({
  title,
  comics,
  cdnUrl,
  useSwiper = false,
}: ComicCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigationPrevRef = React.useRef(null)
  const navigationNextRef = React.useRef(null)

  // Scroll functions for manual carousel
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

  // Swiper implementation
  if (useSwiper) {
    return (
      <div className="mb-12 comic-carousel">
        <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="flex space-x-2">
            <button
              ref={navigationPrevRef}
              className="p-2 bg-netflix-gray/50 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              ref={navigationNextRef}
              className="p-2 bg-netflix-gray/50 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={7}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          onInit={(swiper) => {
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== 'boolean'
            ) {
              swiper.params.navigation.prevEl = navigationPrevRef.current
              swiper.params.navigation.nextEl = navigationNextRef.current
              swiper.navigation.init()
              swiper.navigation.update()
            }
          }}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            480: { slidesPerView: 3, spaceBetween: 15 },
            640: { slidesPerView: 4, spaceBetween: 15 },
            768: { slidesPerView: 5, spaceBetween: 15 },
            1024: { slidesPerView: 6, spaceBetween: 16 },
            1280: { slidesPerView: 7, spaceBetween: 16 },
          }}
          className="!px-4 lg:!px-8"
        >
          {comics.map((comic) => (
            <SwiperSlide key={comic._id}>
              <ComicCard comic={comic} cdnUrl={cdnUrl} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  }

  // Original manual scroll implementation
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
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
    </div>
  )
}