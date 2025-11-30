'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService, UserResponse } from '@/lib/services/userService';
import { authService } from '@/lib/services/authService';
import { FiUser, FiMail, FiEdit2, FiCamera } from 'react-icons/fi';

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
      setFullName(userData.fullName || '');
      setBio(userData.bio || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await userService.updateProfile({ fullName, bio });
      setUser(updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Cập nhật thất bại');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updated = await userService.uploadAvatar(file);
      setUser(updated);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Upload ảnh thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] pt-16">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] pt-16">
        <div className="text-white text-xl">Không tìm thấy thông tin</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">Hồ sơ của tôi</h1>

        <div className="bg-[#2f2f2f] rounded-lg p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {user.avatar ? (
                <img
                  src={`http://localhost:3000${user.avatar}`}
                  alt={user.fullName || user.username}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#e50914] flex items-center justify-center text-white text-4xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#e50914] p-2 rounded-full cursor-pointer hover:bg-[#f40612] transition">
                <FiCamera className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-3 rounded">
                <FiMail className="text-gray-400" />
                <span className="text-white">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Tên người dùng</label>
              <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-3 rounded">
                <FiUser className="text-gray-400" />
                <span className="text-white">{user.username}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Họ và tên</label>
              {editing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914] transition"
                />
              ) : (
                <div className="bg-[#1a1a1a] px-4 py-3 rounded text-white">
                  {user.fullName || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Giới thiệu</label>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914] transition"
                />
              ) : (
                <div className="bg-[#1a1a1a] px-4 py-3 rounded text-white min-h-[100px]">
                  {user.bio || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-[#e50914] text-white px-6 py-3 rounded font-semibold hover:bg-[#f40612] transition"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFullName(user.fullName || '');
                      setBio(user.bio || '');
                    }}
                    className="bg-[#2f2f2f] text-white px-6 py-3 rounded font-semibold hover:bg-[#3f3f3f] transition"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-[#e50914] text-white px-6 py-3 rounded font-semibold hover:bg-[#f40612] transition flex items-center gap-2"
                >
                  <FiEdit2 />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
