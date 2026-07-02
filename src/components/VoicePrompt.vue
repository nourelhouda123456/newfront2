<template>
  <div v-if="voicePromptState.isOpen" class="vp-overlay" @click.self="closePrompt">
    <div class="vp-modal">
      <div class="vp-header">
        <h2>🎙️ Création vocale</h2>
        <button class="btn-icon" @click="closePrompt">✕</button>
      </div>

      <div class="vp-body">
        <div class="vp-status" :class="{ listening: isListening }">
          <div class="vp-mic" @click="toggleListening">
            <span v-if="isListening" class="pulse">🔴</span>
            <span v-else>🎤</span>
          </div>
          <p>{{ isListening ? 'Je vous écoute, parlez...' : 'Microphone désactivé' }}</p>
        </div>

        <div class="vp-transcript">
          <p class="final-text">{{ finalTranscript }}</p>
          <p class="interim-text">{{ interimTranscript }}</p>
        </div>

        <div class="vp-parsed-data">
          <h3>Informations extraites</h3>
          
          <div class="form-group" v-if="auth.isAdmin">
            <label>Type de création</label>
            <div class="type-toggle">
              <button :class="{ active: parsedData.type === 'project' }" @click="parsedData.type = 'project'">📁 Projet</button>
              <button :class="{ active: parsedData.type === 'task' }" @click="parsedData.type = 'task'">✅ Tâche</button>
            </div>
          </div>
          <div v-else class="form-group">
            <label>Type de création</label>
            <div class="type-toggle">
              <button class="active" style="cursor:default">✅ Nouvelle tâche</button>
            </div>
          </div>

          <!-- COMMON FIELDS -->
          <div class="form-group">
            <label>Titre / Nom *</label>
            <input v-model="parsedData.title" placeholder="En attente du titre..." class="vp-input" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="parsedData.description" rows="2" placeholder="En attente de la description..." class="vp-input"></textarea>
          </div>

          <!-- TASK SPECIFIC FIELDS -->
          <template v-if="parsedData.type === 'task'">
            <div class="form-group">
              <label>Projet associé (ID) *</label>
              <select v-model="parsedData.project" class="vp-select">
                <option :value="null">Sélectionner un projet…</option>
                <option v-for="proj in projectsStore.projects" :key="proj.id" :value="proj.id">
                  {{ proj.name }}
                </option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Priorité</label>
                <select v-model="parsedData.priority" class="vp-select">
                  <option value="low">🟢 Basse</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🔴 Haute</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select v-model="parsedData.status" class="vp-select">
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="blocked">🔴 Bloqué</option>
                  <option value="done">Terminé</option>
                </select>
              </div>
            </div>

            <div class="form-row" v-if="auth.isAdmin">
              <div class="form-group">
                <label>Visibilité</label>
                <select v-model="parsedData.visibility" class="vp-select">
                  <option value="private">🔒 Privée</option>
                  <option value="public">🌐 Publique</option>
                </select>
              </div>
              <div class="form-group">
                <label>Assigner à</label>
                <select v-model="parsedData.assignee" class="vp-select">
                  <option :value="null">Non assignée 👤</option>
                  <option v-for="user in auth.users" :key="user.id" :value="user.id">
                    {{ user.name }}
                  </option>
                </select>
              </div>
            </div>
          </template>

          <!-- PROJECT SPECIFIC FIELDS -->
          <template v-if="parsedData.type === 'project'">
            <div class="form-row">
              <div class="form-group">
                <label>Date limite</label>
                <input type="date" v-model="parsedData.deadline" class="vp-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Collaborateurs (Maintien Ctrl pour sélection multiple)</label>
              <select v-model="parsedData.assignedUsers" multiple class="vp-select" style="height: 60px">
                <option v-for="user in auth.users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </template>

          <!-- DOCUMENTS UPLOAD (Both) -->
          <div class="form-group upload-section">
            <label>📎 Documents joints (manuel)</label>
            <div class="upload-area" @click="triggerUpload" :class="{ loading: uploadLoading }">
              <input type="file" ref="fileInputRef" @change="handleFileUpload" :disabled="uploadLoading" style="display:none;" accept="image/*,.pdf,.csv,.xlsx,.docx" />
              <span>{{ uploadLoading ? 'Téléversement…' : 'Cliquer pour importer des fichiers' }}</span>
            </div>
            <div v-if="parsedData.documents.length" class="doc-list">
              <div v-for="(doc, idx) in parsedData.documents" :key="idx" class="doc-item">
                <span class="doc-name">{{ doc.name }}</span>
                <button class="btn-icon danger" @click="removeDocument(idx)">✕</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="vp-footer">
        <button class="btn btn-ghost" @click="closePrompt">Annuler</button>
        <button class="btn btn-primary" @click="confirmCreation" :disabled="!isReadyToSubmit || isSaving">
          <span v-if="isSaving">Création...</span>
          <span v-else>Confirmer</span>
        </button>
      </div>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.msg }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { voicePromptState } from '../composables/voicePromptState.js'
