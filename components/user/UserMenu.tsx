'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, getUserData } from '@/lib/services/authService';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiClock, FiHeart, FiBookmark } from 'react-icons/fi';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUserData());
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:text-gray-300 transition"
      >
        <div className="w-8 h-8 rounded bg-[#e50914] flex items-center justify-center text-white font-semibold text-sm">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#2f2f2f] rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-white font-semibold truncate">{user.fullName || user.username}</p>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>
          </div>
          
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#3f3f3f] transition"
          >
            <FiUser />
            <span>Hồ sơ</span>
          </Link>
          
          <Link
            href="/favorites"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#3f3f3f] transition"
          >
            <FiHeart />
            <span>Yêu thích</span>
          </Link>
          
          <Link
            href="/watch-later"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#3f3f3f] transition"
          >
            <FiBookmark />
            <span>Xem sau</span>
          </Link>
          
          <Link
            href="/watch-history"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#3f3f3f] transition"
          >
            <FiClock />
            <span>Lịch sử xem</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#3f3f3f] transition border-t border-gray-700"
          >
            <FiLogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
