/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: '#141414',
          dark: '#181818',
          gray: '#2F2F2F',
          red: '#E50914',
        },
      },
      backgroundImage: {
        'gradient-to-b': 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
      },
    },
  },
  plugins: [],
}


