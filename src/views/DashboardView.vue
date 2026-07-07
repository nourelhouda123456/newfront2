<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-left">
        <div class="welcome-avatar">{{ initials }}</div>
        <div>
          <h1 class="welcome-title">Bonjour, {{ auth.currentUser?.name?.split(' ')[0] }} 👋</h1>
          <p class="welcome-sub">{{ today }} — Voici un aperçu de votre activité</p>
        </div>
      </div>
      <router-link to="/tasks?new=1" class="btn btn-primary">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/></svg>
        Nouvelle tâche
      </router-link>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" :class="{ pulse: stats.total === 0 }">
        <div class="stat-icon-wrap stat-total">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M2 1.5a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total tâches</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-todo">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1h12zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"/><path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-value" style="color:#0052CC">{{ stats.todo }}</div>
          <div class="stat-label">À faire</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-progress">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-value" style="color:#FF991F">{{ stats.inProgress }}</div>
          <div class="stat-label">En cours</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-blocked">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-value" style="color:#DE350B">{{ stats.blocked }}</div>
          <div class="stat-label">Bloquées</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap stat-done">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/><path d="M10.97 4.97a.235.235 0 00-.02.022L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.06L6.97 11.03a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 00-1.071-1.05z"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-value" style="color:#36B37E">{{ stats.done }}</div>
          <div class="stat-label">Terminées</div>
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="progress-section card" v-if="stats.total > 0">
      <div class="progress-header">
<<<<<<< HEAD
        <div>
=======
   
         <div>
>>>>>>> bf3959f178769e4009561dd13ab95d423f3f71a5
          <div class="progress-title">Progression globale</div>
          <div class="progress-sub">{{ stats.done }} sur {{ stats.total }} tâches complétées</div>
        </div>
        <div class="progress-pct">{{ progressPct }}%</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPct + '%' }">
            <div class="progress-shine"></div>
          </div>
        </div>
      </div>
      <div class="progress-segments">
        <div class="seg todo" :style="{ width: pct(stats.todo) + '%' }" :title="`À faire: ${stats.todo}`"></div>
        <div class="seg in_progress" :style="{ width: pct(stats.inProgress) + '%' }" :title="`En cours: ${stats.inProgress}`"></div>
        <div class="seg blocked" :style="{ width: pct(stats.blocked) + '%' }" :title="`Bloquées: ${stats.blocked}`"></div>
        <div class="seg done" :style="{ width: pct(stats.done) + '%' }" :title="`Terminées: ${stats.done}`"></div>
      </div>
      <div class="progress-legend">
        <span class="leg-item"><span class="leg-dot todo"></span> À faire ({{ stats.todo }})</span>
        <span class="leg-item"><span class="leg-dot in_progress"></span> En cours ({{ stats.inProgress }})</span>
        <span class="leg-item"><span class="leg-dot blocked"></span> Bloquées ({{ stats.blocked }})</span>
        <span class="leg-item"><span class="leg-dot done"></span> Terminées ({{ stats.done }})</span>
      </div>
    </div>

    <!-- Admin Banner -->
    <div v-if="auth.isAdmin" class="admin-banner card">
      <div class="admin-banner-icon">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" style="color:#0052CC"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 01-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 01.872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 012.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 012.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 01.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 01-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 01-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 110-5.86 2.929 2.929 0 010 5.858z"/></svg>
      </div>
      <div class="admin-banner-content">
        <div class="admin-banner-title">Panneau Administrateur</div>
        <div class="admin-banner-desc">{{ totalUsers }} utilisateurs enregistrés — gérez les rôles et les accès</div>
      </div>
      <div class="admin-banner-actions">
        <router-link to="/admin" class="btn btn-primary btn-sm">Gérer les utilisateurs</router-link>
        <router-link to="/admin/logs" class="btn btn-ghost btn-sm">Voir le journal</router-link>
      </div>
    </div>

    <!-- Two column layout -->
<<<<<<< HEAD
    <div class="dashboard-grid">
=======
 
  <ProjectSummaryModal
      :is-open="summaryModalOpen"
      :project="selectedProject"
      @close="summaryModalOpen = false"
    />
 
      <div class="dashboard-grid">
