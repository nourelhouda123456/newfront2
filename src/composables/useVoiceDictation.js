import { ref } from 'vue'

export function useVoiceDictation() {
  const isListening = ref(false)
  const isSupported = ref(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  const finalTranscript = ref('')
  const interimTranscript = ref('')
  let recognition = null

  if (isSupported.value) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
  }

  const startListening = () => {
    if (!isSupported.value || !recognition) {
      throw new Error('La reconnaissance vocale n\'est pas supportée par votre navigateur.')
    }
    
    finalTranscript.value = ''
    interimTranscript.value = ''
    isListening.value = true

    recognition.onresult = (event) => {
      let currentInterim = ''
      let currentFinal = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript
        } else {
          currentInterim += event.results[i][0].transcript
        }
      }

      if (currentFinal) {
        finalTranscript.value += currentFinal + ' '
      }
      interimTranscript.value = currentInterim
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        isListening.value = false
        console.error('Erreur de reconnaissance vocale:', event.error)
      }
    }

    recognition.onend = () => {
      isListening.value = false
    }

    try {
      recognition.start()
    } catch (err) {
      isListening.value = false
      throw err
    }
  }

  const stopListening = () => {
    if (recognition && isListening.value) {
      recognition.stop()
      isListening.value = false
    }
  }
  
  const resetTranscripts = () => {
    finalTranscript.value = ''
    interimTranscript.value = ''
  }

  return {
    isListening,
    isSupported,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscripts
  }
}
