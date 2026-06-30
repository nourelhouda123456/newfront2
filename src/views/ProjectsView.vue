<template>
  <div class="page">
    <div class="projects-header">
      <div>
        <h1 class="page-title">📁 Gestion des Projets</h1>
        <p class="projects-subtitle">
          {{ auth.isAdmin ? 'Créez et affectez des projets aux utilisateurs' : 'Vos projets affectés par l\'administration' }}
        </p>
      </div>
      <button v-if="auth.isAdmin" class="btn btn-primary" @click="openModal()">
        + Nouveau projet
      </button>
    </div>

    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </transition>

    <!-- Projects Grid -->
    <div v-if="projectsStore.loading && !projectsStore.projects.length" class="loading-state">
      <div class="spinner"></div>
      <span>Chargement des projets…</span>
    </div>

    <div v-else-if="!projectsStore.projects.length" class="empty-state card">
      <p>Aucun projet disponible pour le moment.</p>
      <button v-if="auth.isAdmin" class="btn btn-primary btn-sm" @click="openModal()">
        Créer le premier projet
      </button>
    </div>

    <div v-else class="projects-grid">
      <div v-for="proj in projectsStore.projects" :key="proj.id" class="project-card card">
        <div class="project-meta-top">
          <span class="project-tag">PROJET</span>
          <span class="project-owner">Propriétaire: {{ proj.owner?.name || 'Admin' }}</span>
        </div>

        <h3 class="project-title">{{ proj.name }}</h3>
        <p class="project-desc">{{ proj.description || 'Aucune description fournie.' }}</p>

        <!-- Collaborators list -->
        <div class="project-users">
          <span class="users-label">Collaborateurs ({{ proj.assignedUsers?.length || 0 }}) :</span>
          <div class="users-avatars">
            <div
              v-for="user in proj.assignedUsers?.slice(0, 5)"
              :key="user.id"
              class="user-avatar"
              :title="`${user.name} (${user.email})`"
            >
              {{ userInitials(user) }}
            </div>
            <div v-if="proj.assignedUsers?.length > 5" class="user-avatar extra" :title="`Et ${proj.assignedUsers.length - 5} autres`">
              +{{ proj.assignedUsers.length - 5 }}
            </div>
            <span v-if="!proj.assignedUsers?.length" class="no-users">Aucun utilisateur affecté</span>
          </div>
        </div>

        <!-- Project actions -->
        <div class="project-footer">
          <router-link :to="`/tasks?projectId=${proj.id}`" class="btn btn-ghost btn-sm">
            👁 Voir les tâches
          </router-link>
          
          <div v-if="auth.isAdmin" class="project-actions">
            <button class="icon-btn" @click="openModal(proj)" title="Modifier">✎</button>
            <button class="icon-btn danger" @click="deleteProject(proj.id)" title="Supprimer">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <h2>{{ editingProject ? 'Modifier le projet' : 'Nouveau projet' }}</h2>
          <button class="icon-btn" @click="closeModal">✕</button>
        </div>

        <div class="form-group">
          <label>Nom du projet *</label>
          <input v-model="form.name" placeholder="Nom unique du projet" />
          <span v-if="formError && !form.name" class="error-msg">Champ obligatoire</span>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Description du projet…"></textarea>
        </div>

        <!-- User Assignment checkbox list -->
        <div class="form-group">
          <label>Affecter des collaborateurs ({{ form.assignedUsers.length }} sélectionnés)</label>
          <div class="users-selection-list">
            <label v-for="user in auth.users" :key="user.id" class="user-checkbox-label">
              <input
                type="checkbox"
                :value="user.id"
                v-model="form.assignedUsers"
              />
              <span class="chk-user-info">
                <strong>{{ user.name }}</strong> ({{ user.email }})
                <span class="badge badge-user-role" :class="user.role">{{ user.role }}</span>
              </span>
            </label>
            <div v-if="!auth.users.length" class="no-users-db">
              Aucun utilisateur trouvé en base.
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button class="btn btn-ghost" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="submitForm" :disabled="saving">
            {{ saving ? 'Enregistrement…' : (editingProject ? 'Enregistrer' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'

const auth          = useAuthStore()
const projectsStore = useProjectsStore()

const showModal      = ref(false)
const editingProject = ref(null)
const formError      = ref(false)
const saving         = ref(false)

const form = reactive({
  name:          '',
  description:   '',
  assignedUsers: [],
})

const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg  = msg
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => toast.show = false, 3000)
}

function userInitials(user) {
  if (!user?.name) return '?'
  return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function openModal(proj = null) {
  editingProject.value = proj
  formError.value      = false
  if (proj) {
    form.name          = proj.name
    form.description   = proj.description || ''
    form.assignedUsers = proj.assignedUsers?.map(u => u.id || u._id || u) || []
  } else {
    form.name          = ''
    form.description   = ''
    form.assignedUsers = []
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProject.value = null
}

async function submitForm() {
  formError.value = true
  if (!form.name.trim()) return
  saving.value = true

  try {
    if (editingProject.value) {
      await projectsStore.updateProject(editingProject.value.id, {
        name:          form.name,
        description:   form.description,
        assignedUsers: form.assignedUsers,
      })
      showToast('Projet mis à jour avec succès.', 'success')
    } else {
      await projectsStore.addProject({
        name:          form.name,
        description:   form.description,
        assignedUsers: form.assignedUsers,
      })
      showToast('Projet créé avec succès.', 'success')
    }
    closeModal()
  } catch (e) {
    showToast(e.message || 'Erreur lors de la sauvegarde.', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteProject(id) {
  if (!confirm('Attention: Supprimer ce projet détruira également toutes ses tâches. Continuer ?')) return
  try {
    await projectsStore.deleteProject(id)
    showToast('Projet supprimé.', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur lors de la suppression.', 'error')
  }
}

onMounted(() => {
  projectsStore.fetchProjects()
  if (auth.isAdmin) {
    auth.fetchUsers()
  }
})
</script>

<style scoped>
.projects-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.projects-subtitle {
  font-size: 13px;
  color: var(--gray-5);
  margin-top: 4px;
}

/* ── Grid ────────────────────────────────────────────────────────── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  transition: transform .15s, box-shadow .15s;
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}

.project-meta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.project-tag {
  font-size: 9px;
  font-weight: 700;
  color: var(--blue);
  background: var(--blue-lt);
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: .5px;
}
.project-owner {
  font-size: 11px;
  color: var(--gray-5);
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-9);
  margin-bottom: 8px;
}
.project-desc {
  font-size: 13px;
  color: var(--gray-6);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

/* ── Avatars ─────────────────────────────────────────────────────── */
.project-users {
  border-top: 1px solid var(--gray-2);
  padding-top: 12px;
  margin-bottom: 16px;
}
.users-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-5);
  display: block;
  margin-bottom: 6px;
}
.users-avatars {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--blue-lt);
  color: var(--blue);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.user-avatar.extra {
  background: var(--gray-3);
  color: var(--gray-7);
}
.no-users {
  font-size: 12px;
  color: var(--gray-4);
  font-style: italic;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--gray-2);
  padding-top: 12px;
  margin-top: auto;
}
.project-actions {
  display: flex;
  gap: 6px;
}

/* ── Checkbox List ───────────────────────────────────────────────── */
.users-selection-list {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid var(--gray-3);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.user-checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .1s;
}
.user-checkbox-label:hover {
  background: var(--gray-1);
}
.chk-user-info {
  font-size: 12.5px;
  color: var(--gray-8);
}
.badge-user-role {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 6px;
}
.badge-user-role.admin {
  background: #fef3c7;
  color: #d97706;
}
.badge-user-role.user {
  background: var(--gray-2);
  color: var(--gray-6);
}
.no-users-db {
  font-size: 12px;
  color: var(--gray-5);
  text-align: center;
  padding: 20px;
}

/* ── Toast ───────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,.12);
}
.toast.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.toast.error   { background: #fcebeb; color: #E24B4A; border: 1px solid #fca5a5; }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(12px); }

.loading-state {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 60px; color: var(--gray-5); font-size: 14px;
}
.spinner {
  width: 20px; height: 20px; border: 2px solid var(--gray-3);
  border-top-color: var(--blue); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 16px;
}
.modal-box {
  background: white; border-radius: 14px; padding: 24px;
  width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
}
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.modal-head h2 { font-size: 16px; font-weight: 700; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
label { font-size: 13px; font-weight: 600; color: var(--gray-7); }
input, select, textarea {
  padding: 9px 12px; border: 1px solid var(--gray-3); border-radius: 8px;
  font-size: 14px; font-family: inherit; outline: none; background: white;
  transition: border-color .15s;
}
input:focus, select:focus, textarea:focus { border-color: var(--blue); }
.error-msg { color: #E24B4A; font-size: 12px; }
</style>
