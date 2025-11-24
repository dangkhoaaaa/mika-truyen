/**
 * UI state slice for managing application UI state
 * Handles modals, loading states, and UI preferences
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isSearchOpen: boolean
  isMenuOpen: boolean
  selectedComic: string | null
  readingHistory: string[]
  theme: 'dark' | 'light'
}

const initialState: UIState = {
  isSearchOpen: false,
  isMenuOpen: false,
  selectedComic: null,
  readingHistory: [],
  theme: 'dark',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen
    },
    closeSearch: (state) => {
      state.isSearchOpen = false
    },
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen
    },
    closeMenu: (state) => {
      state.isMenuOpen = false
    },
    setSelectedComic: (state, action: PayloadAction<string | null>) => {
      state.selectedComic = action.payload
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      if (!state.readingHistory.includes(action.payload)) {
        state.readingHistory.unshift(action.payload)
        // Keep only last 50 items
        if (state.readingHistory.length > 50) {
          state.readingHistory = state.readingHistory.slice(0, 50)
        }
      }
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload
    },
  },
})

export const {
  toggleSearch,
  closeSearch,
  toggleMenu,
  closeMenu,
  setSelectedComic,
  addToHistory,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer


