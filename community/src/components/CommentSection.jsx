import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ChatCircle } from '@phosphor-icons/react';
import CommentInput from './CommentInput';
import { cn } from '../lib/utils';

function CommentBubble({ comment, onReply }) {
  const createdAt = comment.createdAt?.toDate?.();
  return (
    <div className="flex gap-2 group">
      <div className="w-7 h-7 rounded-full bg-sage/30 flex items-center justify-center text-xs font-medium text-teal-dark flex-shrink-0 overflow-hidden mt-0.5">
        {comment.authorAvatar ? (
          <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (comment.authorName || 'M')[0]
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl px-3 py-2 border border-teal/5">
          {comment.replyToName && (
            <span className="text-xs text-clay font-medium">@{comment.replyToName} </span>
          )}
          <span className="text-xs font-semibold text-teal-dark">{comment.authorName}</span>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          {createdAt && (
            <span className="text-[11px] text-gray-400">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => onReply({ id: comment.authorId, name: comment.authorName })}
            className="text-[11px] text-gray-400 hover:text-teal font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId, commentCount = 0 }) {
  const [comments, setComments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const PREVIEW_COUNT = 3;

  useEffect(() => {
    if (!expanded) return;
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [postId, expanded]);

  // Load preview (last 3) when not expanded
  useEffect(() => {
    if (expanded) return;
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(PREVIEW_COUNT)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).reverse());
    });
    return () => unsubscribe();
  }, [postId, expanded]);

  return (
    <div className="mt-3 pt-3 border-t border-teal/5">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal transition-colors mb-3"
      >
        <ChatCircle size={16} />
        {commentCount > 0 ? (
          <span>
            {expanded ? 'Hide comments' : `${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
            {!expanded && commentCount > PREVIEW_COUNT && ' — View all'}
          </span>
        ) : (
          <span>Add a comment</span>
        )}
      </button>

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
            />
          ))}
        </div>
      )}

      {/* Comment input */}
      <CommentInput
        postId={postId}
        replyTo={replyTo}
        onCommentAdded={() => {
          setReplyTo(null);
          if (!expanded) setExpanded(true);
        }}
      />
      {replyTo && (
        <button
          onClick={() => setReplyTo(null)}
          className="text-xs text-gray-400 hover:text-gray-600 mt-1 ml-9"
        >
          Cancel reply to {replyTo.name}
        </button>
      )}
    </div>
  );
}
