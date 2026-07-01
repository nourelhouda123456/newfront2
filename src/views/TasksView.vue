<template>
  <div class="kanban-page">

    <!-- Header -->
    <div class="kanban-header">
      <div class="kanban-title-block">
        <h1 class="kanban-title">{{ auth.isAdmin ? 'Toutes les tâches' : 'Mes tâches' }}</h1>
        <div class="project-filter-wrap">
          <span class="filter-label">Projet :</span>
          <select v-model="selectedProjectId" class="project-select-filter">
            <option :value="null">Tous les projets</option>
            <option v-for="proj in projectsStore.projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>
        <div class="kanban-counts">
          <span v-for="col in columns" :key="col.status" class="kcount" :class="col.status">
            {{ tasksByStatus(col.status).length }}
          </span>
        </div>
      </div>
      <!-- L'action de créer des tâches est accessible pour l'utilisateur et l'admin -->
      <button class="btn btn-primary" @click="openModal()">+ Nouvelle tâche</button>
    </div>

    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </transition>

    <!-- Board 3 colonnes -->
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
        <!-- En-tête de colonne -->
        <div class="col-header">
          <div class="col-header-left">
            <span class="col-dot" :class="col.status"></span>
            <span class="col-label">{{ col.label }}</span>
            <span class="col-badge">{{ tasksByStatus(col.status).length }}</span>
          </div>
          <!-- L'action de créer des tâches est accessible pour l'utilisateur et l'admin -->
          <button class="col-add-btn" @click="openModal(null, col.status)" title="Ajouter une tâche">+</button>
        </div>

        <!-- Drop zone vide -->
        <div
          v-if="tasksByStatus(col.status).length === 0"
          class="col-empty"
          :class="{ 'drop-target': dragOverCol === col.status }"
        >
          <span>{{ dragOverCol === col.status ? 'Déposer ici' : 'Aucune tâche' }}</span>
        </div>

        <!-- Cards -->
        <transition-group name="card-anim" tag="div" class="col-cards">
          <div
            v-for="task in tasksByStatus(col.status)"
            :key="task._id || task.id"
            class="task-card"
            :class="[`priority-${task.priority}`, { dragging: draggingId === (task._id || task.id), 'task-locked': isTaskLocked(task) }]"
            :draggable="isTaskDraggable(task)"
            @dragstart="onDragStart(task)"
            @dragend="onDragEnd"
          >
            <!-- Drag handle (uniquement si draggable) -->
            <div v-if="isTaskDraggable(task)" class="drag-handle" title="Glisser">⢿</div>
            <!-- Icône verrou pour les tâches terminées (non-admin) -->
            <div v-if="isTaskLocked(task)" class="lock-badge" title="Terminée — seul l'admin peut modifier">🔒</div>

            <!-- Visibilité & Commentaires -->
            <div class="card-meta-top">
              <div style="display: flex; gap: 4px; align-items: center;">
                <span class="vis-tag" :class="task.visibility">
                  {{ task.visibility === 'public' ? '🌐 Publique' : '🔒 Privée' }}
                </span>
                <span v-if="task.comments?.length" class="vis-tag" style="background: #e0f2fe; color: #0369a1; padding: 2px 6px;" title="Commentaires">
                   💬 {{ task.comments.length }}
                </span>
                <span v-if="task.documents?.length" class="vis-tag" style="background: #f0fdf4; color: #166534; padding: 2px 6px;" title="Documents joints">
                   📎 {{ task.documents.length }}
                </span>
              </div>
              <span class="priority-pip" :class="task.priority">{{ priorityLabel(task.priority) }}</span>
            </div>

            <h3 class="card-title">{{ task.title }}</h3>
            
            <!-- Assignee -->
            <div v-if="task.assignee" class="card-assignee" style="font-size: 11px; color: var(--gray-7); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <span>👤 Assignée à : <strong>{{ task.assignee.name }}</strong></span>
            </div>

            <p v-if="task.description" class="card-desc">{{ task.description }}</p>

            <!-- Owner (admin or other user) -->
            <div v-if="task.owner && (auth.isAdmin || (task.owner?.id || task.owner?._id) !== auth.currentUser?.id)" class="card-owner">
              <div class="mini-av">{{ ownerInitials(task.owner) }}</div>
              <span>{{ task.owner.name }}</span>
            </div>

            <!-- Footer -->
            <div class="card-footer">
              <div class="card-dates">
                <span class="card-date">📅 {{ formatDateTime(task.createdAt) }}</span>
                <span v-if="task.closedAt" class="card-date card-closed">✅ {{ formatDateTime(task.closedAt) }}</span>
              </div>
              <div v-if="canEditTask(task)" class="card-actions">
                <button class="icon-btn" @click="openModal(task)" title="Modifier">✎</button>
                <button v-if="isTaskDeletable(task)" class="icon-btn danger" @click="deleteTask(task._id || task.id)" title="Supprimer">✕</button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <h2>{{ editingTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>
          <button class="icon-btn" @click="closeModal">✕</button>
        </div>

        <div class="form-group">
          <label>Projet *</label>
          <select v-model="form.project" :disabled="!!editingTask">
            <option :value="null" disabled>Sélectionner un projet</option>
            <option v-for="proj in projectsStore.projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
          <span v-if="formError && !form.project" class="error-msg">Projet obligatoire</span>
          <span v-if="!projectsStore.projects.length" class="error-msg">
            ⚠️ Vous devez d'abord faire partie d'un projet pour créer une tâche.
          </span>
        </div>

        <div class="form-group">
          <label>Titre *</label>
          <input v-model="form.title" placeholder="Titre de la tâche" :disabled="!auth.isAdmin && !!editingTask" />
          <span v-if="formError && !form.title" class="error-msg">Champ obligatoire</span>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Détails optionnels…" :disabled="!auth.isAdmin && !!editingTask"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>Priorité</label>
            <select v-model="form.priority" :disabled="!auth.isAdmin">
              <option value="low">🔵 Basse</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
          </div>
          <div class="form-group" style="flex:1">
            <label>Statut</label>
            <!-- User ne peut pas choisir 'done' s'il est déjà done. Admin peut tout -->
            <select v-model="form.status" :disabled="isStatusSelectDisabled">
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="blocked">🔴 Bloqué</option>
              <option value="done" :disabled="!auth.isAdmin">Terminé {{ !auth.isAdmin ? '(admin only)' : '' }}</option>
            </select>
            <span v-if="editingTask?.status === 'done' && !auth.isAdmin" class="locked-msg">
              🔒 Cette tâche est terminée. Seul un administrateur peut la rouvrir.
            </span>
          </div>
        </div>

        <!-- Visibilité — admin seulement -->
        <div v-if="auth.isAdmin" class="form-group">
          <label>Visibilité</label>
          <div class="vis-toggle">
            <button
              :class="['vis-btn', form.visibility === 'private' ? 'active' : '']"
              @click="form.visibility = 'private'"
            > Privée<span class="vis-hint"> </span></button>
            <button
              :class="['vis-btn', form.visibility === 'public' ? 'active' : '']"
              @click="form.visibility = 'public'"
            > Publique<span class="vis-hint"> </span></button>
          </div>
        </div>

        <!-- Assignee Selection — admin seulement -->
        <div v-if="auth.isAdmin" class="form-group" style="margin-top: 14px;">
          <label>Assigner à</label>
          <select v-model="form.assignee">       
            <option :value="null">Non assignée 👤</option>
            <option v-for="user in auth.users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>

        <!-- Assignee Selection — user simple (ne peut pas affecter aux autres) -->
        <div v-else class="form-group" style="margin-top: 14px;">
          <label>Assigné à</label>
          <select v-model="form.assignee" :disabled="true">
            <option :value="auth.currentUser?.id || auth.currentUser?._id">Moi-même ({{ auth.currentUser?.name }}) 👤</option>
            <option :value="null">Non assignée 👤</option>
          </select>
          <span class="vis-hint" style="margin-top:2px;">Seul l'administrateur peut réassigner cette tâche à autrui.</span>
        </div>

        <!-- Documents Upload Section -->
        <div class="form-group" style="margin-top: 14px; border-top: 1px solid var(--gray-3); padding-top: 16px;">
          <label style="font-weight: 600; font-size: 13px;">📎 Documents joints (Images, PDF, Graphes...)</label>
          <div class="file-upload-wrapper" style="display:flex; align-items:center; gap:10px; margin-top: 6px;">
            <input type="file" @change="handleFileUpload" :disabled="uploadLoading" id="task-file-input" style="display:none;" />
            <label for="task-file-input" class="btn btn-ghost btn-sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; border:1px dashed var(--gray-4); padding:8px 12px; border-radius:var(--radius); font-size: 12px;">
              📎 {{ uploadLoading ? 'Téléversement…' : 'Importer un document' }}
            </label>
          </div>

          <!-- List of documents -->
          <div v-if="form.documents && form.documents.length" class="task-docs-container" style="margin-top:12px; display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:10px;">
            <div v-for="(doc, idx) in form.documents" :key="idx" class="task-doc-card" style="border: 1px solid var(--gray-2); border-radius:var(--radius); padding:8px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; position:relative; background:var(--gray-1); text-align:center; min-height: 100px;">
              <button class="icon-btn danger" @click.stop="removeDocument(idx)" title="Supprimer" style="position:absolute; top:4px; right:4px; border:none; background:transparent; font-size:10px; cursor:pointer;">✕</button>
              
              <!-- Preview image -->
              <div v-if="isImage(doc.url)" class="doc-preview-img-wrap" style="width:100%; height:60px; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:4px; margin-bottom:6px; background:#fff; border: 1px solid var(--gray-2);">
                <img :src="doc.url" alt="Preview" style="max-width:100%; max-height:100%; object-fit:cover;" />
              </div>
              <!-- Preview PDF/icon -->
              <div v-else class="doc-preview-icon" style="font-size:28px; margin-bottom:6px; line-height: 1;">
                📄
              </div>
              
              <a :href="doc.url" target="_blank" style="font-size:11px; color:var(--blue); text-decoration:underline; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block;" :title="doc.name">
                {{ doc.name }}
              </a>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div v-if="editingTask" class="modal-comments-section" style="margin-top: 20px; border-top: 1px solid var(--gray-3); padding-top: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">Commentaires ({{ editingTask.comments?.length || 0 }})</h4>
          
          <div class="comments-list-box" style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding-right: 4px;">
            <div v-if="!editingTask.comments?.length" style="font-size: 12px; color: var(--gray-5); text-align: center; padding: 10px;">
              Aucun commentaire.
            </div>
            <div v-for="comment in editingTask.comments" :key="comment._id || comment.id" class="comment-bubble" style="background: var(--gray-1); padding: 8px 10px; border-radius: 8px; font-size: 12px; position: relative;">
              <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--gray-7); margin-bottom: 3px; padding-right: 18px;">
                <span>{{ comment.author?.name || 'Utilisateur' }}</span>
                <span style="font-size: 10px; font-weight: 400; color: var(--gray-5);">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p style="color: var(--gray-9); line-height: 1.4;">{{ comment.content }}</p>
              <button 
                v-if="canDeleteComment(comment)" 
                @click="deleteComment(comment._id || comment.id)" 
                style="position: absolute; top: 6px; right: 8px; border: none; background: transparent; color: var(--gray-5); cursor: pointer; font-size: 11px;"
                title="Supprimer"
              >✕</button>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <input v-model="newCommentText" placeholder="Écrire un commentaire…" style="flex: 1; padding: 6px 10px; font-size: 12px; min-width: 0;" @keyup.enter="submitComment" />
            <button class="btn btn-primary btn-sm" @click="submitComment" :disabled="commentSaving">Ajouter</button>
          </div>
        </div>

          <!-- Timeline Section enrichie avec statusHistory -->
          <div v-if="editingTask" class="modal-timeline-section">
            <h4 class="timeline-heading">⏱ Historique des statuts</h4>
            <div class="timeline-track">

              <!-- Création -->
              <div class="tl-item">
                <div class="tl-dot created"></div>
                <div class="tl-line"></div>
                <div class="tl-content">
                  <span class="tl-label">Créée</span>
                  <span class="tl-time">{{ formatDateTime(editingTask.createdAt) }}</span>
                </div>
              </div>

              <!-- Entrées de l'historique de statut -->
              <div
                v-for="(entry, idx) in editingTask.statusHistory"
                :key="idx"
                class="tl-item"
              >
                <div class="tl-dot" :class="entry.newStatus"></div>
                <div v-if="idx < (editingTask.statusHistory?.length || 0) - 1" class="tl-line"></div>
                <div class="tl-content">
                  <span class="tl-label">
                    {{ statusLabel(entry.newStatus) }}
                    <span v-if="entry.note" class="tl-note">— {{ entry.note }}</span>
                  </span>
                  <span class="tl-time">
                    {{ formatDateTime(entry.changedAt) }}
                    <span v-if="entry.changedBy" class="tl-by"> par {{ entry.changedBy.name || entry.changedBy }}</span>
                  </span>
                </div>
              </div>

              <!-- Statut actuel si l'historique est vide -->
              <div v-if="!editingTask.statusHistory?.length" class="tl-item">
                <div class="tl-dot" :class="editingTask.status"></div>
                <div class="tl-content">
                  <span class="tl-label">{{ statusLabel(editingTask.status) }}</span>
                  <span class="tl-time">Statut actuel</span>
                </div>
              </div>

            </div>
          </div>

        <div class="modal-foot" style="margin-top: 16px;">
          <button class="btn btn-ghost" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="submitForm" :disabled="saving">
            {{ saving ? 'Enregistrement…' : (editingTask ? 'Enregistrer' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'
import { useProjectsStore } from '../stores/projects.js'

const auth          = useAuthStore()
const tasksStore    = useTasksStore()
const projectsStore = useProjectsStore()
const route         = useRoute()

const selectedProjectId = ref(null)

// ── Colonnes ──────────────────────────────────────────────────────────────
const columns = [
  { status: 'todo',        label: 'À faire' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'blocked',     label: 'Bloqué' },
  { status: 'done',        label: 'Terminé'  },
]

// ── Drag & Drop state ─────────────────────────────────────────────────────
const draggingId  = ref(null)
const draggingTask = ref(null)
const dragOverCol = ref(null)

function onDragStart(task) {
  draggingId.value   = task._id || task.id
  draggingTask.value = task
}

function onDragOver(status) {
  dragOverCol.value = status
}

function onDragLeave() {
  dragOverCol.value = null
}

async function onDrop(newStatus) {
  dragOverCol.value = null
  if (!draggingTask.value) return
  const task = draggingTask.value
  const oldStatus = task.status
  if (oldStatus === newStatus) return

 

  // Optimistic update
  task.status = newStatus

  try {
    await tasksStore.updateTask(task._id || task.id, { status: newStatus })
    showToast(`Déplacé vers « ${columns.find(c => c.status === newStatus)?.label} »`, 'success')
  } catch (e) {
    task.status = oldStatus
    showToast('Erreur lors du déplacement', 'error')
  }
}

function onDragEnd() {
  draggingId.value   = null
  draggingTask.value = null
  dragOverCol.value  = null
}

// ── Filtrage ──────────────────────────────────────────────────────────────
function tasksByStatus(status) {
  let filtered = tasksStore.tasks.filter(t => t.status === status)
  if (selectedProjectId.value) {
    filtered = filtered.filter(t => {
      const pId = t.project?.id || t.project?._id || t.project
      return pId === selectedProjectId.value
    })
  }
  return filtered
}

// ── Modal ─────────────────────────────────────────────────────────────────
const showModal   = ref(false)
const editingTask = ref(null)
const formError   = ref(false)
const saving      = ref(false)
const form        = reactive({ title: '', description: '', priority: 'medium', status: 'todo', visibility: 'private', assignee: null, project: null, documents: [] })
const uploadLoading = ref(false)

const newCommentText = ref('')
const commentSaving = ref(false)

function isImage(url) {
  if (!url) return false
  return /\.(jpeg|jpg|gif|png|webp|svg)/i.test(url)
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
      headers: {
        'Authorization': `Bearer ${auth.token}`
      },
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    form.documents.push({
      name: data.name,
      url: data.url
    })
    showToast('Fichier importé avec succès.', 'success')
  } catch (e) {
    showToast(e.message || "Erreur lors de l'import du fichier.", 'error')
  } finally {
    uploadLoading.value = false
    event.target.value = ''
  }
}

function removeDocument(index) {
  form.documents.splice(index, 1)
}

function openModal(task = null, defaultStatus = 'todo') {
  editingTask.value = task
  formError.value   = false
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
    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value._id || editingTask.value.id, {
        title: form.title, description: form.description,
        priority: form.priority, status: form.status, visibility: form.visibility,
        assignee: form.assignee,
        documents: form.documents,
      })
      showToast('Tâche mise à jour', 'success')
    } else {
      await tasksStore.addTask({
        title: form.title, description: form.description,
        priority: form.priority, status: form.status, visibility: form.visibility,
        assignee: form.assignee,
        project: form.project,
        documents: form.documents,
      })
      showToast('Tâche créée', 'success')
    }
    closeModal()
  } catch (e) {
    showToast(e.message || 'Erreur', 'error')
  } finally {
    saving.value = false
  }
}

