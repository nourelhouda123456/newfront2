<template>
  <div class="page">
    <div class="log-header">
      <div>
        <h1 class="page-title">📋 Journal d'activité</h1>
        <p class="log-subtitle">Toutes les actions enregistrées — connexions, modifications, tâches</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="fetchLogs(true)">↻ Actualiser</button>
    </div>

    <!-- Filtres -->
    <div class="card log-filters">
      <div class="filter-row">
        <div class="filter-group">
          <label>Action</label>
          <select v-model="filters.action" @change="fetchLogs(true)">
            <option value="">Toutes les actions</option>
            <option v-for="a in availableActions" :key="a" :value="a">{{ actionLabel(a) }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Utilisateur</label>
          <select v-model="filters.userId" @change="fetchLogs(true)">
            <option value="">Tous les utilisateurs</option>
            <option v-for="u in auth.users" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Du</label>
          <input type="date" v-model="filters.from" @change="fetchLogs(true)" />
        </div>
        <div class="filter-group">
          <label>Au</label>
          <input type="date" v-model="filters.to" @change="fetchLogs(true)" />
        </div>
        <button class="btn btn-ghost btn-sm" style="align-self:flex-end" @click="resetFilters">
          Réinitialiser
        </button>
      </div>

      <!-- Compteur -->
      <div class="log-meta" v-if="pagination.total !== null">
        <span class="log-count">{{ pagination.total }} événement{{ pagination.total > 1 ? 's' : '' }}</span>
        <span class="log-pages">Page {{ pagination.page }} / {{ pagination.pages }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="log-loading">
      <div class="spinner"></div>
      <span>Chargement…</span>
    </div>

    <!-- Table -->
    <div v-else class="card log-table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th>Date & Heure</th>
            <th>Action</th>
            <th>Utilisateur</th>
            <th>Adresse IP</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!logs.length">
            <td colspan="5" class="log-empty">Aucun événement trouvé.</td>
          </tr>
          <tr v-for="log in logs" :key="log.id" class="log-row" :class="actionClass(log.action)">
            <td class="log-date">
              <span class="date-main">{{ formatDate(log.createdAt) }}</span>
              <span class="date-time">{{ formatTime(log.createdAt) }}</span>
            </td>
            <td>
              <span class="action-badge" :class="actionClass(log.action)">
                {{ actionIcon(log.action) }} {{ actionLabel(log.action) }}
              </span>
            </td>
            <td class="log-user">
              <template v-if="log.userId">
                <div class="log-user-inner">
                  <div class="mini-av">{{ userInitials(log.userId) }}</div>
                  <div>
                    <div class="user-name">{{ log.userId.name }}</div>
                    <div class="user-email">{{ log.userId.email }}</div>
                  </div>
                </div>
              </template>
              <span v-else class="log-anon">— anonyme</span>
            </td>
            <td class="log-ip">
              <code>{{ log.ip || '—' }}</code>
            </td>
            <td class="log-details">
              <div v-if="log.details && Object.keys(log.details).length" class="details-pills">
                <template v-for="(val, key) in log.details" :key="key">
                  <span v-if="val !== null && val !== '' && val !== undefined" class="detail-pill">
                    <strong>{{ key }}</strong>: {{ formatDetailValue(val) }}
                  </span>
                </template>
              </div>
              <span v-else class="log-anon">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="log-pagination">
      <button
        class="btn btn-ghost btn-sm"
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >← Précédent</button>

      <div class="page-numbers">
        <button
          v-for="p in pageRange"
          :key="p"
          class="page-btn"
          :class="{ active: p === pagination.page }"
          @click="changePage(p)"
        >{{ p }}</button>
      </div>

      <button
        class="btn btn-ghost btn-sm"
        :disabled="pagination.page >= pagination.pages"
        @click="changePage(pagination.page + 1)"
      >Suivant →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const API = 'http://localhost:3000/api'

const logs    = ref([])
const loading = ref(false)
const availableActions = ref([])

const filters = reactive({
  action: '',
  userId: '',
  from:   '',
  to:     '',
})

const pagination = reactive({
  page:  1,
  limit: 30,
  total: null,
  pages: 1,
})

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchLogs(reset = false) {
  if (reset) pagination.page = 1
  loading.value = true

  const params = new URLSearchParams({
    page:  pagination.page,
    limit: pagination.limit,
  })
  if (filters.action) params.set('action',  filters.action)
  if (filters.userId) params.set('userId',  filters.userId)
  if (filters.from)   params.set('from',    filters.from)
  if (filters.to)     params.set('to',      filters.to + 'T23:59:59')

  try {
    const res  = await fetch(`${API}/logs?${params}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    logs.value = data.logs
    pagination.total = data.pagination.total
    pagination.pages = data.pagination.pages
  } catch (e) {
    console.error('Erreur chargement logs:', e)
  } finally {
    loading.value = false
  }
}

async function fetchActions() {
  try {
    const res  = await fetch(`${API}/logs/actions`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    const data = await res.json()
    if (res.ok) availableActions.value = data.actions
  } catch {}
}

function resetFilters() {
  filters.action = ''
  filters.userId = ''
  filters.from   = ''
  filters.to     = ''
  fetchLogs(true)
}

function changePage(p) {
  pagination.page = p
  fetchLogs()
}

// ── Pagination range ───────────────────────────────────────────────────────
const pageRange = computed(() => {
  const current = pagination.page
  const total   = pagination.pages
  const delta   = 2
  const range   = []
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    range.push(i)
  }
  return range
})

// ── Helpers ────────────────────────────────────────────────────────────────
const ACTION_MAP = {
  LOGIN_SUCCESS:        { label: 'Connexion',           icon: '✅', cls: 'success' },
  LOGIN_FAILED:         { label: 'Échec connexion',     icon: '❌', cls: 'error' },
  LOGOUT:               { label: 'Déconnexion',         icon: '🚪', cls: 'info' },
  REGISTER_SUCCESS:     { label: 'Inscription',         icon: '🆕', cls: 'success' },
  REGISTER_FAILED:      { label: 'Échec inscription',   icon: '❌', cls: 'error' },
  TASK_CREATED:         { label: 'Tâche créée',         icon: '📝', cls: 'task' },
  TASK_UPDATED:         { label: 'Tâche modifiée',      icon: '✏️', cls: 'task' },
  TASK_STATUS_CHANGED:  { label: 'Statut changé',       icon: '🔄', cls: 'status' },
  TASK_DELETED:         { label: 'Tâche supprimée',     icon: '🗑️', cls: 'error' },
  COMMENT_ADDED:        { label: 'Commentaire ajouté',  icon: '💬', cls: 'info' },
}

function actionLabel(action) {
  return ACTION_MAP[action]?.label || action
}
function actionIcon(action) {
  return ACTION_MAP[action]?.icon || '•'
}
function actionClass(action) {
  return ACTION_MAP[action]?.cls || 'info'
}

function userInitials(user) {
  if (!user?.name) return '?'
  return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDetailValue(val) {
  if (typeof val === 'boolean') return val ? 'oui' : 'non'
  if (val === null) return 'aucun'
  return String(val).slice(0, 60)
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  await auth.fetchUsers()
  await fetchActions()
  await fetchLogs()
})
</script>

<style scoped>
.log-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.log-subtitle {
  font-size: 13px;
  color: var(--gray-5);
  margin-top: 4px;
}

/* ── Filters ─────────────────────────────────────────────────────── */
.log-filters { padding: 16px 20px; margin-bottom: 16px; }
.filter-row  { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: 5px; min-width: 130px; }
.filter-group label { font-size: 11px; font-weight: 600; color: var(--gray-5); text-transform: uppercase; letter-spacing: .4px; }
.filter-group select,
.filter-group input[type="date"] {
  padding: 6px 10px; border: 1px solid var(--gray-3); border-radius: 7px;
  font-size: 13px; font-family: inherit; outline: none; background: white;
  transition: border-color .15s;
}
.filter-group select:focus,
.filter-group input:focus { border-color: var(--blue); }

.log-meta  { display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: var(--gray-5); }
.log-count { font-weight: 600; color: var(--gray-7); }
.log-pages { }

/* ── Loading ─────────────────────────────────────────────────────── */
.log-loading {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 60px; color: var(--gray-5); font-size: 14px;
}
.spinner {
  width: 20px; height: 20px; border: 2px solid var(--gray-3);
  border-top-color: var(--blue); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Table ───────────────────────────────────────────────────────── */
.log-table-wrap { padding: 0; overflow: hidden; margin-bottom: 16px; }
.log-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.log-table thead tr {
  background: var(--gray-1); border-bottom: 1px solid var(--gray-3);
}
.log-table th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; font-weight: 700; color: var(--gray-5);
  text-transform: uppercase; letter-spacing: .4px;
}
.log-row {
  border-bottom: 1px solid var(--gray-2);
  transition: background .1s;
}
.log-row:hover { background: var(--gray-1); }
.log-row:last-child { border-bottom: none; }
.log-table td { padding: 10px 14px; vertical-align: middle; }

.log-empty { text-align: center; color: var(--gray-5); padding: 40px !important; }

/* ── Date cell ───────────────────────────────────────────────────── */
.log-date   { white-space: nowrap; }
.date-main  { display: block; font-weight: 600; color: var(--gray-9); font-size: 12px; }
.date-time  { display: block; font-size: 11px; color: var(--gray-5); }

/* ── Action badge ────────────────────────────────────────────────── */
.action-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 99px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.action-badge.success { background: #dcfce7; color: #15803d; }
.action-badge.error   { background: #fee2e2; color: #991b1b; }
.action-badge.info    { background: var(--blue-lt); color: var(--blue); }
.action-badge.task    { background: #f3e8ff; color: #7c3aed; }
.action-badge.status  { background: #fef3c7; color: #92400e; }

/* ── User cell ───────────────────────────────────────────────────── */
.log-user-inner { display: flex; align-items: center; gap: 8px; }
.mini-av {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: var(--blue-lt); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}
.user-name  { font-size: 12px; font-weight: 600; color: var(--gray-9); }
.user-email { font-size: 11px; color: var(--gray-5); }
.log-anon   { font-size: 12px; color: var(--gray-4); font-style: italic; }

/* ── IP cell ─────────────────────────────────────────────────────── */
.log-ip code {
  background: var(--gray-2); padding: 2px 6px; border-radius: 4px;
  font-size: 11px; color: var(--gray-7); font-family: monospace;
}

/* ── Details pills ───────────────────────────────────────────────── */
.details-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.detail-pill {
  background: var(--gray-2); color: var(--gray-7);
  padding: 2px 7px; border-radius: 4px; font-size: 11px;
}
.detail-pill strong { color: var(--gray-9); }

/* ── Pagination ──────────────────────────────────────────────────── */
.log-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-top: 4px;
}
.page-numbers { display: flex; gap: 4px; }
.page-btn {
  width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--gray-3);
  background: white; cursor: pointer; font-size: 13px; font-weight: 500;
  color: var(--gray-7); transition: all .12s;
}
.page-btn:hover  { background: var(--gray-2); }
.page-btn.active { background: var(--blue); color: white; border-color: var(--blue); }
</style>
