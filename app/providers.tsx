/**
 * Client-side providers wrapper
 * Provides Redux store to the application
 */
'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import Header from '@/components/Header'
import axios from 'axios'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Gọi API ping để kích hoạt render khi người dùng vào web lần đầu
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const pingApi = async () => {
      try {
        await axios.get(`${API_BASE_URL}/ping`, { timeout: 5000 });
      } catch (error) {
        // Ignore errors, just wake up the server
        console.log('Ping API called');
      }
    };
    pingApi();
  }, []);

  return (
    <Provider store={store}>
      <Header />
      {children}
    </Provider>
  )
}

