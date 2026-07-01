<template>
  <div class="user-table-wrap">
    <table class="user-table">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Statut</th>
          <th>Inscrit le</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" :class="{ 'row-me': user.id === currentId }">
          <!-- Name + Avatar -->
          <td class="user-name-cell">
            <div class="user-av" :style="{ background: userColor(user.id) }">{{ initials(user.name) }}</div>
            <div class="user-name-body">
              <span class="user-name-str">{{ user.name }}</span>
              <span v-if="user.id === currentId" class="you-tag">vous</span>
            </div>
          </td>
          <!-- Email -->
          <td class="cell-email">{{ user.email }}</td>
          <!-- Role -->
          <td>
            <select
              :value="user.role"
              :disabled="user.id === currentId"
              @change="e => $emit('change-role', user.id, e.target.value)"
              class="role-select"
              :class="user.role"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <!-- Status -->
          <td>
            <span class="status-dot" :class="user.active ? 'active' : 'inactive'">
              {{ user.active ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <!-- Date -->
          <td class="cell-date">{{ formatDate(user.createdAt) }}</td>
          <!-- Actions -->
          <td>
            <div v-if="user.id !== currentId" class="row-actions">
              <button
                :class="['btn btn-sm', user.active ? 'btn-ghost' : 'btn-primary']"
                @click="$emit('toggle-active', user.id)"
              >
                {{ user.active ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="$emit('delete', user.id)">
                Supprimer
              </button>
            </div>
            <span v-else class="cell-email">—</span>
          </td>
        </tr>
        <tr v-if="!users.length">
          <td colspan="6" style="text-align:center;padding:32px;color:#7A869A">
            Aucun utilisateur trouvé.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  users:     { type: Array, required: true },
  currentId: { type: [String, Number], required: true },
})
defineEmits(['toggle-active', 'change-role', 'delete'])

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const COLORS = ['#0052CC','#00875A','#6554C0','#00B8D9','#FF5630','#FF991F']
function userColor(id) {
  if (!id) return COLORS[0]
  let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}
</script>

<style scoped>
.user-table-wrap { overflow-x: auto; }
.user-table { width: 100%; border-collapse: collapse; font-size: 13px; }

.user-table thead tr {
  background: #F4F5F7;
}
.user-table th {
  text-align: left; padding: 10px 14px;
  font-size: 11px; font-weight: 700; color: #7A869A;
  text-transform: uppercase; letter-spacing: .5px;
  border-bottom: 1px solid #EBECF0; white-space: nowrap;
}
.user-table td {
  padding: 12px 14px; border-bottom: 1px solid #F4F5F7;
  vertical-align: middle; color: #172B4D;
}
.user-table tbody tr:hover td { background: #FAFBFC; }
.row-me td { background: #F0F6FF !important; }

/* User cell */
.user-name-cell { display: flex; align-items: center; gap: 10px; }
.user-av {
  width: 32px; height: 32px; border-radius: 50%;
  color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name-body { display: flex; align-items: center; gap: 6px; }
.user-name-str { font-weight: 600; color: #172B4D; }
.you-tag {
  font-size: 10px; padding: 1px 6px; border-radius: 99px;
  background: #DEEBFF; color: #0052CC; font-weight: 600;
}

.cell-email { color: #7A869A; font-size: 12px; }
.cell-date  { color: #7A869A; font-size: 12px; white-space: nowrap; }

/* Role select */
.role-select {
  font-size: 12px; padding: 4px 8px; border-radius: 5px;
  border: 1px solid #EBECF0; cursor: pointer;
  font-family: inherit; color: #172B4D;
  outline: none; transition: border-color .15s;
  background: #fff;
}
.role-select:focus { border-color: #0052CC; }
.role-select:disabled { opacity: .5; cursor: not-allowed; }
.role-select.admin { color: #7A4A00; background: #FFF0B3; border-color: #FFD700; }

/* Status */
.status-dot {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 600;
}
.status-dot::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%; display: inline-block;
}
.status-dot.active   { background: #E3FCEF; color: #006644; }
.status-dot.active::before { background: #36B37E; }
.status-dot.inactive { background: #F4F5F7; color: #7A869A; }
.status-dot.inactive::before { background: #C1C7D0; }

/* Actions */
.row-actions { display: flex; gap: 6px; align-items: center; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all .15s; font-family: inherit; }
.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-primary { background: #0052CC; color: #fff; }
.btn-primary:hover { background: #0747A6; }
.btn-ghost { background: transparent; color: #172B4D; border: 1px solid #DFE1E6; }
.btn-ghost:hover { background: #F4F5F7; }
.btn-danger { background: #FFEBE6; color: #DE350B; border: 1px solid rgba(222,53,11,.2); }
.btn-danger:hover { background: #FFD5CC; }
</style>