import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight } from '@phosphor-icons/react';

export default function CommentInput({ postId, replyTo = null, onCommentAdded }) {
  const { user, userDoc } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const commentData = {
        authorId: user.uid,
        authorName: userDoc?.displayName || 'Member',
        authorAvatar: userDoc?.photoURL || null,
        content: content.trim(),
        replyToId: replyTo?.id || null,
        replyToName: replyTo?.name || null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1),
      });

      setContent('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-teal/20 flex items-center justify-center text-xs font-medium text-teal flex-shrink-0 overflow-hidden">
        {userDoc?.photoURL ? (
          <img src={userDoc.photoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          (userDoc?.displayName || 'M')[0]
        )}
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Add a comment...'}
        className="flex-1 px-3 py-2 bg-white border border-teal/10 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal/30"
      />
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="p-2 text-teal hover:text-teal-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <PaperPlaneRight size={18} weight="fill" />
      </button>
    </form>
  );
}