import { useVoiceDictation } from '../composables/useVoiceDictation.js'
import { useProjectsStore } from '../stores/projects.js'
import { useTasksStore } from '../stores/tasks.js'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const router = useRouter()
const fileInputRef = ref(null)

const {
  isListening,
  finalTranscript,
  interimTranscript,
  startListening,
  stopListening,
  resetTranscripts
} = useVoiceDictation()

const parsedData = reactive({
  type: 'task',
  title: '',
  description: '',
  project: null,
  priority: 'medium',
  status: 'todo',
  visibility: 'private',
  assignee: null,
  assignedUsers: [],
  deadline: '',
  documents: []
})

const isSaving = ref(false)
const uploadLoading = ref(false)
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  Object.assign(toast, { show: true, msg, type })
  toastTimer = setTimeout(() => toast.show = false, 3000)
}

// Listen to modal open/close
watch(() => voicePromptState.isOpen, (newVal) => {
  if (newVal) {
    projectsStore.fetchProjects()
    if (auth.isAdmin) {
      auth.fetchUsers()
    }
    resetPrompt()
    try {
      startListening()
    } catch (e) {
      showToast('Impossible de démarrer le micro.', 'error')
    }
  } else {
    stopListening()
  }
})

// Parse logic
watch([finalTranscript, interimTranscript], () => {
  const fullText = (finalTranscript.value + ' ' + interimTranscript.value).toLowerCase()
  parseText(fullText)
})

function parseText(text) {
  // Detect type (only if admin)
  if (auth.isAdmin) {
    if (text.includes('projet')) {
      parsedData.type = 'project'
    } else if (text.includes('tâche') || text.includes('tache')) {
      parsedData.type = 'task'
    }
  } else {
    parsedData.type = 'task'
  }

  const stopWords = '(?:titre|nom|description|priorité|statut|visibilité|date limite|collaborateurs?|assigné à|$)'

  // Extract title
  const titleMatch = text.match(new RegExp(`(?:titre|nom)(?:\\s+(?:de\\s+projet|de\\s+tâche|est))*\\s+(.*?)(?:\\s+(?:et\\s+)?(?:la\\s+|le\\s+)?${stopWords})`, 'i'))
  if (titleMatch && titleMatch[1]) {
    parsedData.title = capitalize(titleMatch[1].trim())
  }

  // Extract description
  const descMatch = text.match(new RegExp(`description(?:\\s+est)?\\s+(.*?)(?:\\s+(?:et\\s+)?(?:le\\s+|la\\s+)?${stopWords})`, 'i'))
  if (descMatch && descMatch[1]) {
    parsedData.description = capitalize(descMatch[1].trim())
  }

  // Extract Priority
  if (text.includes('priorité basse') || text.includes('mineur')) {
    parsedData.priority = 'low'
  } else if (text.includes('priorité haute') || text.includes('urgent') || text.includes('critique')) {
    parsedData.priority = 'high'
  } else if (text.includes('priorité moyenne')) {
    parsedData.priority = 'medium'
  }

  // Extract Status
  if (text.includes('statut terminé') || text.includes('est terminé')) {
    parsedData.status = 'done'
  } else if (text.includes('statut en cours')) {
    parsedData.status = 'in_progress'
  } else if (text.includes('statut bloqué')) {
    parsedData.status = 'blocked'
  } else if (text.includes('statut à faire')) {
    parsedData.status = 'todo'
  }

  // Extract Visibility
  if (text.includes('visibilité publique') || text.includes('est publique')) {
    parsedData.visibility = 'public'
  } else if (text.includes('visibilité privée') || text.includes('est privée')) {
    parsedData.visibility = 'private'
  }

  // Extract Date limite
  const deadlineMatch = text.match(new RegExp(`date limite(?:\\s+est|\\s+le|\\s+au)?\\s+(.*?)(?:\\s+(?:et\\s+)?(?:le\\s+|la\\s+)?${stopWords})`, 'i'))
  if (deadlineMatch && deadlineMatch[1]) {
    const parsedDate = parseSpokenDate(deadlineMatch[1].trim())
    if (parsedDate) {
      parsedData.deadline = parsedDate
    }
  }

  // Extract Collaborateurs / Assigné à
  const collabMatch = text.match(new RegExp(`(?:collaborateurs?|assigné à|pour)\\s+(.*?)(?:\\s+(?:et\\s+)?(?:le\\s+|la\\s+)?${stopWords})`, 'i'))
  if (collabMatch && collabMatch[1]) {
    const names = collabMatch[1].split(/(?:\s+et\s+|,)/i).map(n => n.trim()).filter(Boolean)
    const selectedIds = []
    names.forEach(name => {
      const u = auth.users.find(u => u.name.toLowerCase().includes(name.toLowerCase()))
      if (u) selectedIds.push(u.id)
    })
    
    if (selectedIds.length > 0) {
      if (parsedData.type === 'project') {
        parsedData.assignedUsers = [...new Set([...parsedData.assignedUsers, ...selectedIds])]
      } else {
        parsedData.assignee = selectedIds[0]
      }
    }
  }

  // If type is task, try to find a matching project name
  if (parsedData.type === 'task' && !parsedData.project) {
    for (const p of projectsStore.projects) {
      if (text.includes(p.name.toLowerCase())) {
        parsedData.project = p.id
        break
      }
    }
    // Default to first project if none selected yet to help users
    if (!parsedData.project && projectsStore.projects.length > 0) {
      parsedData.project = projectsStore.projects[0].id
    }
  }
}

