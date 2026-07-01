import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const token       = ref(localStorage.getItem('token') || null)
  const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => currentUser.value?.role === 'admin')

  // ── helpers ──────────────────────────────────────────────────
  function setSession(data) {
    token.value       = data.token
    currentUser.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function clearSession() {
    token.value       = null
    currentUser.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // ── actions ───────────────────────────────────────────────────
  async function register(name, email, password) {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.message }
    setSession(data)
    return { ok: true }
  }

  async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.message }
    setSession(data)
    return { ok: true }
  }

  async function fetchMe() {
    if (!token.value) return
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    if (!res.ok) { clearSession(); return }
    const data = await res.json()
    currentUser.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function logout() {
    try {
      // Enregistrer la déconnexion dans le journal
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
    } catch {}
    clearSession()
  }

  // Initier la connexion Google (redirige vers le backend)
  function loginWithGoogle() {
    window.location.href = `${API}/auth/google`
  }

  // Appelé depuis OAuthCallbackView après retour Google
  function handleGoogleCallback(tokenValue, userData) {
    const user = typeof userData === 'string' ? JSON.parse(decodeURIComponent(userData)) : userData
    setSession({ token: tokenValue, user })
  }

  const users = ref([])

  async function fetchUsers() {
    const res = await fetch(`${API}/users`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    users.value = data.users
  }

  function getAllUsers() {
    return users.value
  }

  async function toggleUserActive(id) {
    const res = await fetch(`${API}/users/${id}/active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = data.user
  }

  async function changeUserRole(id, role) {
    const res = await fetch(`${API}/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ role })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = data.user
  }

  async function deleteUser(id) {
    const res = await fetch(`${API}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    users.value = users.value.filter(u => u.id !== id)
  }

  async function updateProfile(name, email) {
    const res = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ name, email })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    currentUser.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  }

  async function updatePassword(current, next) {
    const res = await fetch(`${API}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ current, next })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  return {
    token, currentUser, isAuthenticated, isAdmin, users,
    register, login, logout, fetchMe, fetchUsers, getAllUsers,
    toggleUserActive, changeUserRole, deleteUser, updateProfile, updatePassword,
    loginWithGoogle, handleGoogleCallback
  }
})