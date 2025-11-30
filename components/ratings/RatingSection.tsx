'use client';

import { useState, useEffect, useCallback } from 'react';
import { ratingsService, ContentRating } from '@/lib/services/ratingsService';
import { authService } from '@/lib/services/authService';
import { FiStar } from 'react-icons/fi';

interface RatingSectionProps {
  contentType: 'movie' | 'comic';
  contentId: string;
}

export default function RatingSection({ contentType, contentId }: RatingSectionProps) {
  const [rating, setRating] = useState<ContentRating | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadRatings = useCallback(async () => {
    try {
      setLoading(true);
      const [contentRatingResponse, userRatingResponse] = await Promise.all([
        ratingsService.getContentRating(contentType, contentId),
        isAuthenticated
          ? ratingsService.getUserRating(contentType, contentId)
          : Promise.resolve(null),
      ]);
      
      setRating(contentRatingResponse);
      setUserRating(userRatingResponse?.stars || null);
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, contentType, contentId]);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    loadRatings();
  }, [contentId, loadRatings]);

  const handleRate = async (stars: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      await ratingsService.createOrUpdate({
        contentType,
        contentId,
        stars,
      });
      setUserRating(stars);
      await loadRatings();
    } catch (error) {
      console.error('Failed to rate:', error);
      alert('Không thể đánh giá. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        Đang tải đánh giá...
      </div>
    );
  }

  const displayRating = userRating || hoveredStar || 0;
  const averageRating = rating?.averageRating || 0;
  const totalRatings = rating?.totalRatings || 0;

  return (
    <div className="py-8 border-t border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-white">Đánh giá</h3>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Rating Display */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-6 h-6 ${
                      star <= averageRating
                        ? 'fill-[#e50914] text-[#e50914]'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-400 text-sm">
                {totalRatings} {totalRatings === 1 ? 'đánh giá' : 'đánh giá'}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          {rating?.ratingDistribution && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = rating.ratingDistribution[star as keyof typeof rating.ratingDistribution];
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-8">{star}</span>
                    <FiStar className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e50914] transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Rating */}
        <div className="md:w-64">
          <h4 className="text-lg font-semibold mb-4 text-white">
            {userRating ? 'Đánh giá của bạn' : 'Đánh giá truyện này'}
          </h4>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className={`transition-transform hover:scale-110 ${
                  star <= displayRating
                    ? 'text-[#e50914]'
                    : 'text-gray-600'
                }`}
              >
                <FiStar
                  className={`w-8 h-8 ${
                    star <= displayRating
                      ? 'fill-[#e50914]'
                      : ''
                  }`}
                />
              </button>
            ))}
          </div>
          {userRating && (
            <button
              onClick={() => handleRate(0)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition"
            >
              Xóa đánh giá
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