function parseSpokenDate(spoken) {
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  let d = new Date()
  let matched = false

  const match = spoken.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s+(\d{4}))?/i)
  if (match) {
    const day = parseInt(match[1])
    const monthIndex = months.findIndex(m => m === match[2].toLowerCase())
    const year = match[3] ? parseInt(match[3]) : d.getFullYear()
    d = new Date(year, monthIndex, day)
    matched = true
  } else {
    const match2 = spoken.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/)
    if (match2) {
      const day = parseInt(match2[1])
      const monthIndex = parseInt(match2[2]) - 1
      let year = match2[3] ? parseInt(match2[3]) : d.getFullYear()
      if (year < 100) year += 2000
      d = new Date(year, monthIndex, day)
      matched = true
    } else if (spoken.includes('demain')) {
      d.setDate(d.getDate() + 1)
      matched = true
    } else if (spoken.includes("aujourd'hui")) {
      matched = true
    }
  }

  if (matched) {
    return d.toISOString().split('T')[0]
  }
  return null
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

function resetPrompt() {
  resetTranscripts()
  parsedData.type = auth.isAdmin ? 'project' : 'task'
  parsedData.title = ''
  parsedData.description = ''
  parsedData.project = null
  parsedData.priority = 'medium'
  parsedData.status = 'todo'
  parsedData.visibility = 'private'
  parsedData.assignee = auth.isAdmin ? null : (auth.currentUser?.id || auth.currentUser?._id)
  parsedData.assignedUsers = []
  parsedData.deadline = ''
  parsedData.documents = []
  isSaving.value = false
}

function closePrompt() {
  voicePromptState.close()
}

function triggerUpload() {
  if (fileInputRef.value) fileInputRef.value.click()
}

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
    parsedData.documents.push({ name: data.name, url: data.url })
    showToast('Fichier importé.', 'success')
  } catch (e) {
    showToast(e.message || 'Erreur import.', 'error')
  } finally { 
    uploadLoading.value = false
    event.target.value = '' 
  }
}

function removeDocument(idx) {
  parsedData.documents.splice(idx, 1)
}

const isReadyToSubmit = computed(() => {
  if (!parsedData.title.trim()) return false
  if (parsedData.type === 'task' && !parsedData.project) return false
  return true
})

async function confirmCreation() {
  isSaving.value = true
  try {
    if (parsedData.type === 'project') {
      await projectsStore.addProject({
        name: parsedData.title,
        description: parsedData.description,
        deadline: parsedData.deadline || null,
        assignedUsers: parsedData.assignedUsers,
        documents: parsedData.documents
      })
      showToast('Projet créé avec succès', 'success')
      setTimeout(() => {
        closePrompt()
        router.push('/projects')
      }, 1000)
    } else {
      await tasksStore.addTask({
        title: parsedData.title,
        description: parsedData.description,
        project: parsedData.project,
        priority: parsedData.priority,
        status: parsedData.status,
        visibility: parsedData.visibility,
        assignee: parsedData.assignee,
        documents: parsedData.documents
      })
      showToast('Tâche créée avec succès', 'success')
      setTimeout(() => {
        closePrompt()
        router.push('/tasks')
      }, 1000)
    }
  } catch (e) {
    showToast(e.message || 'Erreur lors de la création', 'error')
    isSaving.value = false
  }
}
</script>

