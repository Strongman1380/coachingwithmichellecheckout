import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/firebase';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, startAfter, getDocs,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { SignOut, GearSix, BellRinging } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';
import NotificationBell from '../components/NotificationBell';
import InstallBanner from '../components/InstallBanner';

const PAGE_SIZE = 20;

export default function CommunityPage() {
  const { user, userDoc, isAdmin, signOut } = useAuth();
  const { permissionState, requestPermission, isSupported } = useNotifications();
  const { canInstall, install } = useInstallPrompt();
  const navigate = useNavigate();

  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Show notification prompt after 2nd visit if not yet enabled
  useEffect(() => {
    if (isSupported && permissionState === 'default' && userDoc && !userDoc.notificationsEnabled) {
      const visits = parseInt(localStorage.getItem('sovereign_community_visits') || '0', 10) + 1;
      localStorage.setItem('sovereign_community_visits', String(visits));
      if (visits >= 2) {
        setShowNotifPrompt(true);
      }
    }
  }, [isSupported, permissionState, userDoc]);

  // Fetch pinned posts (real-time)
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('pinned', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPinnedPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Fetch feed posts (real-time for first page)
  useEffect(() => {
    const constraints = [
      collection(db, 'posts'),
      where('pinned', '==', false),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    ];
    if (category !== 'all') {
      constraints.splice(1, 0, where('category', '==', category));
    }

    const q = query(...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(newPosts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    });
    return () => unsubscribe();
  }, [category]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);

    const constraints = [
      collection(db, 'posts'),
      where('pinned', '==', false),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE),
    ];
    if (category !== 'all') {
      constraints.splice(1, 0, where('category', '==', category));
    }

    const q = query(...constraints);
    const snapshot = await getDocs(q);
    const morePosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPosts((prev) => [...prev, ...morePosts]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [lastDoc, loadingMore, hasMore, category]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  // Deduplicate pinned from main feed
  const pinnedIds = new Set(pinnedPosts.map((p) => p.id));
  const feedPosts = category === 'all'
    ? posts.filter((p) => !pinnedIds.has(p.id))
    : posts;

  const allPosts = category === 'all'
    ? [...pinnedPosts, ...feedPosts]
    : feedPosts;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-teal text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-serif text-lg font-semibold tracking-tight">Sovereign Community</h1>
          <div className="flex items-center gap-1">
            <NotificationBell />
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Admin panel"
              >
                <GearSix size={22} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium overflow-hidden ml-1">
              {userDoc?.photoURL ? (
                <img src={userDoc.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                (userDoc?.displayName || 'M')[0]
              )}
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Sign out"
            >
              <SignOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Notification opt-in prompt */}
      {showNotifPrompt && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-white rounded-xl border border-teal/10 p-4 flex items-start gap-3 shadow-sm">
            <BellRinging size={24} className="text-teal flex-shrink-0 mt-0.5" weight="fill" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-dark">Stay in the loop</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Get notified when Jocelyn posts new content or someone replies to you.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    await requestPermission();
                    setShowNotifPrompt(false);
                  }}
                  className="px-3 py-1.5 bg-teal text-white text-xs font-medium rounded-full hover:bg-teal-dark transition-colors"
                >
                  Enable notifications
                </button>
                <button
                  onClick={() => setShowNotifPrompt(false)}
                  className="px-3 py-1.5 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {allPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌿</p>
            <h2 className="text-xl font-serif text-teal-dark mb-2">Stay grounded</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Jocelyn's first post is coming. You'll be the first to know.
            </p>
          </div>
        ) : (
          allPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
          </div>
        )}
      </main>

      {/* PWA install banner */}
      <InstallBanner canInstall={canInstall} onInstall={install} />
    </div>
  );
}
