import { ref } from 'vue'

export function useVoiceCommand() {
  const isListening = ref(false)
  const isSupported = ref(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  let recognition = null

  if (isSupported.value) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
  }

  const startListening = () => {
    return new Promise((resolve, reject) => {
      if (!isSupported.value || !recognition) {
        return reject(new Error('La reconnaissance vocale n\'est pas supportée par votre navigateur.'))
      }

      isListening.value = true

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        isListening.value = false
        resolve(transcript)
      }

      recognition.onerror = (event) => {
        isListening.value = false
        reject(new Error(`Erreur de reconnaissance vocale: ${event.error}`))
      }

      recognition.onend = () => {
        isListening.value = false
      }

      try {
        recognition.start()
      } catch (err) {
        isListening.value = false
        reject(err)
      }
    })
  }

  const stopListening = () => {
    if (recognition && isListening.value) {
      recognition.stop()
      isListening.value = false
    }
  }

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  }
}
