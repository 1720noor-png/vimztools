import { useState } from 'react'

export default function PdfTranslator() {
  const [file, setFile] = useState(null)
  const [targetLang, setTargetLang] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [progress, setProgress] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      setTranslatedText('')
      setError('')
      setProgress('')
    }
  }

  const translatePdf = async () => {
    if (!file) {
      setError('Please select a PDF file first.')
      return
    }
    setLoading(true)
    setError('')
    setTranslatedText('')
    setProgress('Extracting text from PDF...')

    try {
      const buffer = await file.arrayBuffer()
      const decoder = new TextDecoder('utf-8')
      const raw = decoder.decode(buffer)

      const textMatches = []
      const streamRegex = /BT[\s\S]*?ET/g
      let match
      while ((match = streamRegex.exec(raw)) !== null) {
        const tjMatches = match[0].match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g)
        if (tjMatches) {
          tjMatches.forEach((t) => {
            const cleaned = t.replace(/^[\(\[]|[\)\]]\s*T[jJ]$/g, '').replace(/\\([()])/g, '$1')
            if (cleaned.trim()) textMatches.push(cleaned)
          })
        }
      }
      const text = textMatches.join(' ').replace(/\s+/g, ' ').trim()

      if (!text) {
        setError('No text could be extracted from this PDF. Scanned PDFs require Image OCR.')
        setLoading(false)
        return
      }

      // Chunk text into max 450-character chunks
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

      const translatedChunks = []
      for (let i = 0; i < chunks.length; i++) {
        setProgress(`Translating section ${i + 1} of ${chunks.length}...`)
        const chunk = chunks[i]
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=autodetect|${targetLang}`
        const res = await fetch(url)
        const data = await res.json()
        if (data && data.responseData && data.responseData.translatedText) {
          translatedChunks.push(data.responseData.translatedText)
        } else {
          translatedChunks.push(chunk)
        }
      }

      setTranslatedText(translatedChunks.join('\n\n'))
      setProgress('')
    } catch (err) {
      console.error(err)
      setError('Translation request failed. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>PDF Translator</h2>
      <p className="hint">Extract text from a PDF and translate it into your target language.</p>

      <div className="field">
        <span>Select PDF File</span>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
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

      <p className="hint" style={{ fontSize: '0.82rem', marginBottom: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
        ⚠️ <strong>Free Quota Notice:</strong> Document translation utilizes the public MyMemory Translation API (free daily allowance of ~5,000 words). Large multi-page PDF files should be translated in sections to avoid provider rate limits.
      </p>

      {error && <div className="msg error">{error}</div>}
      {progress && <p className="hint" style={{ color: 'var(--brand)' }}>{progress}</p>}

      <div className="actions">
        <button className="btn" disabled={!file || loading} onClick={translatePdf}>
          {loading ? 'Translating PDF...' : 'Translate PDF'}
        </button>
      </div>

      {translatedText && (
        <div className="out" style={{ marginTop: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3>Translated Result</h3>
            <button className="btn ghost" onClick={() => navigator.clipboard.writeText(translatedText)}>Copy Text</button>
          </div>
          <div className="doc">{translatedText}</div>
        </div>
      )}
    </div>
  )
}
