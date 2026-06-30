import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// Lazy-loaded views
const LoginView       = () => import('../views/LoginView.vue')
const RegisterView    = () => import('../views/RegisterView.vue')
const DashboardView   = () => import('../views/DashboardView.vue')
const TasksView       = () => import('../views/TasksView.vue')
const AdminView       = () => import('../views/AdminView.vue')
const ProfileView     = () => import('../views/ProfileView.vue')
const ActivityLogView = () => import('../views/ActivityLogView.vue')
const ProjectsView    = () => import('../views/ProjectsView.vue')

const routes = [
  { path: '/',              redirect: '/dashboard' },
  { path: '/login',         component: LoginView,       meta: { public: true } },
  { path: '/register',      component: RegisterView,    meta: { public: true } },
  { path: '/dashboard',     component: DashboardView,   meta: { requiresAuth: true } },
  { path: '/tasks',         component: TasksView,        meta: { requiresAuth: true } },
  { path: '/projects',      component: ProjectsView,     meta: { requiresAuth: true } },
  { path: '/profile',       component: ProfileView,      meta: { requiresAuth: true } },
  { path: '/admin',         component: AdminView,        meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/logs',    component: ActivityLogView,  meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ─── Navigation Guard ─────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Page publique (login, register)
  if (to.meta.public) {
    if (auth.isAuthenticated) return next('/dashboard')
    return next()
  }

  // Page protégée — non connecté
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  // Page admin seulement
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/dashboard')
  }

  next()
})

export default router