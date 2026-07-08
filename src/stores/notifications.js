import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.js'

const API = 'http://localhost:3000/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])

  // 'default' | 'granted' | 'denied' | 'unsupported'
  // Permet à l'UI (Navbar, etc.) d'afficher un message clair au lieu
  // de se limiter à un console.warn invisible pour l'utilisateur.
  const permissionState = ref('default')

  function headers() {
    const auth = useAuthStore()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    }
  }

  // Retire une notif de la liste locale (remplace l'ancien markAsRead backend)
  function dismiss(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
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

  async function initFCM() {
    try {
      if (!('Notification' in window)) {
        permissionState.value = 'unsupported'
        console.warn('Ce navigateur ne supporte pas les notifications.');
        return;
      }

      const { messaging, getToken, onMessage } = await import('../firebase.js');
      if (!messaging) {
        console.warn("FCM is not initialized because Firebase config is missing.");
        return;
      }

      // Si la permission a déjà été refusée précédemment, le navigateur
      // n'affichera plus jamais le prompt (et log un warning dans la
      // console à chaque appel de requestPermission). On évite donc de
      // le rappeler inutilement : on lit l'état actuel directement.
      if (Notification.permission === 'denied') {
        permissionState.value = 'denied'
        console.warn('Permission de notification refusée — token FCM non enregistré.');
        return;
      }

      const permission = await Notification.requestPermission();
      permissionState.value = permission

      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey && vapidKey !== 'YOUR_VAPID_KEY' ? vapidKey : undefined
        });

        if (currentToken) {
          await sendTokenToBackend(currentToken);
        } else {
          console.warn('No registration token available.');
        }

        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          if (payload.notification) {
            notifications.value.unshift({
              id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
              message: payload.notification.body || payload.notification.title,
              type: payload.data?.type || 'INFO',
              task: payload.data?.taskId || null,
              createdAt: new Date().toISOString(),
            });
          }
        });
      } else {
        console.warn('Notification permission denied.');
      }
    } catch (err) {
      console.error('An error occurred during FCM initialization:', err);
    }
  }

  return { notifications, permissionState, initFCM, dismiss }
})