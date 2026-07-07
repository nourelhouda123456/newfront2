import { reactive } from 'vue'

export const voicePromptState = reactive({
  isOpen: false,
  open() {
    this.isOpen = true
  },
  close() {
    this.isOpen = false
  }
})
