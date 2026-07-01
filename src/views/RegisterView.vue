<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
    </div>

    <div class="auth-container">
      <!-- Left Side Panel -->
      <div class="auth-side">
        <div class="brand">
          <img src="../assets/logo.png" alt="TaskFlow" class="brand-logo" />
          <span class="brand-name">TaskFlow</span>
        </div>
        <h2 class="side-headline">Rejoignez votre équipe dès aujourd'hui.</h2>
        <p class="side-desc">Créez votre compte gratuitement et commencez à gérer vos tâches efficacement.</p>
        <div class="side-features">
          <div class="side-feature"><span class="feat-icon">🚀</span> Démarrage rapide</div>
          <div class="side-feature"><span class="feat-icon">🔒</span> Sécurisé et fiable</div>
          <div class="side-feature"><span class="feat-icon">📱</span> Interface responsive</div>
          <div class="side-feature"><span class="feat-icon">🎯</span> Suivi de performance</div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Créer un compte</h1>
          <p class="auth-sub">Remplissez les informations ci-dessous pour commencer.</p>
        </div>

        <transition name="slide-fade">
          <div v-if="error" class="alert alert-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z"/></svg>
            {{ error }}
          </div>
        </transition>

        <form @submit.prevent="submit" class="auth-form">
          <!-- Name -->
          <div class="form-group">
            <label for="reg-name">Nom complet *</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.292 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
              <input id="reg-name" v-model="name" type="text" placeholder="Votre nom complet" autocomplete="name" />
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="reg-email">Email *</label>
            <div class="input-with-icon" :class="{ 'input-checking': emailChecking, 'input-valid': emailValid === true, 'input-invalid': emailValid === false }">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v.217l7 4.2 7-4.2V4a1 1 0 00-1-1H2zm13 2.383l-4.758 2.855L15 11.114V5.383zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 002 13h12a1 1 0 00.966-.739zM1 11.114l4.758-2.876L1 5.383v5.731z"/></svg>
              <input id="reg-email" v-model="email" type="email" placeholder="vous@exemple.com" autocomplete="email" @blur="checkEmail" />
              <span v-if="emailChecking" class="input-status checking">
                <div class="spinner spinner-sm"></div>
              </span>
              <span v-else-if="emailValid === true" class="input-status valid">✓</span>
              <span v-else-if="emailValid === false" class="input-status invalid">✗</span>
            </div>
            <span v-if="emailError" class="error-msg">⚠ {{ emailError }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="reg-pwd">Mot de passe *</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
              <input id="reg-pwd" v-model="password" :type="showPwd ? 'text' : 'password'" placeholder="Min. 6 caractères" autocomplete="new-password" />
              <button type="button" class="input-action" @click="showPwd = !showPwd" tabindex="-1">{{ showPwd ? '🙈' : '👁' }}</button>
            </div>
            <!-- Password strength -->
            <div v-if="password" class="pwd-strength">
              <div class="pwd-track">
                <div class="pwd-fill" :style="{ width: pwdStrength.pct + '%', background: pwdStrength.color }"></div>
              </div>
              <span class="pwd-label" :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
            </div>
          </div>

          <!-- Confirm password -->
          <div class="form-group">
            <label for="reg-confirm">Confirmer le mot de passe *</label>
            <div class="input-with-icon" :class="{ 'input-valid': confirm && confirm === password, 'input-invalid': confirm && confirm !== password }">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
              <input id="reg-confirm" v-model="confirm" :type="showConfirm ? 'text' : 'password'" placeholder="Répétez le mot de passe" @keyup.enter="submit" />
              <button type="button" class="input-action" @click="showConfirm = !showConfirm" tabindex="-1">{{ showConfirm ? '🙈' : '👁' }}</button>
            </div>
            <span v-if="confirm && confirm !== password" class="error-msg">⚠ Les mots de passe ne correspondent pas</span>
          </div>

          <!-- Role info -->
          <div class="role-pill">
            <span class="role-icon">👤</span>
            <div>
              <strong>Compte Utilisateur</strong>
              <p>Vous pourrez gérer vos tâches et collaborer sur des projets.</p>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading || emailChecking" id="register-submit-btn" style="margin-top:8px">
            <div v-if="loading" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ loading ? 'Création en cours…' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="auth-divider"><span>ou</span></div>

        <button type="button" class="btn btn-google btn-block btn-lg" @click="auth.loginWithGoogle()">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" />
          Continuer avec Google
        </button>

        <div class="auth-footer">
          <p>Déjà un compte ? <router-link to="/login">Se connecter</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth   = useAuthStore()
const router = useRouter()

const name        = ref('')
const email       = ref('')
const password    = ref('')
const confirm     = ref('')
const error       = ref('')
const loading     = ref(false)
const showPwd     = ref(false)
const showConfirm = ref(false)
const emailChecking = ref(false)
const emailValid  = ref(null)
const emailError  = ref('')

const pwdStrength = computed(() => {
  const p = password.value
  if (!p) return { pct: 0, color: '#DFE1E6', label: '' }
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { pct: 20, color: '#DE350B', label: 'Très faible' },
    { pct: 40, color: '#FF991F', label: 'Faible' },
    { pct: 60, color: '#FF991F', label: 'Moyen' },
    { pct: 80, color: '#36B37E', label: 'Fort' },
    { pct: 100, color: '#006644', label: 'Très fort' },
  ]
  return levels[Math.min(score, 4)]
})

