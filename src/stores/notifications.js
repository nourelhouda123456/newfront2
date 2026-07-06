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

  return { notifications, loading, error, fetchNotifications, markAsRead, approveReopen, ignoreReopen }
})