async function submitComment() {
  if (!newCommentText.value.trim()) return
  commentSaving.value = true
  try {
    const updatedTask = await tasksStore.addComment(editingTask.value._id || editingTask.value.id, newCommentText.value.trim())
    editingTask.value = updatedTask
    newCommentText.value = ''
    showToast('Commentaire ajouté', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur', 'error')
  } finally {
    commentSaving.value = false
  }
}

async function deleteComment(commentId) {
  if (!confirm('Supprimer ce commentaire ?')) return
  try {
    const updatedTask = await tasksStore.deleteComment(editingTask.value._id || editingTask.value.id, commentId)
    editingTask.value = updatedTask
    showToast('Commentaire supprimé', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur', 'error')
  }
}

function canDeleteComment(comment) {
  const commentAuthorId = comment.author?.id || comment.author?._id || comment.author
  const taskOwnerId = editingTask.value?.owner?.id || editingTask.value?.owner?._id || editingTask.value?.owner
  const currentUserId = auth.currentUser?.id || auth.currentUser?._id
  return auth.isAdmin || commentAuthorId === currentUserId || taskOwnerId === currentUserId
}

async function deleteTask(id) {
  if (!confirm('Supprimer cette tâche ?')) return
  try {
    await tasksStore.deleteTask(id)
    showToast('Tâche supprimée', 'success')
  } catch {
    showToast('Erreur lors de la suppression', 'error')
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg  = msg
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => toast.show = false, 3000)
}

// ── Helpers ───────────────────────────────────────────────────────────────
const priorityLabel = p => ({ low: '🔵 Basse', medium: '🟡 Moyenne', high: '🔴 Haute' }[p])

// ── Helpers de permission ─────────────────────────────────────────────────

// Tâche verrouillée = done ET non-admin
function isTaskLocked(task) {
  return task.status === 'done' && !auth.isAdmin
}

// Draggable = admin toujours, user seulement si pas done et assignee
function isTaskDraggable(task) {
  if (auth.isAdmin) return true
  if (task.status === 'done') return false
  const assigneeId    = task.assignee?.id || task.assignee?._id || task.assignee
  const currentUserId = auth.currentUser?.id || auth.currentUser?._id
  return assigneeId && assigneeId === currentUserId
}

// Peut ouvrir le panneau d'édition (modal)
function canEditTask(task) {
  if (auth.isAdmin) return true
  // Un user peut ouvrir le modal d'une tâche qui lui est assignée (pour changer statut)
  // mais pas si elle est done
  if (task.status === 'done') return false
  const assigneeId    = task.assignee?.id || task.assignee?._id || task.assignee
  const currentUserId = auth.currentUser?.id || auth.currentUser?._id
  return assigneeId && assigneeId === currentUserId
}

// isTaskEditable = règle ancienne, gardée pour compatibilité
function isTaskEditable(task) {
  return canEditTask(task)
}

function isTaskDeletable(task) {
  return auth.isAdmin
}

// Le select de statut est disabled si :
// - La tâche est done et l'user n'est pas admin
const isStatusSelectDisabled = computed(() => {
  if (!editingTask.value) return false
  return editingTask.value.status === 'done' && !auth.isAdmin
})

function ownerInitials(owner) {
  if (!owner?.name) return '?'
  return owner.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const STATUS_LABELS = {
  todo:        'À faire',
  in_progress: 'En cours',
  blocked:     'Bloqué',
  done:        'Terminé',
}
function statusLabel(s) {
  return STATUS_LABELS[s] || s
}

// ── Init ──────────────────────────────────────────────────────────────────
onMounted(() => {
  tasksStore.fetchTasks()
  auth.fetchUsers()
  projectsStore.fetchProjects()
  if (route.query.projectId) {
    selectedProjectId.value = route.query.projectId
  }
})
</script>

<style scoped>
/* ── Layout général ─────────────────────────────────────────────────────── */
.kanban-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--gray-1);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.kanban-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--gray-3);
  flex-shrink: 0;
}
.kanban-title-block { display: flex; align-items: center; gap: 20px; }
.project-filter-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gray-1);
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--gray-3);
}
.filter-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--gray-5);
  text-transform: uppercase;
  letter-spacing: .5px;
  user-select: none;
}
.project-select-filter {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-8);
  outline: none;
  cursor: pointer;
}
.kanban-title { font-size: 18px; font-weight: 700; }
.kanban-counts { display: flex; gap: 6px; }
.kcount {
  padding: 2px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
}
.kcount.todo        { background: #fef3c7; color: #92400e; }
.kcount.in_progress { background: var(--blue-lt); color: var(--blue); }
.kcount.blocked     { background: #fee2e2; color: #991b1b; }
.kcount.done        { background: #dcfce7; color: #15803d; }

/* ── Board ───────────────────────────────────────────────────────────────── */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 24px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── Colonne ─────────────────────────────────────────────────────────────── */
.kanban-col {
  background: var(--gray-1);
  border-radius: 12px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: border-color .15s, background .15s;
}
.kanban-col.drag-over {
  border-color: var(--blue);
  background: var(--blue-lt);
}

.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  flex-shrink: 0;
}
.col-header-left { display: flex; align-items: center; gap: 8px; }

.col-dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
}
.col-dot.todo        { background: #f59e0b; }
.col-dot.in_progress { background: var(--blue); }
.col-dot.blocked     { background: #ef4444; }
.col-dot.done        { background: #22c55e; }

.col-label { font-size: 13px; font-weight: 700; color: var(--gray-9); }
.col-badge {
  background: var(--gray-3); color: var(--gray-7);
  border-radius: 99px; padding: 1px 7px; font-size: 11px; font-weight: 600;
}

.col-add-btn {
  width: 24px; height: 24px; border-radius: 6px; border: none;
  background: transparent; color: var(--gray-5); font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  line-height: 1; transition: all .15s;
}
.col-add-btn:hover { background: var(--gray-3); color: var(--gray-9); }

/* Scroll interne de la colonne */
.col-cards {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.col-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-5);
  font-size: 13px;
  border: 2px dashed var(--gray-3);
  border-radius: 10px;
  margin: 4px 10px 10px;
  transition: all .15s;
}
.col-empty.drop-target {
  border-color: var(--blue);
  color: var(--blue);
  background: var(--blue-lt);
}

/* ── Task Card ───────────────────────────────────────────────────────────── */
.task-card {
  background: white;
  border: 1px solid var(--gray-3);
  border-radius: 10px;
  padding: 12px;
  cursor: grab;
  user-select: none;
  border-left: 4px solid var(--gray-3);
  transition: box-shadow .15s, transform .1s, opacity .15s;
  position: relative;
}
.task-card:active  { cursor: grabbing; }
.task-card:hover   { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.task-card.dragging {
  opacity: .4;
  transform: scale(.97);
}
.priority-high   { border-left-color: #E24B4A; }
.priority-medium { border-left-color: #f59e0b; }
.priority-low    { border-left-color: #22c55e; }

.drag-handle {
  position: absolute;
  top: 8px; right: 10px;
  color: var(--gray-3);
  font-size: 16px;
  letter-spacing: 1px;
  cursor: grab;
}
.task-card:hover .drag-handle { color: var(--gray-5); }

/* ── Tâche verrouillée (done, non-admin) ──────────────────────────────────── */
.task-card.task-locked {
  cursor: default;
  opacity: .85;
  border-left-color: #22c55e;
  background: #f0fdf4;
}
.task-card.task-locked:hover { box-shadow: none; }

.lock-badge {
  position: absolute;
  top: 8px; right: 10px;
  font-size: 14px;
  opacity: .6;
}

.locked-msg {
  font-size: 11px;
  color: #15803d;
  background: #dcfce7;
  padding: 5px 8px;
  border-radius: 6px;
  display: block;
  margin-top: 4px;
}

.card-meta-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.vis-tag {
  font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 99px;
}
.vis-tag.public  { background: #dcfce7; color: #15803d; }
.vis-tag.private { background: var(--gray-2); color: var(--gray-5); }

.priority-pip {
  font-size: 11px; font-weight: 500; color: var(--gray-5);
}

.card-title  { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 5px; }
.card-desc   { font-size: 12px; color: var(--gray-5); line-height: 1.5; margin-bottom: 8px; }

.card-owner {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--blue); margin-bottom: 8px;
}
.mini-av {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--blue-lt); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 8px;
  border-top: 1px solid var(--gray-2);
}
.card-dates   { display: flex; flex-direction: column; gap: 2px; }
.card-date    { font-size: 10px; color: var(--gray-5); }
.card-closed  { color: #15803d; }
.card-actions { display: flex; gap: 4px; flex-shrink: 0; }

.icon-btn {
  width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--gray-3);
  background: transparent; cursor: pointer; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gray-7); transition: all .12s;
}
.icon-btn:hover       { background: var(--gray-2); }
.icon-btn.danger:hover { background: #fcebeb; color: #E24B4A; border-color: #fca5a5; }

/* ── Modal ───────────────────────────────────────────────────────────────── */
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
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
label { font-size: 13px; font-weight: 600; color: var(--gray-7); }
input, select, textarea {
  padding: 9px 12px; border: 1px solid var(--gray-3); border-radius: 8px;
  font-size: 14px; font-family: inherit; outline: none; background: white;
  transition: border-color .15s;
}
input:focus, select:focus, textarea:focus { border-color: var(--blue); }
.error-msg { color: #E24B4A; font-size: 12px; }
.form-row  { display: flex; gap: 12px; }

.vis-toggle { display: flex; gap: 8px; }
.vis-btn {
  flex: 1; padding: 10px 8px; border-radius: 8px;
  border: 1px solid var(--gray-3); background: white; cursor: pointer;
  font-size: 12px; font-weight: 600; text-align: center; transition: all .15s;
  display: flex; flex-direction: column; gap: 2px; align-items: center;
}
.vis-btn.active { border-color: var(--blue); background: var(--blue-lt); color: var(--blue); }
.vis-hint { font-size: 10px; font-weight: 400; color: var(--gray-5); }
.vis-btn.active .vis-hint { color: var(--blue); opacity: .7; }

/* ── Toast ───────────────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  padding: 12px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,.12);
}
.toast.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.toast.error   { background: #fcebeb; color: #E24B4A; border: 1px solid #fca5a5; }

/* ── Animations ──────────────────────────────────────────────────────────── */
.card-anim-enter-active { transition: all .25s ease; }
.card-anim-leave-active { transition: all .2s ease; }
.card-anim-enter-from   { opacity: 0; transform: translateY(-8px); }
.card-anim-leave-to     { opacity: 0; transform: translateY(8px); }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(12px); }

/* ── Timeline Modal Section ─────────────────────────────────────────────────── */
.modal-timeline-section {
  margin-top: 20px;
  border-top: 1px solid var(--gray-3);
  padding-top: 16px;
}
.timeline-heading {
  font-size: 13px; font-weight: 700;
  color: var(--gray-7);
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 6px;
}

.timeline-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 22px;
}

.tl-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 16px;
}
.tl-item:last-child { padding-bottom: 0; }

/* Vertical connector line runs through the tl-line div */
.tl-line {
  position: absolute;
  left: -13px;
  top: 14px;
  width: 2px;
  height: calc(100% - 2px);
  background: var(--gray-3);
}
.tl-item:last-child .tl-line { display: none; }

/* Coloured dot */
.tl-dot {
  position: absolute;
  left: -20px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--gray-3);
  flex-shrink: 0;
  transition: box-shadow .2s;
  z-index: 1;
}
.tl-dot.created     { background: var(--blue);  box-shadow: 0 0 0 2px var(--blue); }
.tl-dot.in_progress { background: #a78bfa;       box-shadow: 0 0 0 2px #a78bfa; }
.tl-dot.blocked     { background: var(--red);   box-shadow: 0 0 0 2px var(--red); }
.tl-dot.done        { background: var(--green); box-shadow: 0 0 0 2px var(--green); }
.tl-dot.tl-dot-pending {
  background: var(--gray-2);
  box-shadow: 0 0 0 2px var(--gray-3);
}

.tl-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tl-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--gray-9);
}
.tl-time {
  font-size: 11px;
  color: var(--gray-5);
}

/* Inactive step (greyed out) */
.tl-inactive .tl-label { color: var(--gray-5); font-weight: 500; }
.tl-inactive .tl-dot.in_progress { background: var(--gray-2); box-shadow: 0 0 0 2px var(--gray-3); }
.tl-inactive .tl-dot.blocked     { background: var(--gray-2); box-shadow: 0 0 0 2px var(--gray-3); }

/* Modal scroll if content is tall */
.modal-box { max-height: 90vh; overflow-y: auto; }
</style>