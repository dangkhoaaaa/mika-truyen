'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { favoritesService, Favorite } from '@/lib/services/favoritesService';
import { authService } from '@/lib/services/authService';
import { FiTrash2, FiFilm, FiBook, FiHeart } from 'react-icons/fi';
import Pagination from '@/components/common/Pagination';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }
    loadFavorites();
  }, [router, currentPage]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesService.getFavorites('comic', currentPage, 20);
      setFavorites(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (contentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa khỏi danh sách yêu thích?')) return;

    try {
      await favoritesService.removeFavorite(contentId);
      setFavorites(favorites.filter((item) => item.contentId !== contentId));
    } catch (error) {
      console.error('Failed to remove:', error);
      alert('Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] py-8 pt-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiHeart className="w-8 h-8 text-[#e50914]" />
            <h1 className="text-3xl font-bold text-white">Danh sách yêu thích</h1>
          </div>
          

        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-xl mb-4">Chưa có nội dung yêu thích</div>
            <Link
              href="/"
              className="text-[#e50914] hover:underline font-semibold"
            >
              Khám phá truyện ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((item) => (
              <div
                key={item._id}
                className="group relative bg-[#2f2f2f] rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <Link href={`/${item.contentType === 'movie' ? 'phim' : 'truyen-tranh'}/${item.contentSlug || item.contentId}`}>
                  <div className="aspect-[2/3] relative bg-[#1a1a1a]">
                    {item.contentThumb ? (
                      <Image
                        src={item.contentThumb}
                        alt={item.contentTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiBook className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </Link>
                
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold mb-1 line-clamp-2">
                    {item.contentTitle}
                  </h3>
                  <p className="text-xs text-gray-300">
                    Chap {item.contentTotalChapters}
                  </p>
                  {item.contentStatus && (
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                        item.contentStatus === 'ongoing'
                          ? 'bg-green-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {item.contentStatus === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}
                    </span>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(item.contentId)}
                  className="absolute top-2 right-2 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <FiTrash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            </div>
            {totalPages >= 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
