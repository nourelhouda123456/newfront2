<template>
  <div class="auth-page">
    <div class="auth-card card">
<div class="auth-logo">
  <img src="../assets/logo.png" alt="TaskFlow" class="auth-logo-img" />
  <span class="auth-logo-text">askFlow</span>
</div>      <h1 class="auth-title">Connexion</h1>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="vous@exemple.com" @keyup.enter="submit" />
      </div>
      <div class="form-group">
        <label>Mot de passe</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="submit" />
      </div>

      <button class="btn btn-primary" style="width:100%" @click="submit" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>

      <p class="auth-link">
        Pas encore de compte ?
        <router-link to="/register">Créer un compte</router-link>
      </p>

      <div class="demo-info">
        <p> Compte admin par défaut :</p>
        <p><strong>admin@taskflow.com</strong> / admin123</p>
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
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px; background: var(--gray-1);
}
.auth-card { width: 100%; max-width: 380px; }



 .auth-logo {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
 }

.auth-logo {
  display: flex;
  align-items: center;      /* Centre verticalement */
  justify-content: center;  /* Centre horizontalement */
  
 }


.auth-logo-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.auth-logo-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--blue);
}
.auth-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.auth-link  { text-align: center; margin-top: 16px; font-size: 13px; color: var(--gray-5); }
.auth-link a { color: var(--blue); text-decoration: none; font-weight: 500; }
.demo-info {
  margin-top: 20px; padding: 12px; border-radius: var(--radius);
  background: var(--blue-lt); font-size: 12px; color: var(--blue); text-align: center;
}
</style>