'use client';

import { useState } from 'react';
import { authService, RegisterDto } from '@/lib/services/authService';
import { useRouter } from 'next/navigation';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerDto: RegisterDto = { email, password, username, fullName };
      await authService.register(registerDto);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141414] rounded-lg w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative mt-[500px]">
        <h2 className="text-3xl font-bold mb-6 text-white">Đăng ký</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#2f2f2f] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#2f2f2f] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Họ và tên (tùy chọn)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#2f2f2f] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#2f2f2f] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e50914] text-white py-3 rounded font-semibold hover:bg-[#f40612] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">
          <span>Đã có tài khoản? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-white hover:underline font-semibold"
          >
            Đăng nhập
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
