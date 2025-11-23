/**
 * Main header component
 * Netflix-style navigation bar with search and menu functionality
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiSearch, FiMenu, FiX } from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleSearch, toggleMenu } from '@/lib/slices/uiSlice'

function HeaderContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isSearchOpen, isMenuOpen } = useAppSelector((state) => state.ui)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`)
      dispatch(toggleSearch())
      setSearchQuery('')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-netflix-black/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-netflix-red">MiKa</span>
            <span className="text-sm text-gray-300 hidden sm:inline">
              Truyện
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-netflix-red transition-colors"
            >
              Trang Chủ
            </Link>
            <Link
              href="/danh-sach/truyen-moi"
              className="text-sm font-medium hover:text-netflix-red transition-colors"
            >
              Truyện Mới
            </Link>
            <Link
              href="/the-loai"
              className="text-sm font-medium hover:text-netflix-red transition-colors"
            >
              Thể Loại
            </Link>
          </nav>

          {/* Search and Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => dispatch(toggleMenu())}
              className="md:hidden p-2 hover:bg-netflix-gray rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-netflix-gray">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm truyện..."
                className="flex-1 bg-netflix-dark border border-netflix-gray rounded px-4 py-2 focus:outline-none focus:border-netflix-red"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-netflix-red hover:bg-red-700 rounded transition-colors"
              >
                Tìm
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-netflix-gray">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => dispatch(toggleMenu())}
                className="text-sm font-medium hover:text-netflix-red transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                href="/danh-sach/truyen-moi"
                onClick={() => dispatch(toggleMenu())}
                className="text-sm font-medium hover:text-netflix-red transition-colors"
              >
                Truyện Mới
              </Link>
              <Link
                href="/the-loai"
                onClick={() => dispatch(toggleMenu())}
                className="text-sm font-medium hover:text-netflix-red transition-colors"
              >
                Thể Loại
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default function Header() {
  const pathname = usePathname()
  
  // Hide header on chapter page
  if (pathname === '/chapter') {
    return null
  }

  return <HeaderContent />
}

