<template>
  <div class="projects-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">📁 Projets</h1>
        <p class="page-subtitle">
          {{ auth.isAdmin ? 'Créez et affectez des projets aux utilisateurs' : 'Vos projets affectés par l\'administration' }}
        </p>
      </div>
      <button v-if="auth.isAdmin" class="btn btn-primary" @click="openModal()">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/></svg>
        Nouveau projet
      </button>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.type === 'success' ? '✅' : '❌' }} {{ toast.msg }}
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="projectsStore.loading && !projectsStore.projects.length" class="loading-state">
      <div class="spinner"></div>
      <span>Chargement des projets…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!projectsStore.projects.length" class="empty-state card">
      <span class="empty-state-icon">📁</span>
      <p>Aucun projet disponible pour le moment.</p>
      <button v-if="auth.isAdmin" class="btn btn-primary btn-sm" @click="openModal()">
        Créer le premier projet
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <div
        v-for="proj in projectsStore.projects"
        :key="proj.id"
        class="project-card"
        @click="goToTasks(proj.id)"
      >
        <!-- Card color strip -->
        <div class="card-strip" :style="{ background: projectColor(proj.id) }"></div>

        <div class="project-card-body">
          <!-- Top meta -->
          <div class="project-meta-top">
            <span class="project-tag">PROJET</span>
            <div class="project-card-actions" @click.stop>
              <button v-if="auth.isAdmin" class="btn-icon" @click.stop="openModal(proj)" title="Modifier">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M15.502 1.94a.5.5 0 010 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 01.707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 00-.121.196l-.805 2.414a.25.25 0 00.316.316l2.414-.805a.5.5 0 00.196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-6a.5.5 0 00-1 0v6a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5H9a.5.5 0 000-1H2.5A1.5 1.5 0 001 2.5v11z"/></svg>
              </button>
              <button v-if="auth.isAdmin" class="btn-icon danger" @click.stop="deleteProject(proj.id)" title="Supprimer">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
              </button>
            </div>
          </div>

          <!-- Title & Desc -->
          <h3 class="project-title">{{ proj.name }}</h3>
          <p class="project-desc">{{ proj.description || 'Aucune description fournie.' }}</p>

          <!-- Deadline -->
          <div v-if="proj.deadline" class="deadline-chip" :class="{ overdue: isOverdue(proj.deadline) }">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/></svg>
            {{ formatDate(proj.deadline) }}
            <span v-if="isOverdue(proj.deadline)" class="overdue-tag">En retard</span>
          </div>

          <!-- Documents -->
          <div v-if="proj.documents?.length" class="doc-chip">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 3a2.5 2.5 0 015 0v9a1.5 1.5 0 01-3 0V5a.5.5 0 011 0v7a.5.5 0 001 0V3a1.5 1.5 0 00-3 0v9a2.5 2.5 0 005 0V5a.5.5 0 011 0v7a3.5 3.5 0 01-7 0V3z"/></svg>
            {{ proj.documents.length }} document{{ proj.documents.length > 1 ? 's' : '' }}
          </div>

          <!-- Collaborators -->
          <div class="project-footer">
            <div class="users-stack">
              <div
                v-for="user in (proj.assignedUsers || []).slice(0, 4)"
                :key="user.id || user._id"
                class="stack-avatar"
                :title="`${user.name} (${user.email})`"
                :style="{ background: userColor(user.id || user._id) }"
              >
                {{ userInitials(user) }}
              </div>
              <div v-if="(proj.assignedUsers?.length || 0) > 4" class="stack-avatar extra">
                +{{ proj.assignedUsers.length - 4 }}
              </div>
              <span v-if="!proj.assignedUsers?.length" class="no-users-txt">Aucun utilisateur</span>
            </div>
            <div class="view-tasks-btn">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Modal ═══ -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ editingProject ? '✏️ Modifier le projet' : '📁 Nouveau projet' }}</h2>
          <button class="btn-icon" @click="closeModal">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nom du projet *</label>
            <input v-model="form.name" placeholder="Ex: Refonte du site web" />
            <span v-if="formError && !form.name" class="error-msg">⚠ Champ obligatoire</span>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Décrivez les objectifs du projet…"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date limite</label>
              <input type="date" v-model="form.deadline" />
            </div>
          </div>

          <!-- Document Upload -->
          <div class="form-group upload-section">
            <label>Documents joints</label>
            <div class="upload-area" @click="triggerUpload" :class="{ loading: uploadLoading }">
              <input type="file" ref="fileInputRef" @change="handleFileUpload" :disabled="uploadLoading" style="display:none;" accept="image/*,.pdf,.csv,.xlsx,.docx" />
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style="color:#7A869A"><path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/><path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V11.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/></svg>
              <span>{{ uploadLoading ? 'Téléversement…' : 'Cliquer pour importer' }}</span>
              <span class="upload-hint">Images, PDF, Excel, Word</span>
            </div>
            <div v-if="form.documents?.length" class="doc-list">
              <div v-for="(doc, idx) in form.documents" :key="idx" class="doc-item">
                <span class="doc-icon">{{ docIcon(doc.name) }}</span>
                <span class="doc-name">{{ doc.name }}</span>
                <button class="btn-icon danger" @click="removeDocument(idx)">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- User assignment -->
          <div class="form-group">
            <label>Collaborateurs ({{ form.assignedUsers.length }} sélectionnés)</label>
            <div class="users-select-list">
              <label v-for="user in auth.users" :key="user.id" class="user-select-item" :class="{ selected: form.assignedUsers.includes(user.id) }">
                <input type="checkbox" :value="user.id" v-model="form.assignedUsers" hidden />
                <div class="user-select-avatar" :style="{ background: userColor(user.id) }">{{ userInitials(user) }}</div>
                <div class="user-select-info">
                  <strong>{{ user.name }}</strong>
                  <span>{{ user.email }}</span>
                </div>
                <div class="user-select-check" v-if="form.assignedUsers.includes(user.id)">✓</div>
              </label>
              <div v-if="!auth.users.length" class="empty-state" style="padding:20px">
                Aucun utilisateur trouvé.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="submitForm" :disabled="saving">
            <div v-if="saving" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ saving ? 'Enregistrement…' : (editingProject ? 'Mettre à jour' : 'Créer le projet') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProjectsStore } from '../stores/projects.js'

