import { useState, useRef } from 'react'

export default function SpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event) => {
        let currentInterim = ''
        let finalStr = transcript

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            finalStr += (finalStr ? ' ' : '') + res[0].transcript
          } else {
            currentInterim += res[0].transcript
          }
        }
        setTranscript(finalStr)
        setInterim(currentInterim)
      }

      recognition.onerror = (event) => {
        console.error(event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error(err)
      setError('Failed to start microphone speech recognition.')
    }
  }

  return (
    <div className="panel">
      <h2>Speech to Text</h2>
      <p className="hint">Transcribe spoken words from your microphone into real-time text.</p>

      <p className="hint" style={{ fontSize: '0.82rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
        🔒 <strong>Browser & Microphone Notice:</strong> Web Speech API runs client-side in modern Chromium browsers (Google Chrome, Microsoft Edge, Brave) and Safari. Microphone permission over a secure origin (HTTPS or localhost) is required.
      </p>

      {error && <div className="msg error">{error}</div>}

      <div className="actions">
        <button className={`btn ${isListening ? 'ghost' : ''}`} style={isListening ? { borderColor: 'var(--bad)', color: 'var(--bad)' } : {}} onClick={toggleListening}>
          {isListening ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>
        {transcript && (
          <button className="btn ghost" onClick={() => setTranscript('')}>Clear Text</button>
        )}
      </div>

      <div className="out" style={{ marginTop: '1.2rem', minHeight: '150px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3>Transcription</h3>
          {transcript && (
            <button className="btn ghost" onClick={() => navigator.clipboard.writeText(transcript)}>Copy</button>
          )}
        </div>
        <div className="doc" style={{ minHeight: '100px' }}>
          {transcript}
          {interim && <span style={{ color: 'var(--muted)', italic: true }}> {interim}</span>}
          {!transcript && !interim && <span className="hint">Click Start Recording and speak into your microphone...</span>}
        </div>
      </div>
    </div>
  )
}
