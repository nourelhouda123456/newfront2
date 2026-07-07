<template>
  <div class="auth-page">
    <!-- Background decoration -->
    <div class="auth-bg">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
    </div>

    <div class="auth-container">
      <!-- Left Panel -->
      <div class="auth-side">
        <div class="brand">
          <img src="../assets/logo.png" alt="TaskFlow" class="brand-logo" />
          <span class="brand-name">TaskFlow</span>
        </div>
        <h2 class="side-headline">Gérez vos projets efficacement.</h2>
        <p class="side-desc">Organisez, collaborez et suivez vos tâches avec une interface fluide.</p>
        <div class="side-features">
          <div class="side-feature"><span class="feat-icon">✅</span> Kanban boards intuitifs</div>
          <div class="side-feature"><span class="feat-icon">👥</span> Collaboration en équipe</div>
          <div class="side-feature"><span class="feat-icon">📎</span> Import de documents</div>
          <div class="side-feature"><span class="feat-icon">📊</span> Suivi de progression</div>
        </div>
      </div>

      <!-- Right Panel (form) -->
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Connexion</h1>
          <p class="auth-sub">Bienvenue ! Entrez vos identifiants pour continuer.</p>
        </div>

        <transition name="slide-fade">
          <div v-if="error" class="alert alert-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z"/></svg>
            {{ error }}
          </div>
        </transition>

        <form @submit.prevent="submit" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v.217l7 4.2 7-4.2V4a1 1 0 00-1-1H2zm13 2.383l-4.758 2.855L15 11.114V5.383zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 002 13h12a1 1 0 00.966-.739zM1 11.114l4.758-2.876L1 5.383v5.731z"/></svg>
              <input id="login-email" v-model="email" type="email" placeholder="vous@exemple.com" autocomplete="email" />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="login-password">Mot de passe</label>
            </div>
            <div class="input-with-icon">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 012 2v4H6V3a2 2 0 012-2zm3 6V3a3 3 0 00-6 0v4a2 2 0 00-2 2v5a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
              <input id="login-password" v-model="password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" @keyup.enter="submit" />
              <button type="button" class="input-action" @click="showPwd = !showPwd" tabindex="-1">
                {{ showPwd ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading" id="login-submit-btn">
            <div v-if="loading" class="spinner spinner-sm" style="border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ loading ? 'Connexion en cours…' : 'Se connecter' }}
          </button>
        </form>

        <div class="auth-divider"><span>ou</span></div>

        <button type="button" class="btn btn-google btn-block btn-lg" @click="auth.loginWithGoogle()">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" />
          Continuer avec Google
        </button>

        <div class="auth-footer">
          <p>Pas encore de compte ? <router-link to="/register">Créer un compte</router-link></p>
        </div>

        <div class="demo-box">
          <span class="demo-label">Compte démo admin</span>
          <code>admin@taskflow.com</code>
          <span class="demo-sep">/</span>
          <code>admin123</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)
const showPwd  = ref(false)

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs.'; return
  }
  loading.value = true
  const result = await auth.login(email.value, password.value)
  loading.value = false
  if (!result.ok) { error.value = result.error || 'Identifiants invalides.'; return }
  await router.push('/dashboard')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0747A6 0%, #0052CC 50%, #0066FF 100%);
  padding: 24px;
  position: relative; overflow: hidden;
}

/* bg blobs */
.auth-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-blob {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: .25;
}
.bg-blob-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  top: -200px; left: -200px;
}
.bg-blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #36B37E 0%, transparent 70%);
  bottom: -100px; right: -100px;
}

.auth-container {
  display: flex; gap: 0;
  width: 100%; max-width: 900px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(9,30,66,.35), 0 0 0 1px rgba(255,255,255,.1);
  overflow: hidden;
  position: relative; z-index: 1;
}

/* ── Left Side Panel ─────────────────────────── */
.auth-side {
  flex: 1;
  background: linear-gradient(160deg, #0052CC 0%, #003380 100%);
  padding: 48px 40px;
  display: flex; flex-direction: column;
  color: #fff;
}

.brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 40px;
}
.brand-logo { width: 40px; height: 40px; object-fit: contain; filter: brightness(0) invert(1); }
.brand-name { font-size: 22px; font-weight: 800; color: #fff; }

.side-headline {
  font-size: 26px; font-weight: 700; line-height: 1.3;
  margin-bottom: 12px; color: #fff;
}
.side-desc {
  font-size: 14px; color: rgba(255,255,255,.75);
  line-height: 1.6; margin-bottom: 32px;
}

.side-features { display: flex; flex-direction: column; gap: 14px; margin-top: auto; }
.side-feature {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: rgba(255,255,255,.9); font-weight: 500;
}
.feat-icon { font-size: 18px; }

/* ── Right Card ─────────────────────────────── */
.auth-card {
  width: 420px; flex-shrink: 0;
  padding: 48px 40px;
  display: flex; flex-direction: column; gap: 20px;
}

.auth-header { margin-bottom: 4px; }
.auth-title { font-size: 24px; font-weight: 800; color: #172B4D; margin-bottom: 6px; }
.auth-sub { font-size: 14px; color: #7A869A; }

/* ── Input with icon ─────────────────────────── */
.auth-form { display: flex; flex-direction: column; gap: 0; }
.auth-form .form-group { margin-bottom: 18px; }
.auth-form .form-group:last-child { margin-bottom: 0; }
.auth-form label {
  display: block; margin-bottom: 7px;
  font-size: 12px; font-weight: 600; color: #7A869A;
  text-transform: uppercase; letter-spacing: .5px;
}

.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }

.input-with-icon {
  position: relative; display: flex; align-items: center;
}
.input-icon {
  position: absolute; left: 12px; color: #7A869A;
  pointer-events: none;
}
.input-with-icon input {
  padding-left: 36px !important;
  padding-right: 36px;
}
.input-action {
  position: absolute; right: 10px;
  background: transparent; border: none; cursor: pointer;
  font-size: 14px; color: #7A869A; padding: 2px; line-height: 1;
}

/* ── Footer & Demo ──────────────────────────── */
.auth-footer {
  text-align: center; font-size: 13px; color: #7A869A;
}
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
  background: #fff; color: #172B4D; border: 1px solid #DFE1E6; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600;
}
.btn-google:hover { background: #F4F5F7; }
.google-icon { width: 18px; height: 18px; }

.demo-box {
  background: #F4F5F7;
  border: 1px solid #DFE1E6;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}
.demo-label { color: #7A869A; font-weight: 600; flex-basis: 100%; margin-bottom: 2px; }
.demo-box code {
  background: #fff; border: 1px solid #DFE1E6;
  border-radius: 4px; padding: 2px 8px;
  font-family: 'Courier New', monospace; font-size: 12px;
  color: #172B4D;
}
.demo-sep { color: #7A869A; }

.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-enter-from   { transform: translateY(-8px); opacity: 0; }

/* ── Responsive ─────────────────────────────── */
@media (max-width: 768px) {
  .auth-container { flex-direction: column; }
  .auth-side { display: none; }
  .auth-card { width: 100%; padding: 32px 24px; }
}
</style>