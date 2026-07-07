<template>
  <div class="kanban-page">
    <!-- Header -->
    <div class="kanban-header">
      <div class="kanban-header-left">
        <h1 class="kanban-title">{{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}</h1>

        <!-- Project Filter -->
        <div class="filter-pill">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="color:#7A869A"><path fill-rule="evenodd" d="M6 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"/></svg>
          <select v-model="selectedProjectId" class="filter-select">
            <option :value="null">Tous les projets</option>
            <option v-for="proj in projectsStore.projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>

        <!-- Column counters -->
        <div class="col-counts">
          <span v-for="col in columns" :key="col.status" class="col-count" :class="col.status">
            {{ tasksByStatus(col.status).length }}
          </span>
        </div>
      </div>
      <div class="header-actions">
       

        <button class="btn btn-primary" @click="openModal()">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/></svg>
          Nouvelle tâche
        </button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast-anim">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.type === 'success' ? '✅' : '❌' }} {{ toast.msg }}
      </div>
    </transition>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.status"
        class="kanban-col"
        :class="[col.status, { 'drag-over': dragOverCol === col.status }]"
        @dragover.prevent="onDragOver(col.status)"
        @dragleave="onDragLeave"
        @drop="onDrop(col.status)"
      >
        <!-- Column Header -->
        <div class="col-header">
          <div class="col-header-left">
            <div class="col-dot-wrap">
              <span class="col-dot" :class="col.status"></span>
            </div>
            <span class="col-label">{{ col.label }}</span>
            <span class="col-badge" :class="col.status">{{ tasksByStatus(col.status).length }}</span>
          </div>
          <button class="col-add-btn" @click="openModal(null, col.status)" :title="`Ajouter dans ${col.label}`">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/></svg>
          </button>
        </div>

        <!-- Empty slot -->
        <div
          v-if="tasksByStatus(col.status).length === 0"
          class="col-empty"
          :class="{ 'drop-active': dragOverCol === col.status }"
        >
          <span>{{ dragOverCol === col.status ? '⬇ Déposer ici' : 'Aucune tâche' }}</span>
        </div>

        <!-- Cards -->
        <transition-group name="card-anim" tag="div" class="col-cards">
          <div
            v-for="task in tasksByStatus(col.status)"
            :key="task._id || task.id"
            class="task-card"
            :class="[`prio-${task.priority}`, {
              dragging: draggingId === (task._id || task.id),
              locked: isTaskLocked(task)
            }]"
            :draggable="isTaskDraggable(task)"
            @dragstart="onDragStart(task)"
            @dragend="onDragEnd"
          >
            <!-- Top row: visibility + priority + actions -->
            <div class="card-top-row">
              <div class="card-tags">
                <span class="vis-chip" :class="task.visibility">
                  {{ task.visibility === 'public' ? '🌐' : '🔒' }}
                </span>
                <span v-if="task.comments?.length" class="vis-chip info" title="Commentaires">
                  💬 {{ task.comments.length }}
                </span>
                <span v-if="task.documents?.length" class="vis-chip success" title="Docs">
                  📎 {{ task.documents.length }}
                </span>
              </div>
              <span class="prio-chip" :class="task.priority">{{ priorityLabel(task.priority) }}</span>
            </div>

            <!-- Lock badge -->
            <div v-if="isTaskLocked(task)" class="lock-overlay" title="Terminée — seul l'admin peut modifier">🔒</div>
            <!-- Drag handle -->
            <div v-if="isTaskDraggable(task)" class="drag-handle">⠿</div>

            <!-- Title -->
            <h3 class="card-title" :class="{ done: task.status === 'done' }">{{ task.title }}</h3>

            <!-- Assignee -->
            <div v-if="task.assignee" class="card-assignee">
              <div class="card-av" :style="{ background: userColor(task.assignee?.id || task.assignee?._id) }">
                {{ userInitials(task.assignee) }}
              </div>
              <span>{{ task.assignee.name }}</span>
            </div>

            <!-- Description -->
            <p v-if="task.description" class="card-desc">{{ task.description }}</p>

            <!-- Footer -->
            <div class="card-footer">
              <span class="card-date" :title="'Dernière modification : ' + getLatestStatusDate(task)">{{ getLatestStatusDate(task) }}</span>
              <div class="card-actions">
                <!-- Bouton demander directement sur la carte pour les tâches verrouillées -->
                <button v-if="isTaskLocked(task) && isTaskDeletable(task)  && !requestingReopenId[task._id || task.id]" class="btn-icon" @click.stop="requestReopenFromCard(task)" title="Demander la réouverture" style="color: #FF991F;">
                  🔄
                </button>
                <div v-else-if="requestingReopenId[task._id || task.id]" class="spinner spinner-sm" style="border-top-color:#0052CC;width:12px;height:12px;"></div>
                
                <button v-if="canEditTask(task)" class="btn-icon" @click.stop="openModal(task)" title="Modifier">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M15.502 1.94a.5.5 0 010 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 01.707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 00-.121.196l-.805 2.414a.25.25 0 00.316.316l2.414-.805a.5.5 0 00.196-.12l6.813-6.814z"/></svg>
                </button>
                <button v-if="isTaskDeletable(task)" class="btn-icon danger" @click.stop="deleteTask(task._id || task.id)" title="Supprimer">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- ═══════════ CONFIRM / ERROR MODAL ═══════════ -->
    <transition name="toast-anim">
      <div v-if="confirmModal.show" class="modal-overlay" @click.self="closeConfirm">
        <div class="confirm-box" :class="confirmModal.type">
          <div class="confirm-icon">{{ confirmModal.type === 'error' ? '⚠️' : '🔄' }}</div>
          <p class="confirm-message">{{ confirmModal.message }}</p>
          <div class="confirm-actions">
            <template v-if="confirmModal.type === 'confirm'">
              <button class="btn btn-ghost" @click="closeConfirm">Annuler</button>
              <button class="btn btn-primary" @click="handleConfirmYes">Confirmer</button>
            </template>
            <template v-else>
              <button class="btn btn-primary" @click="closeConfirm">OK, compris</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════ MODAL CREATE / EDIT ═══════════ -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box modal-box-lg">
        <div class="modal-header">
          <h2>{{ editingTask ? '✏️ Modifier la tâche' : '✅ Nouvelle tâche' }}</h2>
          <button class="btn-icon" @click="closeModal">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Project -->
          <div class="form-group">
            <label>Projet *</label>
            <select v-model="form.project" :disabled="!!editingTask">
              <option :value="null" disabled>Sélectionner un projet…</option>
              <option v-for="proj in projectsStore.projects" :key="proj.id" :value="proj.id">
                {{ proj.name }}
              </option>
            </select>
            <span v-if="formError && !form.project" class="error-msg">⚠ Projet obligatoire</span>
            <span v-if="!projectsStore.projects.length" class="error-msg">
              ⚠️ Vous devez appartenir à un projet pour créer une tâche.
            </span>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label>Titre *</label>
            <input v-model="form.title" placeholder="Titre de la tâche…" :disabled="!auth.isAdmin && !!editingTask" />
            <span v-if="formError && !form.title" class="error-msg">⚠ Champ obligatoire</span>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Détails, contexte…" :disabled="!auth.isAdmin && !!editingTask"></textarea>
          </div>

          <!-- Priority / Status row -->
          <div class="form-row">
            <div class="form-group">
              <label>Priorité</label>
              <select v-model="form.priority"  >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🔴 Haute</option>
              </select>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <div style="display:flex; gap:8px;">
                <select v-model="form.status" :disabled="isStatusSelectDisabled" style="flex:1;">
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="blocked">🔴 Bloqué</option>
                  <option value="done">Terminé</option>
                </select>
                <button v-if="isStatusSelectDisabled && !requestingReopen" class="btn btn-ghost" type="button" @click="requestReopen" title="Demander à l'administrateur de rouvrir cette tâche" style="padding:0 8px;">
                  🔄 Demander
                </button>
              </div>
            </div>
          </div>

          <!-- Visibility (admin ou user) -->
          <div v-if="auth.isAdmin  || auth.currentUser" class="form-group">
            <label>Visibilité</label>
            <div class="vis-toggle">
              <button type="button" :class="['vis-btn', form.visibility === 'private' ? 'active' : '']" @click="form.visibility = 'private'">
                🔒 Privée
              </button>
              <button type="button" :class="['vis-btn', form.visibility === 'public' ? 'active' : '']" @click="form.visibility = 'public'">
                🌐 Publique
              </button>
            </div>
          </div>

          <!-- Assignee -->
          <div v-if="auth.isAdmin" class="form-group">
            <label>Assigner à</label>
            <select v-model="form.assignee">
              <option :value="null">Non assignée 👤</option>
              <option v-for="user in auth.users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div v-else class="form-group">
            <label>Assignée à</label>
            <select v-model="form.assignee" disabled>
              <option :value="auth.currentUser?.id || auth.currentUser?._id">Moi-même ({{ auth.currentUser?.name }}) 👤</option>
              <option :value="null">Non assignée 👤</option>
            </select>
            <span style="font-size:11px;color:#7A869A;">Seul l'administrateur peut réassigner.</span>
          </div>

          <!-- Documents -->
          <div class="form-group" style="border-top:1px solid #EBECF0;padding-top:16px;margin-top:4px;">
            <label>📎 Documents joints</label>
            <div class="upload-area" @click="triggerTaskUpload" :class="{ loading: uploadLoading }">
              <input type="file" ref="taskFileRef" @change="handleFileUpload" :disabled="uploadLoading" style="display:none;" accept="image/*,.pdf,.csv,.xlsx,.docx" />
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style="color:#7A869A"><path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/><path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V11.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/></svg>
              <span>{{ uploadLoading ? 'Téléversement…' : 'Cliquer pour importer' }}</span>
              <span style="font-size:11px;color:#C1C7D0;">Images, PDF, Excel, Word</span>
            </div>

            <!-- Doc previews grid -->
            <div v-if="form.documents?.length" class="doc-grid">
              <div v-for="(doc, idx) in form.documents" :key="idx" class="doc-thumb">
                <button class="doc-remove-btn" @click.stop="removeDocument(idx)">✕</button>
                <div v-if="isImage(doc.url)" class="doc-preview-img">
                  <img :src="doc.url" :alt="doc.name" />
                </div>
                <div v-else class="doc-preview-icon">{{ docIcon(doc.name) }}</div>
                <a :href="doc.url" target="_blank" class="doc-name-link" :title="doc.name">{{ doc.name }}</a>
              </div>
            </div>
          </div>

          <!-- Comments (edit mode only) -->
          <div v-if="editingTask" class="comments-section">
            <h4 class="comments-title">
              💬 Commentaires ({{ editingTask.comments?.length || 0 }})
            </h4>
            <div class="comments-list">
              <div v-if="!editingTask.comments?.length" class="no-comments">Aucun commentaire.</div>
              <div v-for="comment in editingTask.comments" :key="comment._id || comment.id" class="comment-bubble">
                <div class="comment-header">
                  <div class="comment-av">{{ authorInitials(comment.author) }}</div>
                  <strong>{{ comment.author?.name || 'Utilisateur' }}</strong>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                  <button v-if="canDeleteComment(comment)" class="btn-icon danger" @click="deleteComment(comment._id || comment.id)" style="margin-left:auto">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>
                  </button>
                </div>
                <p class="comment-body">{{ comment.content }}</p>
              </div>
            </div>
            <div class="comment-input-row">
              <input v-model="newCommentText" placeholder="Écrire un commentaire…" @keyup.enter="submitComment" class="comment-input" />
              <button class="btn btn-primary btn-sm" @click="submitComment" :disabled="commentSaving">
                {{ commentSaving ? '…' : 'Envoyer' }}
              </button>
            </div>
          </div>

          <!-- Timeline (edit mode) -->
          <div v-if="editingTask" class="timeline-section">
            <h4 class="timeline-title">⏱ Historique des statuts</h4>
            <div class="timeline">
              <div class="tl-item">
                <div class="tl-dot created"></div>
                <div class="tl-content">
                  <span class="tl-label">Créée</span>
                  <span class="tl-time">{{ formatDateTime(editingTask.createdAt) }}</span>
                </div>
              </div>
              <div v-for="(entry, i) in editingTask.statusHistory" :key="i" class="tl-item">
                <div class="tl-dot" :class="entry.newStatus"></div>
                <div class="tl-content">
                  <span class="tl-label">
                    {{ statusLabel(entry.newStatus) }}
                   </span>
                  <span class="tl-time">
                    {{ formatDateTime(entry.changedAt) }}
                   </span>
                </div>
              </div>
              <div v-if="!editingTask.statusHistory?.length" class="tl-item">
                <div class="tl-dot" :class="editingTask.status"></div>
                <div class="tl-content">
                  <span class="tl-label">{{ statusLabel(editingTask.status) }}</span>
                  <span class="tl-time">Statut actuel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="submitForm" :disabled="saving">
            <div v-if="saving" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ saving ? 'Enregistrement…' : (editingTask ? 'Enregistrer' : 'Créer la tâche') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
