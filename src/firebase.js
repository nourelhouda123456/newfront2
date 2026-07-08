import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCJXWmJLQllcdU4xJtedz6sP0QlKCtlvqk",
  authDomain: "taskflow-c01c8.firebaseapp.com",
  projectId: "taskflow-c01c8",
  storageBucket: "taskflow-c01c8.firebasestorage.app",
  messagingSenderId: "338158262228",
  appId: "1:338158262228:web:50835e73253e761c0da841",
  measurementId: "G-L22920XYNG"
};

let app = null;
let messaging = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'BC1Inm0noYoptW-tKbNcKcytaQ9uxzB4TKOu1OJ_psR8tpQvFp0ZiXOKE7SKQMfz_F8ToVbr4IxEzcgiq3e1TYI') {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('Firebase initialized successfully on frontend.');
  } else {
    console.warn('Firebase config is not populated yet. Messaging will not be initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase on frontend:', error);
}

export { app, messaging, getToken, onMessage };