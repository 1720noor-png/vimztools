import { useState } from 'react'
import JSZip from 'jszip'

export default function PdfToWord() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wordBlobUrl, setWordBlobUrl] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      setWordBlobUrl(null)
      setError('')
    }
  }

  const convertToWord = async () => {
    if (!file) {
      setError('Please select a PDF file first.')
      return
    }
    setLoading(true)
    setError('')
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
      const text = textMatches.join(' ').replace(/\s+/g, ' ').trim() || 'No text extracted from PDF.'

      // Generate clean Word .docx document structure using JSZip
      const zip = new JSZip()
      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
      )

      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
      )

      const paragraphs = text
        .split('\n\n')
        .map((p) => `<w:p><w:r><w:t>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p>`)
        .join('')

      zip.file(
        'word/document.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
  </w:body>
</w:document>`
      )

      const docxBytes = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(docxBytes)
      setWordBlobUrl(url)
    } catch (err) {
      console.error(err)
      setError('Could not convert PDF to Word document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>PDF to Word Converter</h2>
      <p className="hint">Convert PDF documents into editable Microsoft Word (.docx) documents in your browser.</p>

      <div className="field">
        <span>Select PDF File</span>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      <p className="hint" style={{ fontSize: '0.82rem', marginBottom: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
        ℹ️ <strong>Client-Side Processing:</strong> Directly extracts document text streams and packages them into a clean, editable Microsoft Word (.docx) package inside your browser without uploading files to third-party servers.
      </p>

      {error && <div className="msg error">{error}</div>}

      <div className="actions">
        <button className="btn" disabled={!file || loading} onClick={convertToWord}>
          {loading ? 'Converting to Word...' : 'Convert to Word (.docx)'}
        </button>
      </div>

      {wordBlobUrl && (
        <div className="out" style={{ marginTop: '1.2rem' }}>
          <strong>✅ Conversion Complete!</strong>
          <div className="actions" style={{ marginTop: '0.8rem' }}>
            <a className="btn" href={wordBlobUrl} download={`${file.name.replace(/\.pdf$/i, '')}.docx`}>
              Download Word Document (.docx)
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
