/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.otruyenapi.com', 'otruyenapi.com', 'sv1.otruyencdn.com', 'phimimg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.otruyenapi.com',
      },
      {
        protocol: 'https',
        hostname: 'otruyenapi.com',
      },
      {
        protocol: 'https',
        hostname: 'sv1.otruyencdn.com',
      },
      {
        protocol: 'https',
        hostname: 'phimimg.com',
      },
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig

