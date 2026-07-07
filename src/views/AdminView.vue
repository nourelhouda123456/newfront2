<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ Gestion des utilisateurs</h1>
        <p class="page-subtitle">Gérez les rôles, accès et comptes utilisateurs</p>
      </div>
    </div>

    <!-- Alert -->
    <transition name="slide-fade">
      <div v-if="success" class="alert alert-success">✅ {{ success }}</div>
    </transition>

    <!-- Stats Bar -->
    <div class="admin-stats-row">
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#E6F0FF;color:#0052CC">👥</div>
        <div>
          <div class="admin-stat-val">{{ users.length }}</div>
          <div class="admin-stat-lbl">Total utilisateurs</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#FFF0B3;color:#7A4A00">👑</div>
        <div>
          <div class="admin-stat-val">{{ admins }}</div>
          <div class="admin-stat-lbl">Administrateurs</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#E3FCEF;color:#006644">✅</div>
        <div>
          <div class="admin-stat-val">{{ activeCount }}</div>
          <div class="admin-stat-lbl">Comptes actifs</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#DEEBFF;color:#0052CC">📋</div>
        <div>
          <div class="admin-stat-val">{{ totalTasks }}</div>
          <div class="admin-stat-lbl">Tâches totales</div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="color:#7A869A;flex-shrink:0"><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/></svg>
          <input v-model="search" id="admin-search-input" placeholder="Rechercher un utilisateur…" class="search-input" />
        </div>
        <div class="result-count">{{ filteredUsers.length }} résultat{{ filteredUsers.length !== 1 ? 's' : '' }}</div>
      </div>
      <UserTable
        :users="filteredUsers"
        :current-id="auth.currentUser.id"
        @toggle-active="handleToggle"
        @change-role="handleRole"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
import UserTable from '../components/UserTable.vue'

const auth  = useAuthStore()
const tasks = useTasksStore()

const search  = ref('')
const success = ref('')

const users = computed(() => auth.getAllUsers())

onMounted(async () => {
  try { await auth.fetchUsers() } catch {}
  try { await tasks.fetchTasks() } catch {}
})

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const admins      = computed(() => users.value.filter(u => u.role === 'admin').length)
const activeCount = computed(() => users.value.filter(u => u.active).length)
const totalTasks  = computed(() => tasks.tasks.length)

function flash(msg) {
  success.value = msg
  setTimeout(() => success.value = '', 3000)
}

async function handleToggle(id) {
  try { await auth.toggleUserActive(id); flash('Statut mis à jour.') }
  catch (err) { alert(err.message || 'Erreur') }
}
async function handleRole(id, role) {
  try { await auth.changeUserRole(id, role); flash('Rôle mis à jour.') }
  catch (err) { alert(err.message || 'Erreur') }
}
async function handleDelete(id) {
  if (!confirm('Supprimer définitivement cet utilisateur ?')) return
  try { await auth.deleteUser(id); flash('Utilisateur supprimé.') }
  catch (err) { alert(err.message || 'Erreur') }
}
</script>

<style scoped>
.admin-page { padding: 28px 32px; max-width: 1200px; margin: 0 auto; }

.page-header { margin-bottom: 24px; }
.page-title   { font-size: 24px; font-weight: 800; color: #172B4D; }
.page-subtitle { font-size: 14px; color: #7A869A; margin-top: 4px; }

/* Stats Row */
.admin-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 24px;
}
.admin-stat-card {
  background: #fff; border-radius: 10px;
  padding: 18px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(9,30,66,.1), 0 0 0 1px rgba(9,30,66,.04);
}
.admin-stat-icon {
  width: 44px; height: 44px; border-radius: 10px; font-size: 20px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.admin-stat-val { font-size: 24px; font-weight: 800; color: #172B4D; line-height: 1; }
.admin-stat-lbl { font-size: 11px; font-weight: 600; color: #7A869A; margin-top: 3px; text-transform: uppercase; letter-spacing: .4px; }

/* Alert */
.alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.alert-success { background: #E3FCEF; color: #006644; border: 1px solid rgba(54,179,126,.2); }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-8px); opacity: 0; }

/* Table Card */
.table-card {
  background: #fff; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(9,30,66,.1), 0 0 0 1px rgba(9,30,66,.04);
  overflow: hidden;
}
.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #EBECF0; gap: 12px;
}
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #F4F5F7; border: 1px solid #EBECF0;
  border-radius: 6px; padding: 8px 12px; flex: 1; max-width: 340px;
  transition: border-color .15s;
}
.search-wrap:focus-within { border-color: #0052CC; background: #fff; }
.search-input {
  border: none; background: transparent; font-size: 13px;
  color: #172B4D; outline: none; font-family: inherit; flex: 1;
}
.result-count { font-size: 12px; color: #7A869A; white-space: nowrap; }

@media (max-width: 768px) {
  .admin-page { padding: 16px; }
  .admin-stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .admin-stats-row { grid-template-columns: 1fr; }
}
</style>