import { useProjectsStore } from '../stores/projects.js'
import { useVoiceCommand } from '../composables/useVoiceCommand.js'

const auth          = useAuthStore()
const tasksStore    = useTasksStore()
const projectsStore = useProjectsStore()
const route         = useRoute()
const router        = useRouter()
const { isListening, isSupported, startListening } = useVoiceCommand()
const taskFileRef   = ref(null)

const selectedProjectId = ref(null)

const columns = [
  { status: 'todo',        label: 'À faire' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'blocked',     label: 'Bloqué' },
  { status: 'done',        label: 'Terminé' },
]

// ── Drag & Drop ────────────────────────────────────────────────
const draggingId   = ref(null)
const draggingTask = ref(null)
const dragOverCol  = ref(null)

function onDragStart(task) { draggingId.value = task._id || task.id; draggingTask.value = task }
function onDragOver(status) { dragOverCol.value = status }
function onDragLeave() { dragOverCol.value = null }
async function onDrop(newStatus) {
  dragOverCol.value = null
  if (!draggingTask.value) return
  const task = draggingTask.value
  if (task.status === newStatus) return
  const old = task.status
  task.status = newStatus
  try {
    await tasksStore.updateTask(task._id || task.id, { status: newStatus })
    showToast(`Déplacé vers « ${columns.find(c => c.status === newStatus)?.label} »`, 'success')
  } catch {
    task.status = old
    showToast('Erreur lors du déplacement', 'error')
  }
}
function onDragEnd() { draggingId.value = null; draggingTask.value = null; dragOverCol.value = null }

