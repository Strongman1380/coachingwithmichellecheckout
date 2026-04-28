import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch or create user document
  const fetchOrCreateUserDoc = async (firebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserDoc(docSnap.data());
      } else {
        const newUserDoc = {
          displayName: firebaseUser.displayName || 'Member',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          role: 'member',
          notificationsEnabled: false,
          fcmToken: null,
          joinedAt: serverTimestamp()
        };
        await setDoc(userRef, newUserDoc);
        setUserDoc(newUserDoc);
      }
    } catch (error) {
      console.error('Error fetching/creating user doc:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchOrCreateUserDoc(firebaseUser);
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      toast.error('Failed to sign in with Google');
      console.error(error);
    }
  };

  const sendMagicLink = async (email) => {
    const actionCodeSettings = {
      url: window.location.origin + '/community/login',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast.success('Magic link sent to your email!');
    } catch (error) {
      toast.error('Error sending magic link');
      console.error(error);
    }
  };

  const completeMagicLinkSignIn = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        // Let onAuthStateChanged handle the rest
      } catch (error) {
        console.error('Error completing sign in', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = userDoc?.role === 'admin';

  return {
    user,
    userDoc,
    loading,
    isAdmin,
    signInWithGoogle,
    sendMagicLink,
    completeMagicLinkSignIn,
    signOut
  };
}
