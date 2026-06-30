import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.js'

const API = 'http://localhost:3000/api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks   = ref([])
  const loading = ref(false)
  const error   = ref('')

  function headers() {
    const auth = useAuthStore()
    return {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${auth.token}`,
    }
  }

  // ── FETCH ─────────────────────────────────────────────────────
  async function fetchTasks() {
    loading.value = true
    error.value   = ''
    try {
      const res  = await fetch(`${API}/tasks`, { headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      tasks.value = data.tasks
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── CREATE ────────────────────────────────────────────────────
  async function addTask({ title, description, priority, visibility, assignee, project }) {
    const res  = await fetch(`${API}/tasks`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify({ title, description, priority, visibility, assignee, project }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    tasks.value.unshift(data.task)
    return data.task
  }

  // ── UPDATE ────────────────────────────────────────────────────
  async function updateTask(id, updates) {
    const res  = await fetch(`${API}/tasks/${id}`, {
      method:  'PUT',
      headers: headers(),
      body:    JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    const idx = tasks.value.findIndex(t => t._id === id)
    if (idx !== -1) tasks.value[idx] = data.task
    return data.task
  }

  // ── DELETE ────────────────────────────────────────────────────
  async function deleteTask(id) {
    const res = await fetch(`${API}/tasks/${id}`, {
      method:  'DELETE',
      headers: headers(),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message)
    }
    tasks.value = tasks.value.filter(t => t._id !== id)
  }

  // ── COMMENTS ──────────────────────────────────────────────────
  async function addComment(taskId, content) {
    const res = await fetch(`${API}/tasks/${taskId}/comments`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify({ content }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) tasks.value[idx] = data.task
    return data.task
  }

  async function deleteComment(taskId, commentId) {
    const res = await fetch(`${API}/tasks/${taskId}/comments/${commentId}`, {
      method:  'DELETE',
      headers: headers(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) tasks.value[idx] = data.task
    return data.task
  }

  // ── STATS ─────────────────────────────────────────────────────
  function getStats() {
    return {
      total:      tasks.value.length,
      todo:       tasks.value.filter(t => t.status === 'todo').length,
      inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
      blocked:    tasks.value.filter(t => t.status === 'blocked').length,
      done:       tasks.value.filter(t => t.status === 'done').length,
    }
  }

  return { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask, addComment, deleteComment, getStats }
})