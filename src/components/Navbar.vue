<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/dashboard" class="nav-logo">
        ✦ TaskFlow
      </router-link>

      <div class="nav-links">
        <router-link to="/dashboard"  class="nav-link">Tableau de bord</router-link>
        <router-link to="/projects"   class="nav-link">Projets</router-link>
        <router-link to="/tasks"      class="nav-link">{{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}</router-link>
        <router-link v-if="auth.isAdmin" to="/admin"      class="nav-link nav-admin">⚙ Admin</router-link>
        <router-link v-if="auth.isAdmin" to="/admin/logs" class="nav-link nav-logs">📋 Journal</router-link>
      </div>

      <div class="nav-right">
        <router-link to="/profile" class="nav-user">
          <div class="avatar">{{ initials }}</div>
          <span>{{ auth.currentUser?.name }}</span>
          <span :class="auth.isAdmin ? 'badge badge-admin' : 'badge badge-user'">
            {{ auth.isAdmin ? 'Admin' : 'Utilisateur' }}
          </span>
        </router-link>
        <button class="btn btn-ghost btn-sm" @click="logout">Déconnexion</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const n = auth.currentUser?.name || ''
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

async function logout() {
  // Appel API pour enregistrer la déconnexion dans les logs
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  } catch {}
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: white; border-bottom: 1px solid var(--gray-3);
  position: sticky; top: 0; z-index: 50;
}
.nav-inner {
  max-width: 1000px; margin: 0 auto; padding: 0 24px;
  height: 56px; display: flex; align-items: center; gap: 24px;
}
.nav-logo {
  font-weight: 600; font-size: 16px; color: var(--blue);
  text-decoration: none; flex-shrink: 0;
}
.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 12px; border-radius: 6px; font-size: 13px;
  color: var(--gray-7); text-decoration: none; font-weight: 500;
  transition: all .15s;
}
.nav-link:hover, .nav-link.router-link-active {
  background: var(--gray-2); color: var(--gray-9);
}
.nav-admin.router-link-active { background: var(--blue-lt); color: var(--blue); }
.nav-logs.router-link-active  { background: #f3e8ff; color: #7c3aed; }
.nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.nav-user {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; color: var(--gray-9); font-size: 13px; font-weight: 500;
}
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--blue-lt); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
}
</style>