// ── Filter ─────────────────────────────────────────────────────
function tasksByStatus(status) {
  let list = tasksStore.tasks.filter(t => t.status === status)
  if (selectedProjectId.value) {
    list = list.filter(t => {
      const pId = t.project?.id || t.project?._id || t.project
      return pId === selectedProjectId.value
    })
  }
  return list
}

// ── Modal ───────────────────────────────────────────────────────
const showModal    = ref(false)
const editingTask  = ref(null)
const formError    = ref(false)
const saving       = ref(false)
const uploadLoading = ref(false)
const newCommentText = ref('')
const commentSaving  = ref(false)

const form = reactive({
  title: '', description: '', priority: 'medium', status: 'todo',
  visibility: 'private', assignee: null, project: null, documents: []
})

function isImage(url) { return /\.(jpeg|jpg|gif|png|webp|svg)/i.test(url || '') }
function docIcon(name = '') {
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return '🖼'
  if (/\.pdf$/i.test(name)) return '📄'
  if (/\.(xlsx|xls|csv)$/i.test(name)) return '📊'
  if (/\.(docx|doc)$/i.test(name)) return '📝'
  return '📎'
}

function triggerTaskUpload() { if (taskFileRef.value) taskFileRef.value.click() }

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadLoading.value = true
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST', headers: { 'Authorization': `Bearer ${auth.token}` }, body: fd
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    form.documents.push({ name: data.name, url: data.url })
    showToast('Fichier importé.', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur import.', 'error')
  } finally { uploadLoading.value = false; event.target.value = '' }
}
function removeDocument(i) { form.documents.splice(i, 1) }