async function checkEmail() {
  const val = email.value.trim()
  if (!val) return
  // Basic format check first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(val)) {
    emailValid.value = false
    emailError.value = 'Format d\'email invalide'
    return
  }
  emailChecking.value = true
  emailError.value = ''
  emailValid.value = null
  try {
    const res = await fetch(`http://localhost:3000/api/auth/check-email?email=${encodeURIComponent(val)}`)
    const data = await res.json()
    if (data.exists) {
      emailValid.value = false
      emailError.value = 'Cet email est déjà utilisé'
    } else if (data.valid === false) {
      emailValid.value = false
      emailError.value = data.reason || 'Email invalide ou inexistant'
    } else {
      emailValid.value = true
      emailError.value = ''
    }
  } catch {
    emailValid.value = null
    emailError.value = ''
  } finally {
    emailChecking.value = false
  }
}

async function submit() {
  error.value = ''
  if (!name.value.trim()) { error.value = 'Le nom est obligatoire.'; return }
  if (!email.value.trim()) { error.value = 'L\'email est obligatoire.'; return }
  if (!password.value) { error.value = 'Le mot de passe est obligatoire.'; return }
  if (password.value.length < 6) { error.value = 'Le mot de passe doit faire au moins 6 caractères.'; return }
  if (password.value !== confirm.value) { error.value = 'Les mots de passe ne correspondent pas.'; return }
  if (emailValid.value === false) { error.value = emailError.value || 'Email invalide.'; return }

  loading.value = true
  const result = await auth.register(name.value, email.value, password.value)
  loading.value = false
  if (!result.ok) { error.value = result.error; return }
  router.push('/dashboard')
}
</script>

<style scoped>
/* Same auth-page layout as Login */
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0747A6 0%, #0052CC 50%, #0066FF 100%);
  padding: 24px;
  position: relative; overflow: hidden;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .25; }
