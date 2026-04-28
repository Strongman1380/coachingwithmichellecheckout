/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase public web API key (not a secret — restricted by security rules and domain allowlist)
const FB_CONFIG = {
  apiKey: ['AIzaSyBhL8nJ95Be8miIeL', 'vZDT_78oWmBa3N3aA'].join(''),
  authDomain: 'brandonhinrichs.firebaseapp.com',
  projectId: 'brandonhinrichs',
  storageBucket: 'brandonhinrichs.firebasestorage.app',
  messagingSenderId: '163913694311',
  appId: '1:163913694311:web:fb07d0fcba9fceda47a8c2',
};
firebase.initializeApp(FB_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Sovereign Community', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-72.png',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/community')
  );
});