function openModal(task = null, defaultStatus = 'todo') {
  editingTask.value = task
  formError.value = false
  newCommentText.value = ''
  if (task) {
    form.title       = task.title
    form.description = task.description || ''
    form.priority    = task.priority
    form.status      = task.status
    form.visibility  = task.visibility || 'private'
    form.assignee    = task.assignee?.id || task.assignee?._id || task.assignee || null
    form.project     = task.project?.id || task.project?._id || task.project || null
    form.documents   = task.documents ? [...task.documents] : []
  } else {
    form.title = ''; form.description = ''
    form.priority = 'medium'; form.status = defaultStatus; form.visibility = 'private'
    form.assignee = auth.isAdmin ? null : (auth.currentUser?.id || auth.currentUser?._id)
    form.project  = selectedProjectId.value || (projectsStore.projects[0]?.id || null)
    form.documents = []
  }
  showModal.value = true
}

function closeModal() { showModal.value = false; editingTask.value = null }

async function submitForm() {
  formError.value = true
  if (!form.title.trim() || !form.project) return
  saving.value = true
  try {
    const payload = {
      title: form.title, description: form.description,
      priority: form.priority, status: form.status,
      visibility: form.visibility, assignee: form.assignee,
      documents: form.documents,
    }
    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value._id || editingTask.value.id, payload)
      showToast('Tâche mise à jour', 'success')
    } else {
      await tasksStore.addTask({ ...payload, project: form.project })
      showToast('Tâche créée', 'success')
    }
    closeModal()
  } catch (e) {
    showToast(e.message || 'Erreur', 'error')
  } finally { saving.value = false }
}

async function submitComment() {
  if (!newCommentText.value.trim()) return
  commentSaving.value = true
  try {
    const updated = await tasksStore.addComment(editingTask.value._id || editingTask.value.id, newCommentText.value.trim())
    editingTask.value = updated
    newCommentText.value = ''
    showToast('Commentaire ajouté', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur', 'error')
  } finally { commentSaving.value = false }
}

async function deleteComment(commentId) {
  if (!confirm('Supprimer ce commentaire ?')) return
  try {
    const updated = await tasksStore.deleteComment(editingTask.value._id || editingTask.value.id, commentId)
    editingTask.value = updated
  } catch {}
}

function canDeleteComment(comment) {
  const cId = comment.author?.id || comment.author?._id || comment.author
  const uId = auth.currentUser?.id || auth.currentUser?._id
  return auth.isAdmin || cId === uId
}

async function deleteTask(id) {
  if (!confirm('Supprimer cette tâche ?')) return
  try { await tasksStore.deleteTask(id); showToast('Tâche supprimée', 'success') }
  catch { showToast('Erreur lors de la suppression', 'error') }
}

async function handleVoiceCommand() {
  if (!isSupported.value) {
    showToast('Votre navigateur ne supporte pas la reconnaissance vocale.', 'error')
    return
  }

  try {
    showToast('Je vous écoute (ex: Créer la tâche bouton rouge pour le projet refonte)...', 'success')
    const transcript = await startListening()
    const text = transcript.toLowerCase()
    
    // Parse "créer [la] tâche X [pour le projet Y]"
    const regex = /créer\s+(?:la\s+)?tâche\s+(.*?)(?:\s+(?:pour|dans)(?:\s+le)?\s+projet\s+(.*))?$/i
    const match = text.match(regex)

    if (match) {
      const taskTitle = match[1]?.trim()
      const projectName = match[2]?.trim()

      openModal()
      if (taskTitle) {
        form.title = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1)
        
        // Détection basique de la priorité dans le titre dicté
        if (taskTitle.includes('urgent') || taskTitle.includes('critique')) {
          form.priority = 'high'
        } else if (taskTitle.includes('mineur') || taskTitle.includes('basse')) {
          form.priority = 'low'
        }
      }

      if (projectName) {
        const foundProject = projectsStore.projects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()))
        if (foundProject) {
          form.project = foundProject.id || foundProject._id
          showToast(`Tâche "${form.title}" créée dans le projet ${foundProject.name}. Vérifiez et validez.`, 'success')
        } else {
          showToast(`Tâche "${form.title}" créée, mais le projet "${projectName}" n'a pas été trouvé.`, 'error')
        }
      } else {
        showToast(`Tâche "${form.title}" créée. Vérifiez et validez.`, 'success')
      }
    } else {
      showToast('Je n\'ai pas compris la commande.', 'error')
      console.log('Transcript ignoré :', text)
    }
  } catch (err) {
    if (err.message.includes('not-allowed')) {
      showToast('Accès au microphone refusé.', 'error')
    } else {
      showToast('Erreur de reconnaissance vocale.', 'error')
    }
  }
}

