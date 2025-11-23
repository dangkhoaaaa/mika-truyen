/**
 * Root layout component
 * Wraps the entire application with providers and global styles
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Truyện MiKa - Đọc Truyện Tranh Online',
  description: 'Website đọc truyện tranh miễn phí, cập nhật nhanh chóng, chất lượng cao',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

