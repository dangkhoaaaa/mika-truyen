'use client';

import { useState, useEffect, useCallback } from 'react';
import { watchLaterService } from '@/lib/services/watchLaterService';
import { authService } from '@/lib/services/authService';
import { FiClock } from 'react-icons/fi';

interface WatchLaterButtonProps {
  contentId: string;
  contentTitle: string;
  contentThumb?: string;
  contentSlug?: string;
}

export default function WatchLaterButton({
  contentId,
  contentTitle,
  contentThumb,
  contentSlug,
}: WatchLaterButtonProps) {
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkWatchLater = useCallback(async () => {
    try {
      const inWatchLater = await watchLaterService.checkWatchLater(contentId);
      setIsInWatchLater(inWatchLater);
    } catch (error) {
      console.error('Failed to check watch later:', error);
    }
  }, [contentId]);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (isAuthenticated) {
      checkWatchLater();
    }
  }, [contentId, isAuthenticated, checkWatchLater]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào xem sau');
      return;
    }

    setLoading(true);
    try {
      if (isInWatchLater) {
        await watchLaterService.removeWatchLater(contentId);
        setIsInWatchLater(false);
      } else {
        await watchLaterService.addWatchLater({
          contentType: 'comic',
          contentId,
          contentTitle,
          contentThumb,
          contentSlug,
        });
        setIsInWatchLater(true);
      }
    } catch (error: any) {
      console.error('Failed to toggle watch later:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition ${
        isInWatchLater
          ? 'bg-[#e50914] text-white hover:bg-[#f40612]'
          : 'bg-[#2f2f2f] text-white hover:bg-[#3f3f3f]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <FiClock className={`w-5 h-5 ${isInWatchLater ? 'fill-current' : ''}`} />
      <span>{isInWatchLater ? 'Đã thêm' : 'Xem sau'}</span>
    </button>
  );
}