// ── Permissions ────────────────────────────────────────────────
function isTaskLocked(task) { 
  return task.status === 'done' && !auth.isAdmin
}
function isTaskDraggable(task) {
  if (auth.isAdmin) return true
  const aId = task.assignee?.id || task.assignee?._id || task.assignee
  const oId = task.owner?.id    || task.owner?._id    || task.owner
  const uId = auth.currentUser?.id || auth.currentUser?._id
  return (aId && aId === uId) || (oId && oId === uId)
}
function canEditTask(task) {
  if (auth.isAdmin) return true
  const aId = task.assignee?.id || task.assignee?._id || task.assignee
  const oId = task.owner?.id    || task.owner?._id    || task.owner
  const uId = auth.currentUser?.id || auth.currentUser?._id
  return (aId && aId === uId) || (oId && oId === uId)
}
function isTaskDeletable(task) { 
  if (auth.isAdmin) return true
  if (!task) return false
  const aId = task.assignee?.id || task.assignee?._id || task.assignee
  const oId = task.owner?.id    || task.owner?._id    || task.owner
  const uId = auth.currentUser?.id || auth.currentUser?._id
  return (aId && aId === uId) || (oId && oId === uId)
}
const isStatusSelectDisabled = computed(() => editingTask.value && editingTask.value.status === 'done' && !auth.isAdmin)
const requestingReopen = ref(false)
const requestingReopenId = ref({})

// ── Confirm / Error Modal ────────────────────────────────────────
const confirmModal = reactive({
  show: false,
  message: '',
  type: 'confirm', // 'confirm' | 'error'
  action: null
})

function openConfirm(message, action) {
  confirmModal.show = true
  confirmModal.type = 'confirm'
  confirmModal.message = message
  confirmModal.action = action
}

function showErrorModal(message) {
  confirmModal.show = true
  confirmModal.type = 'error'
  confirmModal.message = message
  confirmModal.action = null
}

function closeConfirm() {
  confirmModal.show = false
  confirmModal.action = null
}

async function handleConfirmYes() {
  const action = confirmModal.action
  closeConfirm()
  if (action) await action()
}

async function requestReopen() {
  if (requestingReopen.value) return
  openConfirm("Voulez-vous demander à l'administrateur de rouvrir cette tâche ?", async () => {
    requestingReopen.value = true
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${editingTask.value._id || editingTask.value.id}/request-reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) { showErrorModal(data.message); return }
        throw new Error(data.message)
      }
      editingTask.value = data.task
      showToast('Demande envoyée à l\'administrateur', 'success')
    } catch (e) {
      showToast(e.message || 'Erreur', 'error')
    } finally {
      requestingReopen.value = false
    }
  })
}

async function requestReopenFromCard(task) {
  const id = task._id || task.id
  if (requestingReopenId.value[id]) return
  openConfirm("Voulez-vous demander à l'administrateur de rouvrir cette tâche ?", async () => {
    requestingReopenId.value[id] = true
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}/request-reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) { showErrorModal(data.message); return }
        throw new Error(data.message)
      }

      // Mettre à jour la tâche dans le store
      const idx = tasksStore.tasks.findIndex(t => (t._id || t.id) === id)
      if (idx !== -1) {
        tasksStore.tasks[idx] = data.task
      }
      showToast('Demande envoyée à l\'administrateur', 'success')
    } catch (e) {
      showToast(e.message || 'Erreur', 'error')
    } finally {
      requestingReopenId.value[id] = false
    }
  })
}

// ── Helpers ─────────────────────────────────────────────────────
const COLORS = ['#0052CC','#00875A','#6554C0','#00B8D9','#FF5630','#FF991F']
function userColor(id) {
  if (!id) return COLORS[0]
  let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}
function userInitials(user) {
  if (!user?.name) return '?'
  return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function authorInitials(a) { return userInitials(a) }
function ownerInitials(o) { return userInitials(o) }
const priorityLabel = p => ({ low: '🟢 Basse', medium: '🟡 Moyenne', high: '🔴 Haute' }[p] || p)
const statusLabel = s => ({ todo: 'À faire', in_progress: 'En cours', blocked: 'Bloqué', done: 'Terminé' }[s] || s)

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getLatestStatusDate(task) {
  if (task.statusHistory && task.statusHistory.length > 0) {
    const latest = task.statusHistory[task.statusHistory.length - 1];
    return formatDate(latest.changedAt);
  }
  return formatDate(task.createdAt);
}

// ── Toast ───────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  Object.assign(toast, { show: true, msg, type })
  toastTimer = setTimeout(() => toast.show = false, 3200)
}

