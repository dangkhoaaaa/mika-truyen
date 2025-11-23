/**
 * Redux store configuration using Redux Toolkit
 * Centralized state management for the application
 */
import { configureStore } from '@reduxjs/toolkit'
import { comicApi } from './services/comicApi'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    // API slice for data fetching
    [comicApi.reducerPath]: comicApi.reducer,
    // UI state management
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(comicApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