<style scoped>
.vp-overlay {
  position: fixed; inset: 0;
  background: rgba(9,30,66,.6); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000; padding: 20px;
}
.vp-modal {
  background: #fff; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(9,30,66,.3);
  width: 100%; max-width: 500px;
  max-height: 90vh; display: flex; flex-direction: column;
  animation: fadeUp .25s ease;
  overflow: hidden;
  position: relative;
}
@keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.vp-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #EBECF0;
  background: #FAFBFC;
}
.vp-header h2 { font-size: 16px; font-weight: 700; color: #172B4D; margin: 0; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; color: #7A869A; }
.btn-icon:hover { color: #172B4D; }
.danger { color: #DE350B !important; }

.vp-body {
  padding: 20px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 20px;
}

.vp-status {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.vp-mic {
  width: 60px; height: 60px; border-radius: 50%;
  background: #F4F5F7; display: flex; align-items: center; justify-content: center;
  font-size: 24px; cursor: pointer; border: 2px solid #EBECF0;
  transition: all .2s;
}
.vp-status.listening .vp-mic {
  border-color: #FF5630; background: #FFEBE6;
}
.vp-status p { margin: 0; font-size: 13px; color: #7A869A; font-weight: 600; }

.pulse {
  animation: pulse-anim 1s infinite alternate;
}
@keyframes pulse-anim {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.2); opacity: 1; }
}

.vp-transcript {
  background: #172B4D; color: #fff; border-radius: 8px; padding: 16px;
  min-height: 80px; display: flex; flex-direction: column; gap: 4px;
}
.final-text { margin: 0; font-size: 14px; line-height: 1.4; color: #E3FCEF; }
.interim-text { margin: 0; font-size: 14px; line-height: 1.4; color: #87B1F5; font-style: italic; }

.vp-parsed-data {
  background: #F4F5F7; border-radius: 8px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.vp-parsed-data h3 { margin: 0 0 8px 0; font-size: 14px; color: #0052CC; font-weight: 700; }

.form-group { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.form-row { display: flex; gap: 12px; width: 100%; }
.form-group label { font-size: 11px; font-weight: 700; color: #7A869A; text-transform: uppercase; }

.type-toggle { display: flex; gap: 8px; }
.type-toggle button {
  flex: 1; padding: 8px; border-radius: 6px; border: 2px solid #DFE1E6;
  background: #fff; cursor: pointer; font-weight: 600; color: #172B4D;
  transition: all .2s;
}
.type-toggle button.active {
  border-color: #0052CC; background: #E6F0FF; color: #0052CC;
}

.vp-input, .vp-select {
  padding: 10px; border: 2px solid #DFE1E6; border-radius: 6px;
  font-size: 14px; outline: none; font-family: inherit; color: #172B4D; width: 100%;
  box-sizing: border-box;
}
.vp-input:focus, .vp-select:focus { border-color: #0052CC; }

.upload-area {
  border: 2px dashed #DFE1E6;
  border-radius: 8px; padding: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; color: #7A869A; font-size: 12px;
  transition: all .15s;
  background: #fff;
}
.upload-area:hover { border-color: #0052CC; background: #E6F0FF; color: #0052CC; }
.upload-area.loading { opacity: .6; pointer-events: none; }
.doc-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.doc-item {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-radius: 6px; padding: 6px 10px; font-size: 12px;
  border: 1px solid #DFE1E6;
}

.vp-footer {
  padding: 16px 20px; border-top: 1px solid #EBECF0;
  display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC;
}
.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
.btn-ghost { background: transparent; color: #7A869A; }
.btn-ghost:hover { background: #EBECF0; color: #172B4D; }
.btn-primary { background: #0052CC; color: #fff; }
.btn-primary:hover { background: #0047B3; }
.btn-primary:disabled { background: #B3D4FF; cursor: not-allowed; }

.toast {
  position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: #36B37E; color: #fff; padding: 8px 16px; border-radius: 20px;
  font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,.15);
  white-space: nowrap;
}
.toast.error { background: #DE350B; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
