<template>
  <div id="app-root">
    <Navbar v-if="auth.isAuthenticated" />
    <router-view />
    <VoicePrompt v-if="auth.isAuthenticated" />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth.js'
import Navbar from './components/Navbar.vue'
import VoicePrompt from './components/VoicePrompt.vue'

const auth = useAuthStore()
</script>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F4F5F7;
}
</style>
