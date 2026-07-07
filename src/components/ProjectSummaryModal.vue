<template>
  <div v-if="isOpen" class="ps-overlay" @click.self="close">
    <div class="ps-modal">
      <div class="ps-header">
        <h2>🤖 Résumé — {{ project?.name }}</h2>
        <button class="btn-icon" @click="close">✕</button>
      </div>

      <div class="ps-body">
        <!-- Chargement -->
        <div v-if="loading" class="ps-loading">
          <div class="spinner"></div>
          <p>Analyse du projet en cours...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="ps-error">
          <p>⚠️ {{ error }}</p>
          <button class="btn btn-ghost btn-sm" @click="fetchSummary">Réessayer</button>
        </div>

        <!-- Résultat -->
        <template v-else-if="summary">
          <!-- Stats rapides -->
          <div class="ps-stats">
            <div class="stat-pill">
              <span class="stat-num">{{ stats.completionRate }}%</span>
              <span class="stat-label">Complété</span>
            </div>
            <div class="stat-pill" :class="{ warn: stats.blockedCount > 0 }">
              <span class="stat-num">{{ stats.blockedCount }}</span>
              <span class="stat-label">Bloquées</span>
            </div>
            <div class="stat-pill" :class="{ danger: stats.overdueCount > 0 }">
              <span class="stat-num">{{ stats.overdueCount }}</span>
              <span class="stat-label">En retard</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ stats.total }}</span>
              <span class="stat-label">Total tâches</span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: stats.completionRate + '%' }"></div>
          </div>

          <!-- Texte généré par l'IA, formaté proprement -->
          <div class="ps-text">
            <div v-for="(block, idx) in formattedSummary" :key="idx" class="ps-block">
              <div v-if="block.title" class="ps-block-title">{{ block.title }}</div>
              <p v-if="block.text" class="ps-block-text">{{ block.text }}</p>
            </div>
          </div>

          <!-- Équipe et activité actuelle -->
          <div v-if="stats.teamStatus?.length" class="team-section">
            <div class="team-title">Équipe ({{ stats.teamStatus.length }})</div>
            <div class="team-list">
              <div v-for="member in stats.teamStatus" :key="member.userId" class="team-member">
                <div class="member-avatar">{{ initials(member.name) }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-activity" :class="`status-${member.activityStatus}`">
                    {{ statusIcon(member.activityStatus) }} {{ member.currentActivity }}
                  </span>
                </div>
                <span class="member-count">{{ member.done }}/{{ member.totalTasks }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="ps-footer">
        <button class="btn btn-ghost" @click="close">Fermer</button>
        <button class="btn btn-primary" @click="fetchSummary" :disabled="loading">
          {{ loading ? 'Génération...' : '🔄 Régénérer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const API = 'http://localhost:3000/api'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  project: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const summary = ref('')
const stats = ref({ total: 0, completionRate: 0, blockedCount: 0, overdueCount: 0, teamStatus: [] })

async function fetchSummary() {
  if (!props.project) return
  loading.value = true
  error.value = ''
  summary.value = ''

  try {
    const res = await fetch(`${API}/ai/project-summary/${props.project.id}`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la génération du résumé.')

    summary.value = data.summary
    stats.value = data.stats
  } catch (e) {
    error.value = e.message || 'Erreur réseau ou IA.'
  } finally {
    loading.value = false
  }
}

// Transforme le texte brut de Gemini (avec **titres**) en blocs { title, text }
const formattedSummary = computed(() => {
  if (!summary.value) return []

  const lines = summary.value.split('\n').map(l => l.trim()).filter(Boolean)
  const blocks = []
  let current = null

  const titleRegex = /^\*\*(.+?)\*\*:?$/

  for (const line of lines) {
    const match = line.match(titleRegex)
    if (match) {
      current = { title: match[1].replace(/^\d+\.\s*/, ''), text: '' }
      blocks.push(current)
    } else {
      const cleanLine = line.replace(/\*\*/g, '')
      if (current) {
        current.text = current.text ? `${current.text} ${cleanLine}` : cleanLine
      } else {
        current = { title: '', text: cleanLine }
        blocks.push(current)
      }
    }
  }

  return blocks
})

watch(() => props.isOpen, (open) => {
  if (open) fetchSummary()
})

function close() {
  emit('close')
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function statusIcon(status) {
  return { blocked: '🔴', in_progress: '🟢', todo: '🟡', idle: '⚪' }[status] || '⚪'
}
</script>

<style scoped>
.ps-overlay {
  position: fixed; inset: 0;
  background: rgba(9,30,66,.6); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000; padding: 20px;
}
.ps-modal {
  background: #fff; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(9,30,66,.3);
  width: 100%; max-width: 560px;
  max-height: 85vh;
  display: flex; flex-direction: column;
  animation: fadeUp .25s ease;
  overflow: hidden;
}
@keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.ps-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #EBECF0;
  background: #FAFBFC;
  flex-shrink: 0;
}
.ps-header h2 {
  font-size: 15px; font-weight: 700; color: #172B4D; margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; color: #7A869A; flex-shrink: 0; margin-left: 10px; }
.btn-icon:hover { color: #172B4D; }

.ps-body {
  padding: 20px;
  display: flex; flex-direction: column; gap: 18px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.ps-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 30px 0; color: #7A869A; font-size: 13px;
}
.spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid #EBECF0; border-top-color: #0052CC;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ps-error { text-align: center; color: #DE350B; display: flex; flex-direction: column; gap: 10px; align-items: center; }

.ps-stats { display: flex; gap: 8px; flex-wrap: wrap; }
.stat-pill {
  flex: 1; min-width: 78px; background: #F4F5F7;
  border-radius: 8px; padding: 8px; display: flex; flex-direction: column;
  align-items: center; gap: 2px;
}
.stat-pill.warn { background: #FFF7E6; }
.stat-pill.danger { background: #FFEBE6; }
.stat-num { font-size: 17px; font-weight: 700; color: #172B4D; }
.stat-label { font-size: 10.5px; color: #7A869A; font-weight: 600; text-align: center; }

.progress-track {
  width: 100%; height: 7px; border-radius: 99px;
  background: #EBECF0; overflow: hidden; flex-shrink: 0;
}
.progress-fill {
  height: 100%; background: #36B37E;
  transition: width .4s ease;
}

/* ── Texte IA formaté ─────────────────────── */
.ps-text {
  background: #F4F5F7;
  border-left: 4px solid #0052CC;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.ps-block-title {
  font-size: 11.5px; font-weight: 700; color: #0052CC;
  text-transform: uppercase; letter-spacing: .4px;
}
.ps-block-text {
  font-size: 13.5px; line-height: 1.55; color: #172B4D;
  margin: 0;
}

/* ── Équipe ───────────────────────────────── */
.team-section { display: flex; flex-direction: column; gap: 8px; }
.team-title { font-size: 11px; font-weight: 700; color: #7A869A; text-transform: uppercase; letter-spacing: .4px; }
.team-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 200px; overflow-y: auto;
  padding-right: 2px;
}
.team-member {
  display: flex; align-items: center; gap: 10px;
  background: #F4F5F7; padding: 7px 10px; border-radius: 8px;
  flex-shrink: 0;
}
.member-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #0052CC; color: #fff; font-size: 10.5px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.member-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.member-name { font-size: 12.5px; font-weight: 600; color: #172B4D; }
.member-activity { font-size: 11px; color: #7A869A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.member-activity.status-blocked { color: #DE350B; }
.member-activity.status-in_progress { color: #00875A; }
.member-count { font-size: 11.5px; font-weight: 700; color: #7A869A; flex-shrink: 0; }

.ps-footer {
  padding: 14px 20px; border-top: 1px solid #EBECF0;
  display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC;
  flex-shrink: 0;
}
.btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
.btn-ghost { background: transparent; color: #7A869A; }
.btn-ghost:hover:not(:disabled) { background: #EBECF0; color: #172B4D; }
.btn-primary { background: #0052CC; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #0047B3; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>