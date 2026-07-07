<template>
  <div class="task-card" :class="`priority-${task.priority}`">
    <div class="task-header">
      <span :class="statusClass">{{ statusLabel }}</span>
      <span class="priority-dot" :title="`Priorité : ${task.priority}`">{{ priorityIcon }}</span>
    </div>

    <h3 class="task-title" :class="{ done: task.status === 'done' }">{{ task.title }}</h3>
    <p v-if="task.description" class="task-desc">{{ task.description }}</p>

    <!-- Admin : affiche le propriétaire -->
    <p v-if="showOwner" class="task-owner">👤 {{ ownerName }}</p>

    <div class="task-footer">
      <span class="task-date">{{ formatDate(task.createdAt) }}</span>
      <div class="task-actions">
        <select :value="task.status" @change="updateStatus" class="status-select">
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </select>
        <button class="btn btn-ghost btn-sm" @click="$emit('edit', task)">✎</button>
        <button class="btn btn-danger btn-sm" @click="$emit('delete', task.id)">✕</button>
      </div>
    </div>
  </div>
  <!-- Sous task-owner -->
<span class="vis-tag" :class="task.visibility === 'public' ? 'public' : 'private'">
  {{ task.visibility === 'public' ? '🌍 Publique' : '🔒 Privée' }}
</span>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  task: { type: Object, required: true },
  users: { type: Array, default: () => [] },
})
const emit = defineEmits(['edit', 'delete', 'update-status'])

const auth = useAuthStore()
const showOwner = computed(() => auth.isAdmin)

const ownerName = computed(() => {
  const u = props.users.find(u => u.id === props.task.userId)
  return u?.name || 'Inconnu'
})

const statusLabel = computed(() => ({
  todo: 'À faire', in_progress: 'En cours', done: 'Terminé'
}[props.task.status]))

const statusClass = computed(() => ({
  todo: 'badge badge-todo',
  in_progress: 'badge badge-progress',
  done: 'badge badge-done',
}[props.task.status]))

const priorityIcon = computed(() => ({
  low: '🔵', medium: '🟡', high: '🔴'
}[props.task.priority]))

function updateStatus(e) {
  emit('update-status', props.task.id, e.target.value)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.task-card {
  background: white; border: 1px solid var(--gray-3); border-radius: 10px;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow .15s; border-left: 3px solid var(--gray-3);
}
.task-card:hover { box-shadow: var(--shadow); }
.priority-high   { border-left-color: var(--red); }
.priority-medium { border-left-color: var(--amber); }
.priority-low    { border-left-color: var(--green); }

.task-header { display: flex; justify-content: space-between; align-items: center; }
.task-title  { font-size: 14px; font-weight: 600; line-height: 1.4; }
.task-title.done { text-decoration: line-through; color: var(--gray-5); }
.task-desc   { font-size: 13px; color: var(--gray-5); }
.task-owner  { font-size: 12px; color: var(--blue); }
.priority-dot { font-size: 14px; }

.task-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto; padding-top: 8px; border-top: 1px solid var(--gray-2);
}
.task-date { font-size: 11px; color: var(--gray-5); }
.task-actions { display: flex; gap: 6px; align-items: center; }

.status-select {
  font-size: 12px; padding: 4px 6px; border-radius: 6px;
  border: 1px solid var(--gray-3); cursor: pointer;
}

.vis-tag { font-size: 11px; font-weight: 500; padding: 2px 7px; border-radius: 99px; }
.vis-tag.public  { background: #dcfce7; color: #15803d; }
.vis-tag.private { background: var(--gray-2); color: var(--gray-5); }
</style>