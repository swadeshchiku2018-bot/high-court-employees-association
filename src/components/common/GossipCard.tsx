import React, { useState } from 'react';
import { GossipPost } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Share2, ThumbsDown, Trash2, Send } from 'lucide-react';

interface GossipCardProps {
  post: GossipPost;
  onReact: (postId: string, reaction: 'like' | 'dislike' | 'share') => void;
  onComment: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
}

export const GossipCard: React.FC<GossipCardProps> = ({ post, onReact, onComment, onDelete }) => {
  const { currentUser, setShowAuthModal } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PRESIDENT' || currentUser?.role === 'SECRETARY';

  const handleAction = (action: () => void, requireLogin: boolean = false) => {
    if (requireLogin && !currentUser) {
      if (setShowAuthModal) setShowAuthModal(true);
      else alert('Please login to perform this action.');
      return;
    }
    action();
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-slate-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{post.authorName}</div>
            <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {isAdmin && onDelete && (
          <button 
            onClick={() => onDelete(post.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Delete Post (Admin)"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500">
        <button 
          onClick={() => handleAction(() => onReact(post.id, 'like'))}
          className="flex items-center gap-1.5 hover:text-pink-500 transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>

        <button 
          onClick={() => handleAction(() => onReact(post.id, 'dislike'))}
          className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
        >
          <ThumbsDown className="w-5 h-5" />
          <span className="text-sm font-medium">{post.dislikes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
        </button>

        <button 
          onClick={() => handleAction(() => onReact(post.id, 'share'))}
          className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {post.comments?.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-sm text-slate-800">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-slate-400 py-2">No comments yet. Be the first!</div>
            )}
          </div>

          <form onSubmit={submitComment} className="flex gap-2">
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={currentUser ? "Write a comment..." : "Login to comment..."}
              disabled={!currentUser}
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <button 
              type="button"
              onClick={(e) => {
                if(!currentUser) handleAction(() => {}, true);
                else submitComment(e as any);
              }}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${commentText.trim() && currentUser ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
