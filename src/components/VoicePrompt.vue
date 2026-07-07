<template>
  <div v-if="voicePromptState.isOpen" class="vp-overlay" @click.self="closePrompt">
    <div class="vp-modal">
      <div class="vp-header">
        <h2>🎙️ Assistant Vocal Intelligent</h2>
        <button class="btn-icon" @click="closePrompt">✕</button>
      </div>

      <div class="vp-body">
        <div class="vp-status" :class="{ listening: isListening }">
          <div class="vp-mic" @click="toggleListening">
             <span v-if="isListening">🔴</span>
             <span v-else>🎤</span>
          </div>
          <p>{{ isListening ? 'Écoute en cours...' : 'Microphone en pause' }}</p>
        </div>
        
        <div class="vp-instructions">
          Dites ce que vous souhaitez faire.
        </div>

        <div class="vp-transcript">
          <label>Texte transcrit (modifiable) :</label>
          <textarea 
            v-model="editableTranscript" 
            rows="4" 
            placeholder="Le texte transcrit apparaîtra ici..." 
            class="vp-input transcript-box"
          ></textarea>
          <p class="interim-text" v-if="interimTranscript">{{ interimTranscript }}</p>
        </div>

      </div>

      <div class="vp-footer">
        <button class="btn btn-ghost" @click="closePrompt" :disabled="isSaving">Annuler</button>
        <button class="btn btn-primary" @click="confirmCreation" :disabled="!isReadyToSubmit || isSaving">
          <span v-if="isSaving">Traitement IA...</span>
          <span v-else>Exécuter</span>
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
import { ref, reactive, watch, computed } from 'vue'
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

const {
  isListening,
  finalTranscript,
  interimTranscript,
  startListening,
  stopListening,
  resetTranscripts
} = useVoiceDictation()

const editableTranscript = ref('')
const isSaving = ref(false)
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  Object.assign(toast, { show: true, msg, type })
  toastTimer = setTimeout(() => toast.show = false, 4000)
}

// Keep editable transcript in sync when dictation produces a final result
watch(finalTranscript, (newVal) => {
  if (newVal) {
    editableTranscript.value = newVal
  }
})

function toggleListening() {
  if (isListening.value) stopListening()
  else startListening()
}

// Listen to modal open/close
watch(() => voicePromptState.isOpen, (newVal) => {
  if (newVal) {
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

function resetPrompt() {
  resetTranscripts()
  editableTranscript.value = ''
  isSaving.value = false
}

function closePrompt() {
  if (!isSaving.value) {
    voicePromptState.close()
  }
}

const isReadyToSubmit = computed(() => {
  return editableTranscript.value.trim().length > 0
})

async function confirmCreation() {
  if (!editableTranscript.value.trim()) return

  isSaving.value = true
  stopListening()

  try {
    const res = await fetch('http://localhost:3000/api/ai/execute', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}` 
      },
      body: JSON.stringify({ prompt: editableTranscript.value })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Erreur lors du traitement par l\'IA')
    }

    showToast(data.message || 'Action exécutée avec succès', 'success')
    
    // Refresh stores depending on action or just refresh both to be safe
    await projectsStore.fetchProjects()
    if (data.action && data.action.includes('task')) {
      await tasksStore.fetchTasks()
    }

    setTimeout(() => {
      closePrompt()
      if (data.action && data.action.includes('task')) {
        router.push('/tasks')
      } else if (data.action && data.action.includes('project')) {
        router.push('/projects')
      }
    }, 1500)

  } catch (e) {
    showToast(e.message || 'Erreur réseau ou IA', 'error')
  } finally {
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
  display: flex; flex-direction: column;
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

.vp-body {
  padding: 20px;
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
  animation: pulse-anim 1.5s infinite alternate;
}
.vp-status p { margin: 0; font-size: 13px; color: #7A869A; font-weight: 600; }

@keyframes pulse-anim {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.1); opacity: 1; }
}

.vp-instructions {
  background: #E6F0FF; color: #0052CC; padding: 12px; border-radius: 8px; font-size: 13px;
  line-height: 1.4; border-left: 4px solid #0052CC;
}

.vp-transcript {
  display: flex; flex-direction: column; gap: 8px;
}
.vp-transcript label {
  font-size: 12px; font-weight: 700; color: #7A869A;
}
.transcript-box {
  resize: vertical;
  min-height: 100px;
  background: #F4F5F7;
  border: 2px solid #DFE1E6;
  font-size: 14px;
  line-height: 1.5;
}
.transcript-box:focus {
  background: #fff;
  border-color: #0052CC;
}

.interim-text { margin: 0; font-size: 13px; line-height: 1.4; color: #0052CC; font-style: italic; }

.vp-input {
  padding: 10px; border-radius: 6px;
  font-size: 14px; outline: none; font-family: inherit; color: #172B4D; width: 100%;
  box-sizing: border-box;
}

.vp-footer {
  padding: 16px 20px; border-top: 1px solid #EBECF0;
  display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC;
}
.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
.btn-ghost { background: transparent; color: #7A869A; }
.btn-ghost:hover:not(:disabled) { background: #EBECF0; color: #172B4D; }
.btn-primary { background: #0052CC; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #0047B3; }
.btn-primary:disabled, .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.toast {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: #36B37E; color: #fff; padding: 10px 20px; border-radius: 20px;
  font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,.15);
  white-space: nowrap; z-index: 10;
}
.toast.error { background: #DE350B; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
