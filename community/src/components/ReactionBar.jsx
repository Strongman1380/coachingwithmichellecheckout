import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const REACTIONS = [
  { emoji: '❤️', key: 'heart' },
  { emoji: '🔥', key: 'fire' },
  { emoji: '🙌', key: 'hands' },
  { emoji: '⭐', key: 'star' },
];

export default function ReactionBar({ postId, reactionCounts = {} }) {
  const { user } = useAuth();
  const [myReaction, setMyReaction] = useState(null);
  const [localCounts, setLocalCounts] = useState(reactionCounts);
  const [animating, setAnimating] = useState(null);

  useEffect(() => {
    setLocalCounts(reactionCounts);
  }, [reactionCounts]);

  useEffect(() => {
    if (!user) return;
    const reactionId = `${user.uid}_${postId}`;
    getDoc(doc(db, 'reactions', reactionId)).then((snap) => {
      if (snap.exists()) {
        setMyReaction(snap.data().emoji);
      }
    });
  }, [user, postId]);

  const handleReaction = async (key) => {
    if (!user) return;
    const reactionId = `${user.uid}_${postId}`;
    const reactionRef = doc(db, 'reactions', reactionId);
    const postRef = doc(db, 'posts', postId);

    try {
      if (myReaction === key) {
        // Remove reaction
        await deleteDoc(reactionRef);
        await updateDoc(postRef, {
          [`reactionCounts.${key}`]: increment(-1),
        });
        setLocalCounts((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
        setMyReaction(null);
      } else {
        // Remove old reaction if exists
        if (myReaction) {
          await updateDoc(postRef, {
            [`reactionCounts.${myReaction}`]: increment(-1),
          });
          setLocalCounts((prev) => ({
            ...prev,
            [myReaction]: Math.max(0, (prev[myReaction] || 0) - 1),
          }));
        }
        // Add new reaction
        await setDoc(reactionRef, {
          userId: user.uid,
          postId,
          emoji: key,
          createdAt: new Date(),
        });
        await updateDoc(postRef, {
          [`reactionCounts.${key}`]: increment(1),
        });
        setLocalCounts((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        setMyReaction(key);
        setAnimating(key);
        setTimeout(() => setAnimating(null), 300);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(({ emoji, key }) => {
        const count = localCounts[key] || 0;
        const isActive = myReaction === key;
        return (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all',
              isActive
                ? 'bg-teal/10 ring-1 ring-teal/30'
                : 'hover:bg-gray-100',
              animating === key && 'scale-110'
            )}
          >
            <span className={cn('transition-transform', animating === key && 'scale-125')}>
              {emoji}
            </span>
            {count > 0 && (
              <span className={cn('text-xs', isActive ? 'text-teal font-medium' : 'text-gray-500')}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