// ── Init ────────────────────────────────────────────────────────
onMounted(async () => {
  await tasksStore.fetchTasks()
  projectsStore.fetchProjects()
  if (auth.isAdmin) auth.fetchUsers()

  if (route.query.new === '1') {
    router.replace({ query: {} })
    openModal()
  }
  if (route.query.projectId) selectedProjectId.value = route.query.projectId

  // Ouvrir automatiquement le popup si ?openTask=ID est présent
  if (route.query.openTask) {
    const taskId = route.query.openTask
    const task = tasksStore.tasks.find(t => (t._id || t.id) === taskId)
    if (task) {
      openModal(task)
    }
    router.replace({ query: {} })
  }
})

// Si on navigue vers la même page avec un nouveau openTask (déjà montée)
watch(() => route.query.openTask, async (newId) => {
  if (!newId) return
  if (!tasksStore.tasks.length) await tasksStore.fetchTasks()
  const task = tasksStore.tasks.find(t => (t._id || t.id) === newId)
  if (task) openModal(task)
  router.replace({ query: {} })
})
</script>

<style scoped>
/* ════════════════════════════════════════════════
   PAGE LAYOUT
════════════════════════════════════════════════ */
.kanban-page {
  display: flex; flex-direction: column;
  height: calc(100vh - 56px);
  background: #F4F5F7;
  overflow: hidden;
}

/* ════════════════════════════════════════════════
   HEADER
════════════════════════════════════════════════ */
.kanban-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #EBECF0;
  flex-shrink: 0;
  gap: 16px;
}
.kanban-header-left { display: flex; align-items: center; gap: 16px; flex: 1; }
.header-actions { display: flex; align-items: center; gap: 8px; }

