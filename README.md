# Truyện MiKa - Netflix-style Comic Reading Platform

A modern, Netflix-inspired web application for reading Vietnamese comics (truyện tranh) built with Next.js, React, Redux Toolkit, and TypeScript.

## Features

- 🎬 **Netflix-style UI**: Beautiful, dark-themed interface with smooth animations
- 📚 **Comic Browsing**: Browse comics by category, search, and view latest updates
- 📖 **Chapter Reader**: Full-featured chapter reader with keyboard navigation
- 🔍 **Search Functionality**: Search comics by keyword
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Performance**: Optimized with Next.js 14 and RTK Query caching

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit (RTK Query)
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **API**: otruyenapi.com

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── chapter/           # Chapter reader page
│   ├── danh-sach/         # Comic list pages
│   ├── the-loai/          # Category pages
│   ├── tim-kiem/          # Search page
│   ├── truyen-tranh/      # Comic detail pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # Redux provider
├── components/            # React components
│   ├── ComicCard.tsx      # Comic card component
│   ├── ComicCarousel.tsx  # Horizontal carousel
│   ├── Header.tsx         # Navigation header
│   ├── HeroBanner.tsx     # Hero banner
│   └── LoadingSpinner.tsx # Loading indicator
├── lib/                   # Utilities and configurations
│   ├── services/          # RTK Query API slices
│   ├── slices/            # Redux slices
│   ├── hooks.ts           # Typed Redux hooks
│   └── store.ts           # Redux store
└── public/                # Static assets
```

## API Endpoints Used

- `GET /home` - Home page comics
- `GET /truyen-tranh/{slug}` - Comic details
- `GET /the-loai` - All categories
- `GET /the-loai/{slug}` - Comics by category
- `GET /danh-sach/{type}` - Comics by list type
- `GET /tim-kiem?keyword={keyword}` - Search comics
- `GET {chapter_api_data}` - Chapter images

## Features in Detail

### Home Page
- Hero banner with featured comics
- Auto-rotating carousel
- Multiple comic carousels (New releases, All comics)

### Comic Detail Page
- Full comic information
- Chapter list with server selection
- Category tags
- Author information

### Chapter Reader
- Full-screen image viewer
- Keyboard navigation (Arrow keys, Escape)
- Image pagination
- Progress indicator

### Search & Categories
- Real-time search
- Category filtering
- Pagination support

## Code Quality

- ✅ TypeScript for type safety
- ✅ Professional code structure
- ✅ English comments throughout
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ SEO optimized

## License

This project is for educational purposes.

## Credits

- API provided by [otruyenapi.com](https://docs.otruyenapi.com/)
- Design inspired by Netflix

# mika-truyen

