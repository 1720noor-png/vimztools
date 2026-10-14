import { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default function WordToPdf() {
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      setPdfUrl(null)
      setError('')
    }
  }

  const convertToPdf = async () => {
    setLoading(true)
    setError('')
    try {
      let content = pastedText
      if (file) {
        content = await file.text()
      }

      if (!content.trim()) {
        setError('Please upload a document file or enter text to convert.')
        setLoading(false)
        return
      }

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontSize = 12
      const margin = 50

      let page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      let y = height - margin

      const lines = content.split('\n')
      for (const rawLine of lines) {
        const words = rawLine.split(' ')
        let currentLine = ''

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const lineWidth = font.widthOfTextAtSize(testLine, fontSize)
          if (lineWidth > width - margin * 2) {
            page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) })
            y -= fontSize + 6
            if (y < margin) {
              page = pdfDoc.addPage()
              y = height - margin
            }
            currentLine = word
          } else {
            currentLine = testLine
          }
        }

        if (currentLine) {
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) })
          y -= fontSize + 8
          if (y < margin) {
            page = pdfDoc.addPage()
            y = height - margin
          }
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      console.error(err)
      setError('Failed to generate PDF document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>Word / Text to PDF Converter</h2>
      <p className="hint">Convert Word or text documents into clean, printable PDF files.</p>

      <div className="field">
        <span>Select Word / Text File (.doc, .docx, .txt, .md)</span>
        <input type="file" accept=".doc,.docx,.txt,.md" onChange={handleFileChange} />
      </div>

      <p className="hint" style={{ fontSize: '0.82rem', marginBottom: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
        ℹ️ <strong>In-Browser PDF Generator:</strong> Text and notes are styled into standard PDF page layouts using client-side vector fonts and pdf-lib directly in your browser with zero server uploads.
      </p>

      <div className="field">
        <span>Or paste document text directly:</span>
        <textarea
          rows={6}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste or type document contents here..."
        />
      </div>

      {error && <div className="msg error">{error}</div>}

      <div className="actions">
        <button className="btn" disabled={loading} onClick={convertToPdf}>
          {loading ? 'Generating PDF...' : 'Convert to PDF'}
        </button>
      </div>

      {pdfUrl && (
        <div className="out" style={{ marginTop: '1.2rem' }}>
          <strong>✅ PDF Created Successfully!</strong>
          <div className="actions" style={{ marginTop: '0.8rem' }}>
            <a className="btn" href={pdfUrl} download="converted-document.pdf">
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
