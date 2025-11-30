'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { watchHistoryService, WatchHistory } from '@/lib/services/watchHistoryService';
import { authService } from '@/lib/services/authService';
import { FiTrash2, FiFilm, FiBook } from 'react-icons/fi';

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await watchHistoryService.getWatchHistory('comic');
      setHistory(response.items);
    } catch (error) {
      console.error('Failed to load watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục này khỏi lịch sử?')) return;

    try {
      await watchHistoryService.deleteWatchHistory(contentId);
      setHistory(history.filter((item) => item.contentId !== contentId));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Xóa thất bại');
    }
  };

  const handleClear = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) return;

    try {
      await watchHistoryService.clearWatchHistory('comic');
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear:', error);
      alert('Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] pt-16">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] py-8 pt-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Lịch sử xem</h1>
          
          <div className="flex items-center gap-4">


            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">Chưa có lịch sử xem</div>
            <Link
              href="/"
              className="text-[#e50914] hover:underline font-semibold"
            >
              Khám phá truyện ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="group relative bg-[#2f2f2f] rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <Link href={`/${item.contentType === 'movie' ? 'phim' : 'truyen-tranh'}/${item.contentId}`}>
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
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">Xem tiếp</span>
                    </div>
                  </div>
                </Link>
                
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold mb-1 line-clamp-2">
                    {item.contentTitle}
                  </h3>
                  {item.episodeName && (
                    <p className="text-gray-400 text-xs mb-1">
                      {item.episodeName}
                    </p>
                  )}
                  {item.chapterName && (
                    <p className="text-gray-400 text-xs mb-1">
                      {item.chapterName}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">
                    {new Date(item.lastWatchedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.contentId)}
                  className="absolute top-2 right-2 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <FiTrash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
