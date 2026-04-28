import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "brandonhinrichs.firebaseapp.com",
  projectId: "brandonhinrichs",
  storageBucket: "brandonhinrichs.firebasestorage.app",
  messagingSenderId: "163913694311",
  appId: "1:163913694311:web:fb07d0fcba9fceda47a8c2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Messaging may not be supported on all browsers (like Safari on iOS until recently)
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { app, auth, db, storage, messaging };
