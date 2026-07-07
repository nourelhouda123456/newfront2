<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">Mon profil</h1>
      <p class="page-subtitle">Gérez vos informations personnelles et votre sécurité</p>
    </div>

    <!-- Top Profile Card -->
    <div class="profile-hero card">
      <div class="profile-av-wrap">
        <div class="profile-av">{{ initials }}</div>
        <div class="profile-av-badge" :class="auth.isAdmin ? 'admin' : 'user'">
          {{ auth.isAdmin ? 'Admin' : 'User' }}
        </div>
      </div>
      <div class="profile-hero-info">
        <h2 class="profile-name">{{ auth.currentUser?.name }}</h2>
        <p class="profile-email">{{ auth.currentUser?.email }}</p>
        <p class="profile-role">{{ auth.isAdmin ? '👑 Administrateur' : '👤 Utilisateur' }}</p>
      </div>
      <div class="profile-hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val">{{ myStats.total }}</div>
          <div class="hero-stat-lbl">Tâches créées</div>
        </div>
        <div class="hero-stat-sep"></div>
        <div class="hero-stat">
          <div class="hero-stat-val" style="color:#36B37E">{{ myStats.done }}</div>
          <div class="hero-stat-lbl">Terminées</div>
        </div>
        <div class="hero-stat-sep"></div>
        <div class="hero-stat">
          <div class="hero-stat-val" style="color:#FF991F">{{ myStats.todo }}</div>
          <div class="hero-stat-lbl">En attente</div>
        </div>
      </div>
    </div>

    <!-- Two-column grid -->
    <div class="profile-grid">
      <!-- Info Form -->
      <div class="card profile-card">
        <div class="card-head">
          <h2 class="card-section-title">
            <span class="section-icon">✏️</span>
            Informations personnelles
          </h2>
        </div>
        <div class="card-body">
          <transition name="slide-fade">
            <div v-if="infoSuccess" class="alert alert-success">✅ {{ infoSuccess }}</div>
          </transition>
          <transition name="slide-fade">
            <div v-if="infoError" class="alert alert-error">⚠️ {{ infoError }}</div>
          </transition>

          <div class="form-group">
            <label for="profile-name">Nom complet</label>
            <input id="profile-name" v-model="infoForm.name" placeholder="Votre nom" />
          </div>
          <div class="form-group">
            <label for="profile-email">Email</label>
            <input id="profile-email" v-model="infoForm.email" type="email" placeholder="votre@email.com" />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <input :value="auth.isAdmin ? 'Administrateur' : 'Utilisateur'" disabled style="color:#7A869A;cursor:not-allowed;" />
          </div>
          <button class="btn btn-primary" @click="saveInfo" :disabled="savingInfo">
            <div v-if="savingInfo" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ savingInfo ? 'Enregistrement…' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </div>

      <!-- Password Form -->
      <div class="card profile-card">
        <div class="card-head">
          <h2 class="card-section-title">
            <span class="section-icon">🔒</span>
            Changer le mot de passe
          </h2>
        </div>
        <div class="card-body">
          <transition name="slide-fade">
            <div v-if="pwdSuccess" class="alert alert-success">✅ {{ pwdSuccess }}</div>
          </transition>
          <transition name="slide-fade">
            <div v-if="pwdError" class="alert alert-error">⚠️ {{ pwdError }}</div>
          </transition>

          <div class="form-group">
            <label for="pwd-current">Mot de passe actuel</label>
            <div class="input-with-icon">
              <input id="pwd-current" v-model="pwdForm.current" :type="showCur ? 'text' : 'password'" placeholder="••••••••" />
              <button type="button" class="eye-btn" @click="showCur = !showCur">{{ showCur ? '🙈' : '👁' }}</button>
            </div>
          </div>
          <div class="form-group">
            <label for="pwd-new">Nouveau mot de passe</label>
            <div class="input-with-icon">
              <input id="pwd-new" v-model="pwdForm.next" :type="showNew ? 'text' : 'password'" placeholder="Min. 6 caractères" />
              <button type="button" class="eye-btn" @click="showNew = !showNew">{{ showNew ? '🙈' : '👁' }}</button>
            </div>
          </div>
          <div class="form-group">
            <label for="pwd-confirm">Confirmer le nouveau mot de passe</label>
            <div class="input-with-icon">
              <input id="pwd-confirm" v-model="pwdForm.confirm" :type="showConf ? 'text' : 'password'" placeholder="Répétez le mot de passe" />
              <button type="button" class="eye-btn" @click="showConf = !showConf">{{ showConf ? '🙈' : '👁' }}</button>
            </div>
          </div>
          <button class="btn btn-primary" @click="changePwd" :disabled="savingPwd">
            <div v-if="savingPwd" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ savingPwd ? 'Mise à jour…' : 'Mettre à jour le mot de passe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTasksStore } from '../stores/tasks.js'

const auth  = useAuthStore()
const tasks = useTasksStore()

onMounted(() => tasks.fetchTasks())

const infoForm    = reactive({ name: auth.currentUser?.name || '', email: auth.currentUser?.email || '' })
const infoSuccess = ref(''); const infoError = ref('')
const savingInfo  = ref(false)

const pwdForm    = reactive({ current: '', next: '', confirm: '' })
const pwdSuccess = ref(''); const pwdError = ref('')
const savingPwd  = ref(false)

const showCur  = ref(false)
const showNew  = ref(false)
const showConf = ref(false)