const auth          = useAuthStore()
const projectsStore = useProjectsStore()
const router        = useRouter()
const fileInputRef  = ref(null)

const showModal      = ref(false)
const editingProject = ref(null)
const formError      = ref(false)
const saving         = ref(false)
const uploadLoading  = ref(false)

const form = reactive({
  name: '', description: '', assignedUsers: [], deadline: '', documents: [],
})
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  Object.assign(toast, { show: true, msg, type })
  toastTimer = setTimeout(() => toast.show = false, 3200)
}

// Project colors based on id hash
const COLORS = ['#0052CC','#00875A','#FF5630','#FF991F','#6554C0','#00B8D9','#DE350B','#36B37E']
function projectColor(id) {
  if (!id) return COLORS[0]
  let hash = 0
  for (const c of String(id)) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

const USER_COLORS = ['#0052CC','#00875A','#6554C0','#00B8D9','#FF5630','#FF991F']
function userColor(id) {
  if (!id) return USER_COLORS[0]
  let hash = 0
  for (const c of String(id)) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

function userInitials(user) {
  if (!user?.name) return '?'
  return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function isOverdue(date) {
  if (!date) return false
  return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function docIcon(name = '') {
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return '🖼'
  if (/\.pdf$/i.test(name)) return '📄'
  if (/\.(xlsx|xls|csv)$/i.test(name)) return '📊'
  if (/\.(docx|doc)$/i.test(name)) return '📝'
  return '📎'
}

function triggerUpload() {
  if (fileInputRef.value) fileInputRef.value.click()
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadLoading.value = true
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${auth.token}` },
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    form.documents.push({ name: data.name, url: data.url })
    showToast('Fichier importé avec succès.', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur lors de l\'import.', 'error')
  } finally {
    uploadLoading.value = false
    event.target.value = ''
  }
}

function removeDocument(index) { form.documents.splice(index, 1) }

function goToTasks(projectId) {
  router.push(`/tasks?projectId=${projectId}`)
}

function openModal(proj = null) {
  editingProject.value = proj
  formError.value = false
  if (proj) {
    form.name = proj.name
    form.description = proj.description || ''
    form.assignedUsers = proj.assignedUsers?.map(u => u.id || u._id || u) || []
    form.deadline = proj.deadline ? proj.deadline.substring(0, 10) : ''
    form.documents = proj.documents ? [...proj.documents] : []
  } else {
    form.name = ''; form.description = ''; form.assignedUsers = []
    form.deadline = ''; form.documents = []
  }
  showModal.value = true
}

function closeModal() { showModal.value = false; editingProject.value = null }

async function submitForm() {
  formError.value = true
  if (!form.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name: form.name, description: form.description,
      assignedUsers: form.assignedUsers,
      deadline: form.deadline || null,
      documents: form.documents,
    }
    if (editingProject.value) {
      await projectsStore.updateProject(editingProject.value.id, payload)
      showToast('Projet mis à jour avec succès.', 'success')
    } else {
      await projectsStore.addProject(payload)
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
  if (!confirm('Supprimer ce projet et toutes ses tâches ?')) return
  try {
    await projectsStore.deleteProject(id)
    showToast('Projet supprimé.', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur lors de la suppression.', 'error')
  }
}

onMounted(() => {
  projectsStore.fetchProjects()
  if (auth.isAdmin) auth.fetchUsers()
})
</script>

<style scoped>
.projects-page {
  padding: 28px 32px;
  max-width: 1300px; margin: 0 auto;
}

.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 28px; gap: 16px;
}
.page-title   { font-size: 24px; font-weight: 800; color: #172B4D; }
.page-subtitle { font-size: 14px; color: #7A869A; margin-top: 4px; }

/* ── Loading / Empty ────────────────────────── */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 80px; color: #7A869A; }

.empty-state {
  text-align: center; padding: 60px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(9,30,66,.1);
}
.empty-state-icon { font-size: 48px; }
.empty-state p { color: #7A869A; font-size: 14px; }

/* ── Projects Grid ──────────────────────────── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ── Project Card ───────────────────────────── */
.project-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(9,30,66,.12), 0 0 0 1px rgba(9,30,66,.04);
  overflow: hidden;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  display: flex; flex-direction: column;
}
.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(9,30,66,.15), 0 0 0 1px rgba(9,30,66,.06);
}

.card-strip { height: 4px; width: 100%; flex-shrink: 0; }

.project-card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }

.project-meta-top {
  display: flex; align-items: center; justify-content: space-between;
}
.project-tag {
  font-size: 9px; font-weight: 700; letter-spacing: .8px;
  color: #7A869A; background: #F4F5F7;
  padding: 2px 7px; border-radius: 3px;
}
.project-card-actions { display: flex; gap: 2px; }

.project-title {
  font-size: 15px; font-weight: 700; color: #172B4D;
  line-height: 1.3; margin: 0;
}
.project-desc {
  font-size: 12.5px; color: #7A869A;
  line-height: 1.5; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Chips */
.deadline-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #E6F0FF; color: #0052CC;
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 4px;
  width: fit-content;
}
.deadline-chip.overdue { background: #FFEBE6; color: #DE350B; }
.overdue-tag {
  background: #DE350B; color: #fff;
  font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px;
}

.doc-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #E3FCEF; color: #006644;
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 4px;
  width: fit-content;
}

/* Footer */
.project-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid #F4F5F7;
  margin-top: auto;
}
.users-stack { display: flex; align-items: center; }
.stack-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: #0052CC; color: #fff;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1);
  margin-left: -6px;
  transition: transform .15s;
}
.stack-avatar:first-child { margin-left: 0; }
.stack-avatar:hover { transform: translateY(-2px) scale(1.15); z-index: 1; }
.stack-avatar.extra { background: #EBECF0; color: #7A869A; font-size: 9px; }
.no-users-txt { font-size: 11px; color: #C1C7D0; font-style: italic; }
.view-tasks-btn { color: #C1C7D0; transition: color .15s; }
.project-card:hover .view-tasks-btn { color: #0052CC; }

/* ── Toast ──────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  padding: 12px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  display: flex; align-items: center; gap: 8px;
  animation: slideUp .25s ease;
}
.toast.success { background: #36B37E; color: #fff; }
.toast.error   { background: #DE350B; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ── Modal ──────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(9,30,66,.6); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-box {
  background: #fff; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(9,30,66,.3);
  width: 100%; max-width: 520px;
  max-height: 88vh; display: flex; flex-direction: column;
  animation: fadeUp .25s ease;
}
@keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px; border-bottom: 1px solid #EBECF0;
}
.modal-header h2 { font-size: 15px; font-weight: 700; color: #172B4D; }
.modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; border-top: 1px solid #EBECF0; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.form-group:last-child { margin-bottom: 0; }
label { font-size: 11px; font-weight: 600; color: #7A869A; text-transform: uppercase; letter-spacing: .5px; }
input, select, textarea {
  padding: 9px 12px; border: 2px solid #EBECF0; border-radius: 6px;
  font-size: 14px; font-family: inherit; outline: none; color: #172B4D;
  transition: border-color .15s, box-shadow .15s;
}
input:focus, select:focus, textarea:focus {
  border-color: #0052CC;
  box-shadow: 0 0 0 3px rgba(0,82,204,.15);
}
.error-msg { color: #DE350B; font-size: 11px; font-weight: 500; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }

/* Upload area */
.upload-section {}
.upload-area {
  border: 2px dashed #DFE1E6;
  border-radius: 8px; padding: 20px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; color: #7A869A; font-size: 13px;
  transition: all .15s;
  background: #FAFBFC;
}
.upload-area:hover { border-color: #0052CC; background: #E6F0FF; color: #0052CC; }
.upload-area.loading { opacity: .6; pointer-events: none; }
.upload-hint { font-size: 11px; color: #C1C7D0; }

.doc-list { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.doc-item {
  display: flex; align-items: center; gap: 8px;
  background: #F4F5F7; border-radius: 6px;
  padding: 8px 10px; font-size: 12px;
}
.doc-icon { font-size: 16px; }
.doc-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #172B4D; }

/* User select list */
.users-select-list {
  max-height: 200px; overflow-y: auto;
  border: 2px solid #EBECF0; border-radius: 8px;
  display: flex; flex-direction: column;
}
.user-select-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; cursor: pointer;
  border-bottom: 1px solid #F4F5F7;
  transition: background .1s;
}
.user-select-item:last-child { border-bottom: none; }
.user-select-item:hover { background: #F4F5F7; }
.user-select-item.selected { background: #E6F0FF; }
.user-select-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #0052CC; color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-select-info { flex: 1; min-width: 0; }
.user-select-info strong { font-size: 13px; font-weight: 600; color: #172B4D; display: block; }
.user-select-info span { font-size: 11px; color: #7A869A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.user-select-check { color: #0052CC; font-weight: 700; font-size: 14px; }

/* ── Responsive ─────────────────────────────── */
@media (max-width: 768px) {
  .projects-page { padding: 16px; }
  .page-header { flex-direction: column; }
  .projects-grid { grid-template-columns: 1fr; }
}
</style>