>>>>>>> bf3959f178769e4009561dd13ab95d423f3f71a5
      <!-- Recent Tasks -->
      <div class="card recent-tasks-card">
        <div class="card-head">
          <h2 class="card-title-text">Tâches récentes</h2>
          <router-link to="/tasks" class="btn btn-subtle btn-sm">Voir tout →</router-link>
        </div>

        <div v-if="recentTasks.length === 0" class="empty-state" style="padding:32px 16px">
          <span class="empty-state-icon">📝</span>
          <p>Aucune tâche pour l'instant.</p>
          <router-link to="/tasks" class="btn btn-primary btn-sm">Créer une tâche</router-link>
        </div>

        <div v-else class="recent-list">
          <router-link to="/tasks" class="recent-item" v-for="task in recentTasks" :key="task._id || task.id">
            <span class="recent-prio" :class="`prio-${task.priority}`"></span>
            <div class="recent-body">
              <span class="recent-title" :class="{ 'line-through': task.status === 'done' }">{{ task.title }}</span>
              <span class="recent-project" v-if="task.project?.name">{{ task.project.name }}</span>
            </div>
            <span class="badge" :class="statusBadgeClass(task.status)">{{ statusLabel(task.status) }}</span>
          </router-link>
        </div>
      </div>

      <!-- Quick Links Card -->
      <div class="quick-links-col">
        <div class="card quick-links-card">
          <div class="card-head">
            <h2 class="card-title-text">Accès rapide</h2>
          </div>
          <div class="quick-links">
            <router-link to="/projects" class="quick-link-item">
              <div class="ql-icon" style="background:#E6F0FF;color:#0052CC">📁</div>
              <div class="ql-body">
                <div class="ql-label">Mes projets</div>
                <div class="ql-sub">Voir tous les projets</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="color:#C1C7D0"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
            </router-link>
            <router-link to="/tasks" class="quick-link-item">
              <div class="ql-icon" style="background:#E3FCEF;color:#006644">✅</div>
              <div class="ql-body">
                <div class="ql-label">{{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}</div>
                <div class="ql-sub">Tableau Kanban</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="color:#C1C7D0"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
            </router-link>
            <router-link to="/profile" class="quick-link-item">
              <div class="ql-icon" style="background:#FFF0B3;color:#7A4A00">👤</div>
              <div class="ql-body">
                <div class="ql-label">Mon profil</div>
                <div class="ql-sub">Paramètres du compte</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="color:#C1C7D0"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
            </router-link>
            <router-link v-if="auth.isAdmin" to="/admin/logs" class="quick-link-item">
              <div class="ql-icon" style="background:#FFEBE6;color:#DE350B">📋</div>
              <div class="ql-body">
                <div class="ql-label">Journal d'activité</div>
                <div class="ql-sub">Audit logs système</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="color:#C1C7D0"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
=======
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
 
>>>>>>> bf3959f178769e4009561dd13ab95d423f3f71a5

const auth  = useAuthStore()
const tasks = useTasksStore()

<<<<<<< HEAD
=======
 
 
 
 

>>>>>>> bf3959f178769e4009561dd13ab95d423f3f71a5
onMounted(() => {
  tasks.fetchTasks()
  if (auth.isAdmin) auth.fetchUsers()
})

const stats = computed(() => tasks.getStats())
const recentTasks = computed(() => tasks.tasks.slice(-6).reverse())
const totalUsers  = computed(() => auth.getAllUsers().length)
const progressPct = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.done / stats.value.total) * 100)
})

