import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, PushPin, Trash, PencilSimple, Image as ImageIcon,
  PaperPlaneTilt, Users, Megaphone, Eye, CalendarBlank, X,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['awareness', 'activation', 'application', 'ascension', 'general'];

function CreatePostForm({ editingPost, onDone }) {
  const { user, userDoc } = useAuth();
  const [content, setContent] = useState(editingPost?.content || '');
  const [category, setCategory] = useState(editingPost?.category || 'general');
  const [pinned, setPinned] = useState(editingPost?.pinned || false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editingPost?.imageUrl || null);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      let imageUrl = editingPost?.imageUrl || null;

      if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } else if (!imagePreview) {
        imageUrl = null;
      }

      const postData = {
        content: content.trim(),
        category,
        pinned,
        imageUrl,
        scheduledAt: scheduled && scheduledAt ? new Date(scheduledAt) : null,
      };

      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
        toast.success('Post updated');
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          authorId: user.uid,
          authorName: userDoc?.displayName || 'Admin',
          authorAvatar: userDoc?.photoURL || null,
          createdAt: serverTimestamp(),
          reactionCounts: { heart: 0, fire: 0, hands: 0, star: 0 },
          commentCount: 0,
        });
        toast.success('Post published!');
      }

      setContent('');
      setCategory('general');
      setPinned(false);
      setImageFile(null);
      setImagePreview(null);
      setScheduled(false);
      setScheduledAt('');
      onDone?.();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-teal/10 shadow-sm overflow-hidden">
      <div className="p-5">
        <h3 className="font-semibold text-teal-dark mb-4">
          {editingPost ? 'Edit Post' : 'Create Post'}
        </h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with the community..."
          rows={5}
          className="w-full px-4 py-3 border border-teal/10 rounded-xl bg-linen/30 text-sm focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mt-3 rounded-lg overflow-hidden inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Preview mode */}
        {previewing && (
          <div className="mt-3 p-4 bg-linen rounded-xl border border-teal/10">
            <p className="text-xs text-gray-400 mb-2 font-medium">Preview</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm border border-teal/10 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>

          {/* Image upload */}
          <label className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal cursor-pointer transition-colors">
            <ImageIcon size={18} />
            <span>Image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setPinned(!pinned)}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              pinned ? 'text-clay font-medium' : 'text-gray-500 hover:text-teal'
            )}
          >
            <PushPin size={18} weight={pinned ? 'fill' : 'regular'} />
            {pinned ? 'Pinned' : 'Pin'}
          </button>

          {/* Schedule toggle */}
          <button
            type="button"
            onClick={() => setScheduled(!scheduled)}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              scheduled ? 'text-clay font-medium' : 'text-gray-500 hover:text-teal'
            )}
          >
            <CalendarBlank size={18} />
            Schedule
          </button>

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreviewing(!previewing)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal transition-colors"
          >
            <Eye size={18} />
            Preview
          </button>
        </div>

        {/* Schedule datetime */}
        {scheduled && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-3 text-sm border border-teal/10 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal/30"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-5 py-3 bg-linen/50 border-t border-teal/5">
        {editingPost && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <div className={cn(!editingPost && 'ml-auto')}>
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="flex items-center gap-2 px-5 py-2 bg-teal text-white text-sm font-medium rounded-full hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperPlaneTilt size={16} weight="fill" />
            {submitting ? 'Saving...' : editingPost ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </form>
  );
}

function PostRow({ post, onEdit, onDelete, onTogglePin }) {
  const createdAt = post.createdAt?.toDate?.();
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-teal/8 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span className="capitalize bg-gray-50 px-2 py-0.5 rounded-full">{post.category}</span>
          {createdAt && <span>{format(createdAt, 'MMM d, yyyy h:mm a')}</span>}
          {post.pinned && <span className="text-clay font-medium">Pinned</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onTogglePin(post)}
          className={cn('p-1.5 rounded-lg transition-colors', post.pinned ? 'text-clay' : 'text-gray-400 hover:text-teal')}
          title={post.pinned ? 'Unpin' : 'Pin'}
        >
          <PushPin size={16} weight={post.pinned ? 'fill' : 'regular'} />
        </button>
        <button onClick={() => onEdit(post)} className="p-1.5 text-gray-400 hover:text-teal rounded-lg transition-colors" title="Edit">
          <PencilSimple size={16} />
        </button>
        <button onClick={() => onDelete(post)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Delete">
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState('posts'); // 'posts' | 'members' | 'broadcast'
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Load posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Load members
  useEffect(() => {
    if (tab !== 'members') return;
    const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [tab]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'posts', deleteTarget.id));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
    setDeleteTarget(null);
  };

  const handleTogglePin = async (post) => {
    try {
      await updateDoc(doc(db, 'posts', post.id), { pinned: !post.pinned });
      toast.success(post.pinned ? 'Unpinned' : 'Pinned');
    } catch (error) {
      toast.error('Failed to update pin');
    }
  };

  const handleToggleRole = async (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    try {
      await updateDoc(doc(db, 'users', member.id), { role: newRole });
      toast.success(`${member.displayName} is now ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setSendingBroadcast(true);
    try {
      const functions = getFunctions();
      const broadcast = httpsCallable(functions, 'broadcastNotification');
      await broadcast({ title: broadcastTitle.trim(), body: broadcastBody.trim() });
      toast.success('Broadcast sent!');
      setBroadcastTitle('');
      setBroadcastBody('');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-teal text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-serif text-lg font-semibold">Admin Panel</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Create / Edit post */}
        <CreatePostForm
          editingPost={editingPost}
          onDone={() => setEditingPost(null)}
        />

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-teal/10 shadow-sm">
          {[
            { key: 'posts', label: 'Posts', icon: PaperPlaneTilt },
            { key: 'members', label: 'Members', icon: Users },
            { key: 'broadcast', label: 'Broadcast', icon: Megaphone },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                tab === key
                  ? 'bg-teal text-white'
                  : 'text-gray-500 hover:text-teal hover:bg-teal/5'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Posts tab */}
        {tab === 'posts' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">{posts.length} posts</h3>
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onEdit={setEditingPost}
                onDelete={setDeleteTarget}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div className="bg-white rounded-xl border border-teal/10 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">{members.length} members</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-xs font-medium text-teal overflow-hidden">
                    {m.photoURL ? (
                      <img src={m.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (m.displayName || 'M')[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.notificationsEnabled && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">Notifs on</span>
                    )}
                    <button
                      onClick={() => handleToggleRole(m)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                        m.role === 'admin'
                          ? 'bg-clay/10 text-clay'
                          : 'bg-gray-100 text-gray-500 hover:bg-teal/10 hover:text-teal'
                      )}
                    >
                      {m.role === 'admin' ? 'Admin' : 'Member'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast tab */}
        {tab === 'broadcast' && (
          <form onSubmit={handleBroadcast} className="bg-white rounded-xl border border-teal/10 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-teal-dark flex items-center gap-2">
              <Megaphone size={20} weight="fill" />
              Send Broadcast Notification
            </h3>
            <p className="text-xs text-gray-500">This sends a push notification to all members with notifications enabled.</p>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full px-4 py-2.5 border border-teal/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal/30"
            />
            <textarea
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder="Notification message"
              rows={3}
              className="w-full px-4 py-2.5 border border-teal/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
            />
            <button
              type="submit"
              disabled={!broadcastTitle.trim() || !broadcastBody.trim() || sendingBroadcast}
              className="px-5 py-2 bg-clay text-white text-sm font-medium rounded-full hover:bg-clay-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingBroadcast ? 'Sending...' : 'Send to all members'}
            </button>
          </form>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete post?</h3>
            <p className="text-sm text-gray-500 mb-1 line-clamp-2">{deleteTarget.content}</p>
            <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