const initials = computed(() =>
  (auth.currentUser?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)

const myStats = computed(() => {
  const mine = tasks.tasks.filter(t => {
    const ownerId = t.owner?.id || t.owner?._id || t.owner
    return ownerId === auth.currentUser?.id
  })
  return { total: mine.length, done: mine.filter(t => t.status === 'done').length, todo: mine.filter(t => t.status === 'todo').length }
})

async function saveInfo() {
  infoError.value = ''; infoSuccess.value = ''
  if (!infoForm.name || !infoForm.email) { infoError.value = 'Champs obligatoires.'; return }
  savingInfo.value = true
  try {
    await auth.updateProfile(infoForm.name, infoForm.email)
    infoSuccess.value = 'Profil mis à jour avec succès.'
  } catch (err) { infoError.value = err.message || 'Erreur.' }
  finally { savingInfo.value = false }
}

async function changePwd() {
  pwdError.value = ''; pwdSuccess.value = ''
  if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) { pwdError.value = 'Tous les champs sont requis.'; return }
  if (pwdForm.next.length < 6) { pwdError.value = 'Minimum 6 caractères.'; return }
  if (pwdForm.next !== pwdForm.confirm) { pwdError.value = 'Les mots de passe ne correspondent pas.'; return }
  savingPwd.value = true
  try {
    await auth.updatePassword(pwdForm.current, pwdForm.next)
    pwdForm.current = ''; pwdForm.next = ''; pwdForm.confirm = ''
    pwdSuccess.value = 'Mot de passe changé avec succès.'
  } catch (err) { pwdError.value = err.message || 'Erreur.' }
  finally { savingPwd.value = false }
}
</script>

<style scoped>
.profile-page { padding: 28px 32px; max-width: 1000px; margin: 0 auto; }

.page-header { margin-bottom: 24px; }
.page-title   { font-size: 24px; font-weight: 800; color: #172B4D; }
.page-subtitle { font-size: 14px; color: #7A869A; margin-top: 4px; }

/* Hero Card */
.profile-hero {
  display: flex; align-items: center; gap: 24px;
  padding: 28px 32px; margin-bottom: 20px;
  background: linear-gradient(135deg, #0052CC, #0066FF);
  border-radius: 14px; box-shadow: 0 4px 16px rgba(0,82,204,.3);
  flex-wrap: wrap;
}

.profile-av-wrap { position: relative; flex-shrink: 0; }
.profile-av {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(255,255,255,.2); color: #fff;
  font-size: 26px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid rgba(255,255,255,.4);
}
.profile-av-badge {
  position: absolute; bottom: -2px; right: -2px;
  font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 99px;
  border: 2px solid #fff;
}
.profile-av-badge.admin { background: #FFF0B3; color: #7A4A00; }
.profile-av-badge.user  { background: #fff; color: #7A869A; }

.profile-hero-info { flex: 1; min-width: 0; }
.profile-name  { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.profile-email { font-size: 13px; color: rgba(255,255,255,.75); margin-bottom: 4px; }
.profile-role  { font-size: 12px; color: rgba(255,255,255,.65); }

.profile-hero-stats { display: flex; align-items: center; gap: 24px; margin-left: auto; }
.hero-stat { text-align: center; }
.hero-stat-val { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
.hero-stat-lbl { font-size: 11px; color: rgba(255,255,255,.7); margin-top: 3px; font-weight: 500; }
.hero-stat-sep { width: 1px; height: 40px; background: rgba(255,255,255,.2); }

/* Two-column grid */
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.profile-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(9,30,66,.1); overflow: hidden; }
.card-head { padding: 18px 22px 14px; border-bottom: 1px solid #EBECF0; }
.card-section-title { font-size: 14px; font-weight: 700; color: #172B4D; display: flex; align-items: center; gap: 8px; }
.section-icon { font-size: 16px; }
.card-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 0; }

/* Alerts */
.alert { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.alert-success { background: #E3FCEF; color: #006644; border: 1px solid rgba(54,179,126,.2); }
.alert-error   { background: #FFEBE6; color: #DE350B; border: 1px solid rgba(222,53,11,.2); }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-8px); opacity: 0; }

/* Form */
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-size: 11px; font-weight: 600; color: #7A869A; text-transform: uppercase; letter-spacing: .5px; }
input {
  padding: 9px 12px; border: 2px solid #EBECF0; border-radius: 6px;
  font-size: 14px; font-family: inherit; outline: none; color: #172B4D;
  transition: border-color .15s, box-shadow .15s; width: 100%;
}
input:focus { border-color: #0052CC; box-shadow: 0 0 0 3px rgba(0,82,204,.15); }
input:disabled { background: #F4F5F7; color: #7A869A; cursor: not-allowed; }

.input-with-icon { position: relative; }
.input-with-icon input { padding-right: 40px; }
.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; font-size: 14px; line-height: 1; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;
  cursor: pointer; border: none; transition: all .15s; font-family: inherit; margin-top: 4px;
}
.btn-primary { background: #0052CC; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #0747A6; transform: translateY(-1px); }
.btn:disabled { opacity: .6; cursor: not-allowed; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .profile-page { padding: 16px; }
  .profile-hero { flex-direction: column; text-align: center; }
  .profile-hero-info { text-align: center; }
  .profile-hero-stats { margin-left: 0; }
  .profile-grid { grid-template-columns: 1fr; }
}
</style>