const initials = computed(() => {
  const n = auth.currentUser?.name || ''
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const today = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

function pct(count) {
  if (!stats.value.total) return 0
  return (count / stats.value.total) * 100
}

const statusLabel = s => ({ todo: 'À faire', in_progress: 'En cours', blocked: 'Bloqué', done: 'Terminé' }[s] || s)
const statusBadgeClass = s => ({ todo: 'badge-todo', in_progress: 'badge-progress', blocked: 'badge-blocked', done: 'badge-done' }[s] || '')
</script>

<style scoped>
.dashboard-page {
  padding: 28px 32px;
  max-width: 1200px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Welcome Header ────────────────────────── */
.welcome-header {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.welcome-left { display: flex; align-items: center; gap: 16px; }
.welcome-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #0052CC, #0066FF);
  color: #fff; font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,82,204,.35);
  flex-shrink: 0;
}
.welcome-title { font-size: 22px; font-weight: 800; color: #172B4D; line-height: 1.2; }
.welcome-sub   { font-size: 13px; color: #7A869A; margin-top: 3px; text-transform: capitalize; }

/* ── Stats ─────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(9,30,66,.1), 0 0 0 1px rgba(9,30,66,.04);
  transition: transform .2s, box-shadow .2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(9,30,66,.15); }
.stat-icon-wrap {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-total    { background: #F4F5F7; color: #7A869A; }
.stat-todo     { background: #E6F0FF; color: #0052CC; }
.stat-progress { background: #FFF0B3; color: #7A4A00; }
.stat-blocked  { background: #FFEBE6; color: #DE350B; }
.stat-done     { background: #E3FCEF; color: #006644; }
.stat-value { font-size: 26px; font-weight: 800; line-height: 1; color: #172B4D; }
.stat-label { font-size: 11px; font-weight: 600; color: #7A869A; margin-top: 3px; text-transform: uppercase; letter-spacing: .4px; }

/* ── Progress ──────────────────────────────── */
.progress-section { padding: 20px 24px; }
.progress-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.progress-title { font-size: 15px; font-weight: 700; color: #172B4D; }
.progress-sub   { font-size: 12px; color: #7A869A; margin-top: 2px; }
.progress-pct   { font-size: 28px; font-weight: 800; color: #0052CC; }

.progress-bar-wrap { margin-bottom: 12px; }
.progress-bar-track {
  height: 10px; background: #EBECF0; border-radius: 99px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%; background: linear-gradient(90deg, #0052CC, #0066FF);
  border-radius: 99px; transition: width .6s ease;
  position: relative; overflow: hidden;
}
.progress-shine {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

.progress-segments { height: 6px; display: flex; border-radius: 99px; overflow: hidden; gap: 1px; }
.seg { height: 100%; transition: width .4s; }
.seg.todo       { background: #0052CC; }
.seg.in_progress { background: #FF991F; }
.seg.blocked    { background: #DE350B; }
.seg.done       { background: #36B37E; }

.progress-legend { display: flex; gap: 20px; margin-top: 10px; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #7A869A; }
.leg-dot { width: 8px; height: 8px; border-radius: 2px; }
.leg-dot.todo       { background: #0052CC; }
.leg-dot.in_progress { background: #FF991F; }
.leg-dot.blocked    { background: #DE350B; }
.leg-dot.done       { background: #36B37E; }

/* ── Admin Banner ──────────────────────────── */
.admin-banner {
  background: linear-gradient(135deg, #E6F0FF 0%, #DEEBFF 100%);
  border: 1px solid #B3D0FF;
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px;
}
.admin-banner-icon { width: 44px; height: 44px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); flex-shrink: 0; }
.admin-banner-content { flex: 1; }
.admin-banner-title { font-size: 14px; font-weight: 700; color: #0052CC; }
.admin-banner-desc  { font-size: 12px; color: #0052CC; opacity: .8; margin-top: 2px; }
.admin-banner-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ── Dashboard Grid ────────────────────────── */
.dashboard-grid {
  display: grid; grid-template-columns: 1fr 340px; gap: 20px;
}

/* ── Cards ─────────────────────────────────── */
.card { box-shadow: 0 1px 3px rgba(9,30,66,.1), 0 0 0 1px rgba(9,30,66,.04); }
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #EBECF0;
}
.card-title-text { font-size: 14px; font-weight: 700; color: #172B4D; }

/* Recent Tasks */
.recent-tasks-card { overflow: hidden; }
.recent-list { display: flex; flex-direction: column; }
.recent-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; border-bottom: 1px solid #F4F5F7;
  text-decoration: none; color: inherit;
  transition: background .15s;
}
.recent-item:last-child { border-bottom: none; }
.recent-item:hover { background: #F4F5F7; }
.recent-prio {
  width: 4px; height: 36px; border-radius: 99px; flex-shrink: 0;
}
.prio-high   { background: #DE350B; }
.prio-medium { background: #FF991F; }
.prio-low    { background: #36B37E; }
.recent-body { flex: 1; min-width: 0; }
.recent-title {
  font-size: 13px; font-weight: 500; color: #172B4D;
  display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.recent-title.line-through { text-decoration: line-through; color: #7A869A; }
.recent-project { font-size: 11px; color: #7A869A; display: block; margin-top: 2px; }

/* Quick Links */
.quick-links-col { display: flex; flex-direction: column; gap: 0; }
.quick-links-card { overflow: hidden; }
.quick-links { display: flex; flex-direction: column; }
.quick-link-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; border-bottom: 1px solid #F4F5F7;
  text-decoration: none; color: inherit;
  transition: background .15s;
}
.quick-link-item:last-child { border-bottom: none; }
.quick-link-item:hover { background: #F4F5F7; }
.ql-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.ql-body { flex: 1; }
.ql-label { font-size: 13px; font-weight: 600; color: #172B4D; }
.ql-sub   { font-size: 11px; color: #7A869A; margin-top: 1px; }

/* ── Responsive ─────────────────────────────── */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .dashboard-page { padding: 16px; gap: 14px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .welcome-header { flex-direction: column; align-items: flex-start; }
  .admin-banner { flex-direction: column; align-items: flex-start; }
  .admin-banner-actions { width: 100%; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>