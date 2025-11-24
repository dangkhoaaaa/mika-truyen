/**
 * Categories listing page
 * Displays all available comic categories
 */
'use client'

import { useGetCategoriesQuery } from '@/lib/services/comicApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

export default function CategoriesPage() {
  const { data, isLoading, error } = useGetCategoriesQuery()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-gray-400">Có lỗi xảy ra</p>
      </div>
    )
  }

  const categories = data.data.items

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Thể Loại Truyện</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/the-loai/${category.slug}`}
              className="p-4 bg-netflix-dark rounded-lg hover:bg-netflix-gray transition-colors text-center"
            >
              <p className="font-medium">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


