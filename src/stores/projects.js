import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.js'

const API = 'http://localhost:3000/api'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading  = ref(false)
  const error    = ref('')

  function headers() {
    const auth = useAuthStore()
    return {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${auth.token}`,
    }
  }

  // ── FETCH ─────────────────────────────────────────────────────
  async function fetchProjects() {
    loading.value = true
    error.value   = ''
    try {
      const res  = await fetch(`${API}/projects`, { headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      projects.value = data.projects
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── CREATE ────────────────────────────────────────────────────
  async function addProject({ name, description, assignedUsers, deadline, documents }) {
    loading.value = true
    try {
      const res = await fetch(`${API}/projects`, {
        method:  'POST',
        headers: headers(),
        body:    JSON.stringify({ name, description, assignedUsers, deadline, documents }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      projects.value.unshift(data.project)
      return data.project
    } finally {
      loading.value = false
    }
  }

  // ── UPDATE ────────────────────────────────────────────────────
  async function updateProject(id, updates) {
    loading.value = true
    try {
      const res = await fetch(`${API}/projects/${id}`, {
        method:  'PUT',
        headers: headers(),
        body:    JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx !== -1) projects.value[idx] = data.project
      return data.project
    } finally {
      loading.value = false
    }
  }

  // ── DELETE ────────────────────────────────────────────────────
  async function deleteProject(id) {
    loading.value = true
    try {
      const res = await fetch(`${API}/projects/${id}`, {
        method:  'DELETE',
        headers: headers(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      projects.value = projects.value.filter(p => p.id !== id)
    } finally {
      loading.value = false
    }
  }

  return { projects, loading, error, fetchProjects, addProject, updateProject, deleteProject }
})
