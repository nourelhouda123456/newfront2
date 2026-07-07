<template>
  <div class="oauth-callback">
    <div class="spinner-container">
      <div class="spinner"></div>
      <h2>Connexion en cours...</h2>
      <p>Veuillez patienter pendant que nous finalisons votre connexion.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  const token = route.query.token
  const user = route.query.user

  if (token && user) {
    auth.handleGoogleCallback(token, user)
    router.push('/dashboard')
  } else {
    // S'il n'y a pas de token, il y a peut-être eu une erreur
    router.push('/login?error=google_failed')
  }
})
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F4F5F7;
  font-family: system-ui, -apple-system, sans-serif;
}

.spinner-container {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(9,30,66,.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #DFE1E6;
  border-top-color: #0052CC;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

h2 {
  color: #172B4D;
  margin: 0 0 10px;
  font-size: 20px;
}

p {
  color: #7A869A;
  margin: 0;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