/* Voice Button */
.btn-ghost.listening {
  color: #DE350B;
  background: rgba(222, 53, 11, 0.1);
  animation: pulse 1.5s infinite;
}
.pulse-dot { font-size: 10px; }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.kanban-title { font-size: 20px; font-weight: 800; color: #172B4D; margin: 0; }

.filter-pill {
  display: flex; align-items: center; gap: 8px;
  background: #F4F5F7; border: 1px solid #EBECF0;
  border-radius: 6px; padding: 6px 12px;
}
.filter-select {
  border: none; background: transparent; font-size: 13px; font-weight: 500;
  color: #172B4D; outline: none; cursor: pointer; font-family: inherit;
}

.col-counts { display: flex; gap: 6px; }
.col-count {
  padding: 2px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 700;
}
.col-count.todo        { background: #DEEBFF; color: #0052CC; }
.col-count.in_progress { background: #FFF0B3; color: #7A4A00; }
.col-count.blocked     { background: #FFEBE6; color: #DE350B; }
.col-count.done        { background: #E3FCEF; color: #006644; }

/* ════════════════════════════════════════════════
   BOARD
════════════════════════════════════════════════ */
.kanban-board {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 12px; padding: 16px;
  flex: 1; overflow: hidden; min-height: 0;
}

/* ════════════════════════════════════════════════
   COLUMN
════════════════════════════════════════════════ */
.kanban-col {
  background: #EBECF0;
  border-radius: 10px;
  border: 2px solid transparent;
  display: flex; flex-direction: column;
  min-height: 0; overflow: hidden;
  transition: border-color .15s, background .15s;
}
.kanban-col.drag-over {
  border-color: #0052CC;
  background: #E6F0FF;
}

/* Column color accents */
.kanban-col.todo        .col-header { border-top: 3px solid #0052CC; }
.kanban-col.in_progress .col-header { border-top: 3px solid #FF991F; }
.kanban-col.blocked     .col-header { border-top: 3px solid #DE350B; }
.kanban-col.done        .col-header { border-top: 3px solid #36B37E; }

.col-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px 8px;
  background: #fff; border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}
.col-header-left { display: flex; align-items: center; gap: 8px; }

.col-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.col-dot.todo        { background: #0052CC; }
.col-dot.in_progress { background: #FF991F; }
.col-dot.blocked     { background: #DE350B; }
.col-dot.done        { background: #36B37E; }

.col-label { font-size: 13px; font-weight: 700; color: #172B4D; }
.col-badge {
  border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 700;
}
.col-badge.todo        { background: #DEEBFF; color: #0052CC; }
.col-badge.in_progress { background: #FFF0B3; color: #7A4A00; }
.col-badge.blocked     { background: #FFEBE6; color: #DE350B; }
.col-badge.done        { background: #E3FCEF; color: #006644; }

.col-add-btn {
  width: 26px; height: 26px; border-radius: 6px; border: none;
  background: transparent; color: #7A869A;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0;
}
.col-add-btn:hover { background: #EBECF0; color: #172B4D; }

.col-cards {
  flex: 1; overflow-y: auto;
  padding: 8px; display: flex; flex-direction: column; gap: 8px;
  min-height: 0;
}

.col-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: #C1C7D0; font-size: 13px;
  border: 2px dashed #C1C7D0; border-radius: 8px;
  margin: 8px;
  transition: all .15s;
}
.col-empty.drop-active { border-color: #0052CC; color: #0052CC; background: #E6F0FF; }

/* ════════════════════════════════════════════════
   TASK CARD
════════════════════════════════════════════════ */
.task-card {
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: grab;
  user-select: none;
  border-left: 3px solid #DFE1E6;
  box-shadow: 0 1px 3px rgba(9,30,66,.08);
  transition: box-shadow .15s, transform .1s;
  position: relative;
}
.task-card:hover {
  box-shadow: 0 4px 12px rgba(9,30,66,.15);
  transform: translateY(-1px);
}
.task-card:active { cursor: grabbing; }
.task-card.dragging { opacity: .4; transform: scale(.96); }

/* Priority borders */
.task-card.prio-high   { border-left-color: #DE350B; }
.task-card.prio-medium { border-left-color: #FF991F; }
.task-card.prio-low    { border-left-color: #36B37E; }

/* Locked (done, non-admin) */
.task-card.locked {
  cursor: default; opacity: .85;
  background: #F9FFFC;
  border-left-color: #36B37E;
}
.task-card.locked:hover { box-shadow: 0 1px 3px rgba(9,30,66,.08); transform: none; }

.lock-overlay {
  position: absolute; top: 8px; right: 10px; font-size: 13px; opacity: .6;
}
.drag-handle {
  position: absolute; top: 8px; right: 10px;
  color: #C1C7D0; font-size: 16px; cursor: grab;
  transition: color .1s;
}
.task-card:hover .drag-handle { color: #7A869A; }

/* Card content */
.card-top-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.card-tags { display: flex; gap: 4px; flex-wrap: wrap; }

.vis-chip {
  font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
  display: inline-flex; align-items: center; gap: 3px;
}
.vis-chip.public  { background: #E3FCEF; color: #006644; }
.vis-chip.private { background: #F4F5F7; color: #7A869A; }
.vis-chip.info    { background: #DEEBFF; color: #0052CC; }
.vis-chip.success { background: #E3FCEF; color: #006644; }

.prio-chip {
  font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 3px;
  white-space: nowrap;
}
.prio-chip.high   { background: #FFEBE6; color: #DE350B; }
.prio-chip.medium { background: #FFF0B3; color: #7A4A00; }
.prio-chip.low    { background: #E3FCEF; color: #006644; }

.card-title {
  font-size: 13px; font-weight: 600; color: #172B4D;
  line-height: 1.4; margin-bottom: 6px;
  padding-right: 20px;
}
.card-title.done { text-decoration: line-through; color: #7A869A; }

.card-assignee {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: #7A869A; margin-bottom: 6px;
}
.card-av {
  width: 20px; height: 20px; border-radius: 50%;
  background: #0052CC; color: #fff;
  font-size: 8px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.card-desc {
  font-size: 12px; color: #7A869A; line-height: 1.4; margin-bottom: 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px; border-top: 1px solid #F4F5F7;
}
.card-date  { font-size: 10px; color: #C1C7D0; }
.card-actions { display: flex; gap: 3px; }

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  padding: 12px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  display: flex; align-items: center; gap: 8px;
}
.toast.success { background: #36B37E; color: #fff; }
.toast.error   { background: #DE350B; color: #fff; }
.toast-anim-enter-active, .toast-anim-leave-active { transition: all .3s ease; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateX(20px); }

/* ════════════════════════════════════════════════
   CARD ANIMATION
════════════════════════════════════════════════ */
.card-anim-enter-active { transition: all .25s ease; }
.card-anim-leave-active { transition: all .2s ease; }
.card-anim-enter-from   { opacity: 0; transform: translateY(-8px); }
.card-anim-leave-to     { opacity: 0; transform: translateY(8px); }

/* ════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(9,30,66,.6); backdrop-filter: blur(2px);
  display: flex; align-items: flex-start; justify-content: center;
  z-index: 1000; padding: 32px 20px; overflow-y: auto;
}
.modal-box {
  background: #fff; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(9,30,66,.3);
  width: 100%; max-width: 540px;
  display: flex; flex-direction: column;
  animation: fadeUp .25s ease;
}
.modal-box-lg { max-width: 600px; }
@keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px; border-bottom: 1px solid #EBECF0;
  flex-shrink: 0;
}
.modal-header h2 { font-size: 15px; font-weight: 700; color: #172B4D; }
.modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; border-top: 1px solid #EBECF0; flex-shrink: 0; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group:last-child { margin-bottom: 0; }
label { font-size: 11px; font-weight: 600; color: #7A869A; text-transform: uppercase; letter-spacing: .5px; }
input, select, textarea {
  padding: 9px 12px; border: 2px solid #EBECF0; border-radius: 6px;
  font-size: 14px; font-family: inherit; outline: none; color: #172B4D;
  transition: border-color .15s, box-shadow .15s; width: 100%;
}
input:focus, select:focus, textarea:focus { border-color: #0052CC; box-shadow: 0 0 0 3px rgba(0,82,204,.15); }
.error-msg { color: #DE350B; font-size: 11px; font-weight: 500; }
.form-row  { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }

.vis-toggle { display: flex; gap: 8px; }
.vis-btn {
  flex: 1; padding: 8px; border-radius: 6px;
  border: 2px solid #EBECF0; background: #fff;
  cursor: pointer; font-size: 13px; font-weight: 600;
  text-align: center; transition: all .15s; font-family: inherit;
}
.vis-btn.active { border-color: #0052CC; background: #E6F0FF; color: #0052CC; }
.vis-btn:hover:not(.active) { background: #F4F5F7; }

.locked-hint { font-size: 11px; color: #006644; background: #E3FCEF; padding: 5px 8px; border-radius: 5px; }

/* Upload */
.upload-area {
  border: 2px dashed #DFE1E6; border-radius: 8px; padding: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  cursor: pointer; color: #7A869A; font-size: 13px;
  transition: all .15s; background: #FAFBFC;
}
.upload-area:hover { border-color: #0052CC; background: #E6F0FF; color: #0052CC; }
.upload-area.loading { opacity: .6; pointer-events: none; }

.doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; margin-top: 10px; }
.doc-thumb {
  border: 1px solid #EBECF0; border-radius: 6px; padding: 8px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  position: relative; background: #FAFBFC; text-align: center;
}
.doc-remove-btn {
  position: absolute; top: 3px; right: 3px; border: none; background: #fff;
  border-radius: 3px; font-size: 10px; cursor: pointer; color: #7A869A;
  line-height: 1; padding: 2px 4px;
}
.doc-remove-btn:hover { background: #FFEBE6; color: #DE350B; }
.doc-preview-img { width: 100%; height: 50px; overflow: hidden; border-radius: 4px; }
.doc-preview-img img { width: 100%; height: 100%; object-fit: cover; }
.doc-preview-icon { font-size: 28px; }
.doc-name-link { font-size: 10px; color: #0052CC; text-decoration: underline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; display: block; }

/* Comments */
.comments-section { margin-top: 20px; border-top: 1px solid #EBECF0; padding-top: 16px; }
.comments-title { font-size: 13px; font-weight: 700; color: #172B4D; margin-bottom: 12px; }
.comments-list { display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; margin-bottom: 12px; padding-right: 4px; }
.no-comments { font-size: 12px; color: #C1C7D0; text-align: center; padding: 16px; }
.comment-bubble { background: #F4F5F7; border-radius: 8px; padding: 10px 12px; }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.comment-av {
  width: 22px; height: 22px; border-radius: 50%; background: #0052CC; color: #fff;
  font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.comment-header strong { font-size: 12px; color: #172B4D; }
.comment-time { font-size: 10px; color: #C1C7D0; }
.comment-body { font-size: 12px; color: #7A869A; line-height: 1.4; }

.comment-input-row { display: flex; gap: 8px; }
.comment-input { flex: 1; padding: 8px 12px; border: 2px solid #EBECF0; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.comment-input:focus { border-color: #0052CC; }

/* Timeline */
.timeline-section { margin-top: 20px; border-top: 1px solid #EBECF0; padding-top: 16px; }
.timeline-title { font-size: 13px; font-weight: 700; color: #172B4D; margin-bottom: 14px; }
.timeline { padding-left: 22px; display: flex; flex-direction: column; gap: 0; position: relative; }
.tl-item {
  position: relative; display: flex; gap: 10px;
  padding-bottom: 16px;
}
.tl-item:last-child { padding-bottom: 0; }
.tl-item::before {
  content: ''; position: absolute; left: -14px; top: 14px;
  width: 2px; height: calc(100% - 2px); background: #EBECF0;
}
.tl-item:last-child::before { display: none; }
.tl-dot {
  position: absolute; left: -20px; top: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid #fff; box-shadow: 0 0 0 2px #EBECF0;
  background: #EBECF0; z-index: 1;
}
.tl-dot.created     { background: #0052CC; box-shadow: 0 0 0 2px #0052CC; }
.tl-dot.in_progress { background: #FF991F; box-shadow: 0 0 0 2px #FF991F; }
.tl-dot.blocked     { background: #DE350B; box-shadow: 0 0 0 2px #DE350B; }
.tl-dot.done        { background: #36B37E; box-shadow: 0 0 0 2px #36B37E; }
.tl-content { display: flex; flex-direction: column; gap: 2px; }
.tl-label { font-size: 12px; font-weight: 700; color: #172B4D; }
.tl-note  { font-weight: 400; color: #7A869A; }
.tl-time  { font-size: 11px; color: #7A869A; }

/* ════════════════════════════════════════════════
   CONFIRM / ERROR MODAL
════════════════════════════════════════════════ */
.confirm-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(9,30,66,.3);
  width: 100%;
  max-width: 360px;
  padding: 28px 24px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeUp .25s ease;
}
.confirm-icon {
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-size: 22px;
  margin-bottom: 14px;
  background: #FFF0E0;
}
.confirm-box.error .confirm-icon { background: #FFEBE6; }
.confirm-message {
  font-size: 14px;
  font-weight: 600;
  color: #172B4D;
  line-height: 1.5;
  margin-bottom: 20px;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}
.confirm-actions .btn { flex: 1; justify-content: center; }

/* ════════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .kanban-board { grid-template-columns: repeat(2, 1fr); height: auto; overflow: auto; }
  .kanban-page  { height: auto; overflow: auto; }
}
@media (max-width: 640px) {
  .kanban-board { grid-template-columns: 1fr; padding: 10px; }
  .kanban-header { flex-wrap: wrap; padding: 12px 16px; }
  .kanban-header-left { flex-wrap: wrap; }
  .col-counts { display: none; }
}
</style>