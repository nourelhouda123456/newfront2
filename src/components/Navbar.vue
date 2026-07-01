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
        <button class="btn btn-ghost btn-sm" style="margin-top:8px;" @click="logout">Déconnexion</button>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

const initials = computed(() => {
  const n = auth.currentUser?.name || ''
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

async function logout() {
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
</style>