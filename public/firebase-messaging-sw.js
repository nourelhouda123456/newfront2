importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCJXWmJLQllcdU4xJtedz6sP0QlKCtlvqk",
  authDomain: "taskflow-c01c8.firebaseapp.com",
  projectId: "taskflow-c01c8",
  storageBucket: "taskflow-c01c8.firebasestorage.app",
  messagingSenderId: "338158262228",
  appId: "1:338158262228:web:50835e73253e761c0da841"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Nouvelle Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});