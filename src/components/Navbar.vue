<template>
  <nav class="navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <router-link to="/dashboard" class="nav-logo">
        <img src="../assets/logo.png" alt="TaskFlow" class="logo-img" />
        <span class="logo-text">TaskFlow</span>
      </router-link>

      <!-- Primary Links -->
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h5v5H2V2zm0 7h5v5H2V9zm7-7h5v5H9V2zm0 7h5v5H9V9z"/>
          </svg>
          Tableau de bord
        </router-link>
        <router-link to="/projects" class="nav-link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1h4a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-2A.5.5 0 011.5 1zm0 5.5h4a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5zm6.5-5.5h4a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5V1a.5.5 0 01.5-.5zm0 10h4a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5z"/>
          </svg>
          Projets
        </router-link>
        <router-link to="/tasks" class="nav-link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M2 1.5a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/>
          </svg>
          {{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}
        </router-link>
        <router-link v-if="auth.isAdmin" to="/admin" class="nav-link nav-admin">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 01-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 01.872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 012.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 012.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 01.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 01-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 01-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 110-5.86 2.929 2.929 0 010 5.858z"/>
          </svg>
          Admin
        </router-link>
        <router-link v-if="auth.isAdmin" to="/admin/logs" class="nav-link nav-logs">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 1a2 2 0 00-2 2v1h10V3a2 2 0 00-2-2H5zm6 8H5a1 1 0 00-1 1v3a1 1 0 001 1h6a1 1 0 001-1v-3a1 1 0 00-1-1z"/>
            <path d="M0 7a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2h-1v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2H2a2 2 0 01-2-2V7z"/>
          </svg>
          Journal
        </router-link>
      </div>

      <!-- Right -->
      <div class="nav-right">
        
        <!-- Dictation Button -->
        <button class="btn btn-ghost btn-sm" @click="voicePromptState.open()" title="Dictée vocale">
          🎙️
        </button>

        <!-- Notifications (tous les utilisateurs) -->
        <div v-if="auth.currentUser" class="nav-notifs" style="position:relative;">
          <button class="btn btn-ghost btn-sm notif-btn" @click="notifOpen = !notifOpen" style="position:relative;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16a2 2 0 002-2H6a2 2 0 002 2zM8 1.918l-.797.161A4.002 4.002 0 004 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 00-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 111.99 0A5.002 5.002 0 0113 6c0 .88.32 4.2 1.22 6z"/></svg>
            <span v-if="notifsStore.notifications.length > 0" class="notif-badge">{{ notifsStore.notifications.length }}</span>
          </button>
          
          <div v-if="notifOpen" class="notif-dropdown">
            <div class="notif-header">
              <h4>Notifications</h4>
              <button class="btn-icon" @click="notifOpen = false">✕</button>
            </div>
            <div class="notif-body">
              <div v-if="notifsStore.notifications.length === 0" class="notif-empty">
                Aucune notification.
              </div>
              <div v-for="n in notifsStore.notifications" :key="n.id || n._id" class="notif-item" :class="notifTypeClass(n.type)">
                <div class="notif-type-badge">
                  <span v-if="n.type === 'COMMENT'">💬</span>
                  <span v-else-if="n.type === 'REOPEN_REQUEST'">🔄</span>
                  <span v-else-if="n.type === 'DEADLINE_ALERT'">⏰</span>
                  <span v-else-if="n.type === 'APPROVE'">✅</span>
                  <span v-else-if="n.type === 'IGNORE'">❌</span>
                  <span v-else>🔔</span>
                </div>
                <div class="notif-content">
                  <p class="notif-msg">{{ n.message }}</p>
                  <p class="notif-time">{{ formatDate(n.createdAt) }}</p>
                  <div class="notif-actions">
                    <!-- Commentaire : ouvrir la tâche + répondre -->
                    <template v-if="n.type === 'COMMENT'">
                      <button
                        v-if="n.task"
                        class="btn btn-primary btn-sm"
                        @click="openTask(n); notifOpen = false"
                      >Voir la tâche</button>
                      <button class="btn btn-ghost btn-sm" @click="notifsStore.markAsRead(n.id || n._id)">Marquer lu</button>
                    </template>

                    <!-- Demande de réouverture : Approuver ou Ignorer -->
                    <template v-else-if="n.type === 'REOPEN_REQUEST'">
                      <button class="btn btn-success btn-sm" @click="approveNotif(n.id || n._id)">✔ Approuver</button>
                      <button class="btn btn-ghost btn-sm" @click="ignoreNotif(n.id || n._id)">Ignorer</button>
                    </template>

                    <!-- Réponses à la demande de réouverture -->
                    <template v-else-if="n.type === 'APPROVE' || n.type === 'IGNORE'">
                      <button
                        v-if="n.task"
                        class="btn btn-primary btn-sm"
                        @click="openTask(n); notifOpen = false"
                      >Voir la tâche</button>
                      <button class="btn btn-ghost btn-sm" @click="notifsStore.markAsRead(n.id || n._id)">Marquer lu</button>
                    </template>

                    <!-- Alerte deadline -->
                    <template v-else-if="n.type === 'DEADLINE_ALERT'">
                      <button
                        v-if="n.project"
                        class="btn btn-warning btn-sm"
                        @click="$router.push('/projects'); notifOpen = false"
                      >Voir le projet</button>
                      <button class="btn btn-ghost btn-sm" @click="notifsStore.markAsRead(n.id || n._id)">OK</button>
                    </template>

                    <!-- Autres (INFO) -->
                    <template v-else>
                      <button class="btn btn-ghost btn-sm" @click="notifsStore.markAsRead(n.id || n._id)">Marquer lu</button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <router-link to="/profile" class="nav-user-pill">
          <div class="avatar avatar-sm">{{ initials }}</div>
          <div class="user-info">
            <span class="user-name">{{ auth.currentUser?.name }}</span>
            <span class="badge" :class="auth.isAdmin ? 'badge-admin' : 'badge-user'">
              {{ auth.isAdmin ? 'Admin' : 'User' }}
            </span>
          </div>
        </router-link>
        <button class="btn btn-ghost btn-sm" @click="logout">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z"/>
            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
          </svg>
          Déconnexion
        </button>
      </div>

      <!-- Mobile hamburger -->
      <button class="hamburger" @click="mobileOpen = !mobileOpen" :class="{ open: mobileOpen }">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-nav">
        <router-link to="/dashboard" class="mobile-link" @click="mobileOpen=false">Tableau de bord</router-link>
        <router-link to="/projects" class="mobile-link" @click="mobileOpen=false">Projets</router-link>
        <router-link to="/tasks" class="mobile-link" @click="mobileOpen=false">{{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}</router-link>
        <router-link v-if="auth.isAdmin" to="/admin" class="mobile-link" @click="mobileOpen=false">Admin</router-link>
        <router-link v-if="auth.isAdmin" to="/admin/logs" class="mobile-link" @click="mobileOpen=false">Journal</router-link>
        <router-link to="/profile" class="mobile-link" @click="mobileOpen=false">Profil</router-link>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px; color: #fff; background: rgba(255,255,255,.15);" @click="voicePromptState.open(); mobileOpen=false;">🎙️ Dictée vocale</button>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px;" @click="logout">Déconnexion</button>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useNotificationsStore } from '../stores/notifications.js'
import { voicePromptState } from '../composables/voicePromptState.js'

const auth = useAuthStore()
const notifsStore = useNotificationsStore()
const router = useRouter()
const mobileOpen = ref(false)
const notifOpen = ref(false)

onMounted(() => {
  if (auth.currentUser) {
    notifsStore.fetchNotifications()
    notifsStore.initFCM()
  }
})

function notifTypeClass(type) {
  if (type === 'COMMENT')       return 'notif-comment'
  if (type === 'REOPEN_REQUEST') return 'notif-reopen'
  if (type === 'DEADLINE_ALERT') return 'notif-deadline'
  if (type === 'APPROVE')        return 'notif-approve'
  if (type === 'IGNORE')         return 'notif-ignore'
  return ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function openTask(notif) {
  const taskId = notif.task?.id || notif.task?._id || notif.task
  if (taskId) {
    router.push(`/tasks?openTask=${taskId}`)
    notifsStore.markAsRead(notif.id || notif._id)
  }
}

async function approveNotif(id) {
  try {
    await notifsStore.approveReopen(id)
  } catch (e) {
    console.error(e)
  }
}

async function ignoreNotif(id) {
  try {
    await notifsStore.ignoreReopen(id)
  } catch (e) {
    console.error(e)
  }
}

const initials = computed(() => {
  const n = auth.currentUser?.name || ''
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ── Navbar Shell ───────────────────────────────── */
.navbar {
  background: #0052CC;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 2px 8px rgba(9,30,66,.25);
}

.nav-inner {
  max-width: 1400px; margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex; align-items: center; gap: 8px;
}

/* ── Logo ───────────────────────────────────────── */
.nav-logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; flex-shrink: 0;
  margin-right: 8px;
}
.logo-img { height: 32px; width: auto; filter: brightness(0) invert(1); }
.logo-text {
  font-size: 18px; font-weight: 800; color: #fff;
  letter-spacing: -.3px;
}

/* ── Links ──────────────────────────────────────── */
.nav-links {
  display: flex; align-items: center; gap: 2px; flex: 1;
}

.nav-link {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 6px;
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,.82);
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
}
.nav-link:hover {
  background: rgba(255,255,255,.15);
  color: #fff;
}
.nav-link.router-link-active {
  background: rgba(255,255,255,.2);
  color: #fff;
  font-weight: 600;
}
.nav-admin.router-link-active { background: rgba(255, 153, 31, .3); }
.nav-logs.router-link-active  { background: rgba(54, 179, 126, .3); }

/* ── Right Section ──────────────────────────────── */
.nav-right {
  display: flex; align-items: center; gap: 10px; margin-left: auto;
  flex-shrink: 0;
}

.nav-user-pill {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none;
  padding: 4px 10px 4px 4px;
  border-radius: 99px;
  background: rgba(255,255,255,.15);
  transition: background .15s;
}
.nav-user-pill:hover { background: rgba(255,255,255,.25); }

.nav-user-pill .avatar {
  background: rgba(255,255,255,.95);
  color: #0052CC;
  font-size: 11px; font-weight: 700;
  width: 28px; height: 28px;
}

.user-info {
  display: flex; flex-direction: column; gap: 0;
}
.user-name {
  font-size: 12px; font-weight: 600; color: #fff;
  line-height: 1.2;
}
.user-info .badge { font-size: 9px; padding: 1px 5px; }
.user-info .badge-admin { background: #FFF0B3; color: #172B4D; }
.user-info .badge-user  { background: rgba(255,255,255,.25); color: #fff; }

.nav-right .btn-ghost {
  border-color: rgba(255,255,255,.3); color: rgba(255,255,255,.9);
  background: transparent; font-size: 12px; padding: 5px 12px;
}
.nav-right .btn-ghost:hover { background: rgba(255,255,255,.15); border-color: rgba(255,255,255,.5); color: #fff; }

/* ── Hamburger (mobile) ─────────────────────────── */
.hamburger {
  display: none; flex-direction: column; gap: 4px;
  background: transparent; border: none; cursor: pointer;
  padding: 6px; border-radius: 4px; margin-left: auto;
}
.hamburger span {
  width: 20px; height: 2px; background: #fff; border-radius: 2px;
  transition: all .25s;
}
.hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* ── Mobile Nav ─────────────────────────────────── */
.mobile-nav {
  background: #003D99;
  padding: 12px 20px 20px;
  display: flex; flex-direction: column; gap: 4px;
}
.mobile-link {
  display: block; padding: 10px 14px;
  color: rgba(255,255,255,.9); text-decoration: none;
  border-radius: 6px; font-size: 14px; font-weight: 500;
  transition: background .15s;
}
.mobile-link:hover, .mobile-link.router-link-active {
  background: rgba(255,255,255,.15); color: #fff;
}

.mobile-menu-enter-active, .mobile-menu-leave-active { transition: all .25s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { transform: translateY(-10px); opacity: 0; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .nav-links, .nav-right { display: none; }
  .hamburger { display: flex; }
}
@media (min-width: 769px) {
  .mobile-nav { display: none !important; }
}

/* ── Notifications Dropdown ──────────────────────── */
.notif-btn { position: relative; }
.notif-badge {
  position: absolute; top: -2px; right: -2px;
  background: #DE350B; color: #fff;
  font-size: 10px; font-weight: bold;
  padding: 1px 4px; border-radius: 10px;
  min-width: 16px; text-align: center;
}
.notif-dropdown {
  position: absolute; top: 100%; right: 0;
  width: 340px; background: #fff;
  border-radius: 10px; box-shadow: 0 8px 24px rgba(9,30,66,.2);
  margin-top: 8px; z-index: 250;
  border: 1px solid #EBECF0;
  overflow: hidden;
}
.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: #F4F5F7; border-bottom: 1px solid #EBECF0;
}
.notif-header h4 { margin: 0; font-size: 14px; color: #172B4D; font-weight: 700; }
.notif-body {
  max-height: 380px; overflow-y: auto;
}
.notif-empty {
  padding: 24px; text-align: center; color: #7A869A; font-size: 13px;
}
.notif-item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-bottom: 1px solid #EBECF0;
  transition: background .15s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #F8F9FA; }

/* Type colors — left border accent */
.notif-item.notif-comment  { border-left: 3px solid #0052CC; }
.notif-item.notif-reopen   { border-left: 3px solid #FF991F; }
.notif-item.notif-deadline { border-left: 3px solid #DE350B; }
.notif-item.notif-approve  { border-left: 3px solid #36B37E; }
.notif-item.notif-ignore   { border-left: 3px solid #DE350B; }

.notif-type-badge {
  font-size: 18px; flex-shrink: 0; margin-top: 1px;
}
.notif-content {
  flex: 1; min-width: 0;
}
.notif-msg {
  margin: 0 0 4px 0; font-size: 13px; color: #172B4D; line-height: 1.4;
  word-break: break-word;
}
.notif-time {
  margin: 0 0 8px 0; font-size: 11px; color: #7A869A;
}
.notif-actions {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.notif-actions .btn {
  font-size: 11px; padding: 4px 8px; border-radius: 5px;
}
.notif-actions .btn-success {
  background: #36B37E; color: #fff; border: none;
}
.notif-actions .btn-success:hover { background: #00875A; }
.notif-actions .btn-warning {
  background: #FF991F; color: #fff; border: none;
}
.notif-actions .btn-warning:hover { background: #e0820a; }
.notif-actions .btn-ghost {
  color: #7A869A; background: #EBECF0; border: none;
}
.notif-actions .btn-ghost:hover {
  background: #DFE1E6; color: #172B4D;
}
</style>
