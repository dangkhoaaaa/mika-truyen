'use client';

import { useState, useEffect } from 'react';
import { commentsService, Comment } from '@/lib/services/commentsService';
import { authService } from '@/lib/services/authService';
import { FiHeart, FiSend } from 'react-icons/fi';

interface CommentsSectionProps {
  contentType: 'movie' | 'comic';
  contentId: string;
}

export default function CommentsSection({ contentType, contentId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsService.getComments(contentType, contentId, page, 20);
      setComments(response.items);
      setHasMore(response.currentPage < response.totalPages);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const comment = await commentsService.create({
        contentType,
        contentId,
        content: newComment,
      });
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Vui lòng đăng nhập để bình luận');
    }
  };

  const handleLike = async (commentId: string, currentlyLiked: boolean) => {
    try {
      await commentsService.toggleLike(commentId, !currentlyLiked);
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, likes: currentlyLiked ? c.likes - 1 : c.likes + 1 }
          : c
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        Đang tải bình luận...
      </div>
    );
  }

  return (
    <div className="py-8 border-t border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-white">Bình luận</h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-[#2f2f2f] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition"
            />
            <button
              type="submit"
              className="bg-[#e50914] text-white px-6 py-3 rounded font-semibold hover:bg-[#f40612] transition flex items-center gap-2"
            >
              <FiSend />
              Gửi
            </button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-[#2f2f2f] rounded text-gray-400 text-center">
          Vui lòng <span className="text-[#e50914] font-semibold">đăng nhập</span> để bình luận
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-[#2f2f2f] rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center text-white font-semibold">
                  {comment.userId?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">
                      {comment.userId?.fullName || comment.userId?.username || 'Người dùng'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment._id, false)}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#e50914] transition"
                    >
                      <FiHeart />
                      <span>{comment.likes}</span>
                    </button>
                    {comment.replies && comment.replies.length > 0 && (
                      <span className="text-gray-400 text-sm">
                        {comment.replies.length} phản hồi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage(page + 1)}
          className="mt-6 w-full py-3 bg-[#2f2f2f] text-white rounded hover:bg-[#3f3f3f] transition"
        >
          Xem thêm bình luận
        </button>
      )}
    </div>
  );
}
