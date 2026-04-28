import { useState, useEffect } from 'react';
import { messaging, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export function useNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (!messaging || !user) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: token,
            notificationsEnabled: true,
          });
          toast.success('Notifications enabled!');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      if (title) {
        toast(body || title, {
          icon: '🔔',
          duration: 5000,
          style: { borderLeft: '4px solid #2F5D62' },
        });
      }
    });
    return () => unsubscribe?.();
  }, []);

  return {
    permissionState,
    requestPermission,
    isSupported: !!messaging,
  };
}