.bg-blob-1 { width: 600px; height: 600px; background: radial-gradient(circle, #fff 0%, transparent 70%); top: -200px; left: -200px; }
.bg-blob-2 { width: 400px; height: 400px; background: radial-gradient(circle, #36B37E 0%, transparent 70%); bottom: -100px; right: -100px; }

.auth-container {
  display: flex; width: 100%; max-width: 960px;
  background: #fff; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(9,30,66,.35);
  overflow: hidden; position: relative; z-index: 1;
}

.auth-side {
  flex: 1; background: linear-gradient(160deg, #0052CC 0%, #003380 100%);
  padding: 48px 40px; display: flex; flex-direction: column; color: #fff;
}
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
.brand-logo { width: 40px; height: 40px; object-fit: contain; filter: brightness(0) invert(1); }
.brand-name { font-size: 22px; font-weight: 800; color: #fff; }
.side-headline { font-size: 24px; font-weight: 700; line-height: 1.3; margin-bottom: 12px; }
.side-desc { font-size: 14px; color: rgba(255,255,255,.75); line-height: 1.6; margin-bottom: 32px; }
.side-features { display: flex; flex-direction: column; gap: 14px; margin-top: auto; }
.side-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,.9); font-weight: 500; }
.feat-icon { font-size: 18px; }

.auth-card {
  width: 460px; flex-shrink: 0;
  padding: 48px 40px;
  display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}

.auth-header { }
.auth-title { font-size: 24px; font-weight: 800; color: #172B4D; margin-bottom: 6px; }
.auth-sub { font-size: 14px; color: #7A869A; }

.auth-form { display: flex; flex-direction: column; }
.auth-form .form-group { margin-bottom: 16px; }
.auth-form label {
  display: block; margin-bottom: 7px;
  font-size: 12px; font-weight: 600; color: #7A869A;
  text-transform: uppercase; letter-spacing: .5px;
}

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; color: #7A869A; pointer-events: none; }
.input-with-icon input { padding-left: 36px !important; padding-right: 40px; }
.input-action { position: absolute; right: 10px; background: transparent; border: none; cursor: pointer; font-size: 14px; color: #7A869A; }

/* input states */
.input-valid input   { border-color: #36B37E !important; }
.input-invalid input { border-color: #DE350B !important; }
.input-valid input:focus   { box-shadow: 0 0 0 3px rgba(54,179,126,.2) !important; }
.input-invalid input:focus { box-shadow: 0 0 0 3px rgba(222,53,11,.2) !important; }

.input-status {
  position: absolute; right: 10px;
  display: flex; align-items: center;
}
.input-status.valid  { color: #36B37E; font-weight: 700; }
.input-status.invalid { color: #DE350B; font-weight: 700; }
.input-status.checking { }

/* Password strength */
.pwd-strength { margin-top: 8px; display: flex; align-items: center; gap: 10px; }
.pwd-track { flex: 1; height: 4px; background: #DFE1E6; border-radius: 99px; overflow: hidden; }
.pwd-fill { height: 100%; border-radius: 99px; transition: width .3s, background .3s; }
.pwd-label { font-size: 11px; font-weight: 600; white-space: nowrap; }

/* Role pill */
.role-pill {
  display: flex; align-items: flex-start; gap: 12px;
  background: #E6F0FF; border: 1px solid #B3D0FF;
  border-radius: 8px; padding: 12px 14px;
}
.role-icon { font-size: 20px; margin-top: 2px; }
.role-pill strong { font-size: 13px; font-weight: 700; color: #0052CC; }
.role-pill p { font-size: 12px; color: #0052CC; opacity: .8; margin-top: 2px; line-height: 1.4; }

.auth-footer { text-align: center; font-size: 13px; color: #7A869A; }
.auth-footer a { color: #0052CC; font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }

.auth-divider {
  display: flex; align-items: center; text-align: center; color: #7A869A; font-size: 12px; margin: -4px 0;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; border-bottom: 1px solid #EBECF0;
}
.auth-divider span { padding: 0 10px; }

.btn-google {
  background: #fff; color: #172B4D; border: 1px solid #DFE1E6; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; cursor: pointer; border-radius: 6px; padding: 10px;
}
.btn-google:hover { background: #F4F5F7; }
.google-icon { width: 18px; height: 18px; }


.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-enter-from   { transform: translateY(-8px); opacity: 0; }

@media (max-width: 768px) {
  .auth-container { flex-direction: column; }
  .auth-side { display: none; }
  .auth-card { width: 100%; padding: 32px 24px; }
}
</style>