import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.js'

const API = 'http://localhost:3000/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref('')

  function headers() {
    const auth = useAuthStore()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    }
  }

  async function fetchNotifications() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API}/notifications`, { headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      notifications.value = data.notifications
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: 'PUT',
        headers: headers()
      })
      if (!res.ok) throw new Error('Erreur')
      notifications.value = notifications.value.filter(n => n.id !== id && n._id !== id)
    } catch (e) {
      console.error(e)
    }
  }

  async function approveReopen(id) {
    const res = await fetch(`${API}/notifications/${id}/approve`, {
      method: 'PUT',
      headers: headers()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    notifications.value = notifications.value.filter(n => n.id !== id && n._id !== id)
    return data.task
  }

  async function ignoreReopen(id) {
    const res = await fetch(`${API}/notifications/${id}/ignore`, {
      method: 'PUT',
      headers: headers()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    notifications.value = notifications.value.filter(n => n.id !== id && n._id !== id)
    return data.task
  }

  // --- Firebase Cloud Messaging (FCM) Integration ---
  async function initFCM() {
    try {
      const { messaging, getToken, onMessage } = await import('../firebase.js');
      if (!messaging) {
        console.warn("FCM is not initialized because Firebase config is missing.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey && vapidKey !== 'YOUR_VAPID_KEY' ? vapidKey : undefined
        });

        if (currentToken) {
          console.log('FCM Token generated:', currentToken);
          await sendTokenToBackend(currentToken);
        } else {
          console.warn('No registration token available.');
        }
      } else {
        console.warn('Notification permission denied.');
      }

      // Listen for messages when the app is in the foreground
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          notifications.value.unshift({
            id: payload.data?.notificationId || Date.now().toString(),
            message: payload.notification.body || payload.notification.title,
            type: payload.data?.type || 'INFO',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      });
    } catch (err) {
      console.error('An error occurred during FCM initialization:', err);
    }
  }

  async function sendTokenToBackend(token) {
    try {
      const res = await fetch(`${API}/users/fcm-token`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error("Failed to save FCM token on server.");
      console.log("FCM Token saved on server.");
    } catch (e) {
      console.error(e);
    }
  }

  return { notifications, loading, error, fetchNotifications, markAsRead, approveReopen, ignoreReopen, initFCM }
})
