import { useState } from 'react'

export default function TextTranslator() {
  const [text, setText] = useState('')
  const [sourceLang, setSourceLang] = useState('autodetect')
  const [targetLang, setTargetLang] = useState('es')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const translate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setTranslatedText('')

    try {
      // Chunk text into <= 450 character blocks
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      const chunks = []
      let curr = ''
      for (const s of sentences) {
        if ((curr + s).length > 450) {
          if (curr) chunks.push(curr.trim())
          curr = s
        } else {
          curr += ' ' + s
        }
      }
      if (curr.trim()) chunks.push(curr.trim())

      const results = []
      for (const chunk of chunks) {
        const langPair = sourceLang === 'autodetect' ? `autodetect|${targetLang}` : `${sourceLang}|${targetLang}`
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langPair}`
        const res = await fetch(url)
        const data = await res.json()

        if (data && data.responseData && data.responseData.translatedText) {
          results.push(data.responseData.translatedText)
        } else {
          results.push(chunk)
        }
      }

      setTranslatedText(results.join('\n\n'))
    } catch (err) {
      console.error(err)
      setError('Translation request failed. Please verify your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>Text Translator</h2>
      <p className="hint">Translate paragraphs and text passages between multiple languages.</p>

      <div className="field">
        <span>Enter Text</span>
        <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text to translate..." />
      </div>

      <div className="row">
        <div className="field">
          <span>Source Language</span>
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
            <option value="autodetect">Auto Detect</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div className="field">
          <span>Target Language</span>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="it">Italian (Italiano)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="ru">Russian (Русский)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="hi">Hindi (हिन्दी)</option>
          </select>
        </div>
      </div>

      <p className="hint" style={{ fontSize: '0.82rem', marginBottom: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
        ⚠️ <strong>Translation Quota Notice:</strong> Free instant translation is powered by the public MyMemory API with a standard ~5,000 words/day community quota. For lengthy documents, translate in smaller paragraphs.
      </p>

      {error && <div className="msg error">{error}</div>}

      <div className="actions">
        <button className="btn" disabled={!text.trim() || loading} onClick={translate}>
          {loading ? 'Translating...' : 'Translate Text'}
        </button>
      </div>

      {translatedText && (
        <div className="out" style={{ marginTop: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3>Translated Result</h3>
            <button className="btn ghost" onClick={() => navigator.clipboard.writeText(translatedText)}>Copy Result</button>
          </div>
          <div className="doc">{translatedText}</div>
        </div>
      )}
    </div>
  )
}
