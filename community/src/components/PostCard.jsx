import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PushPin } from '@phosphor-icons/react';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';
import { cn } from '../lib/utils';

const CATEGORY_STYLES = {
  awareness: 'bg-blue-50 text-blue-700',
  activation: 'bg-amber-50 text-amber-700',
  application: 'bg-emerald-50 text-emerald-700',
  ascension: 'bg-purple-50 text-purple-700',
  general: 'bg-gray-50 text-gray-600',
};

export default function PostCard({ post }) {
  const createdAt = post.createdAt?.toDate?.();

  return (
    <article className="bg-white rounded-xl shadow-sm border border-teal/8 overflow-hidden">
      {/* Image — full-width above content if present */}
      {post.imageUrl && (
        <div className="w-full max-h-[400px] overflow-hidden">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (post.authorName || 'J')[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-teal-dark text-sm">{post.authorName}</span>
              {post.category && post.category !== 'general' && (
                <span className={cn(
                  'text-[11px] font-medium px-2 py-0.5 rounded-full capitalize',
                  CATEGORY_STYLES[post.category] || CATEGORY_STYLES.general
                )}>
                  {post.category}
                </span>
              )}
              {post.pinned && (
                <PushPin size={14} weight="fill" className="text-clay" />
              )}
            </div>
            {createdAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Reactions */}
        <div className="mt-4">
          <ReactionBar postId={post.id} reactionCounts={post.reactionCounts} />
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} commentCount={post.commentCount} />
      </div>
    </article>
  );
}
