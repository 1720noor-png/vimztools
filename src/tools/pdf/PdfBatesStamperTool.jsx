import { useState, useEffect } from 'react'
import { generateBatesSequence, calculateStampPosition } from '@tool-core/pdf/batesStamper.js'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useAutoFillParams } from '@/hooks/useAutoFillParams'

export default function PdfBatesStamperTool() {
  const { params } = useAutoFillParams({
    prefix: 'CONF-EXHIBIT',
    startNum: '1',
    digits: '6',
    suffix: '',
    totalPages: '10',
    position: 'bottom-right'
  })

  const [prefix, setPrefix] = useState(params.prefix || 'CONF-EXHIBIT')
  const [startNum, setStartNum] = useState(params.startNum || '1')
  const [digits, setDigits] = useState(params.digits || '6')
  const [suffix, setSuffix] = useState(params.suffix || '')
  const [totalPages, setTotalPages] = useState(params.totalPages || '10')
  const [position, setPosition] = useState(params.position || 'bottom-right')
  const [fontSize, setFontSize] = useState('10')

  const [pdfFile, setPdfFile] = useState(null)
  const [pdfPageCount, setPdfPageCount] = useState(null)
  const [isStamping, setIsStamping] = useState(false)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const generate = (pageCountOverride = null) => {
    try {
      setErr('')
      setSuccessMsg('')
      const count = pageCountOverride || parseInt(totalPages, 10) || 10
      const sequence = generateBatesSequence({
        prefix,
        startNum: parseInt(startNum, 10) || 1,
        digits: parseInt(digits, 10) || 6,
        suffix,
        totalPages: count
      })
      setRes(sequence)
      return sequence
    } catch (e) {
      setErr(e.message || 'Generation error.')
      setRes(null)
      return null
    }
  }

  useEffect(() => {
    generate()
  }, [prefix, startNum, digits, suffix, totalPages, position])

  const handlePdfUpload = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setPdfFile(file)
    setErr('')
    setSuccessMsg('')
    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer)
      const count = doc.getPageCount()
      setPdfPageCount(count)
      setTotalPages(String(count))
      generate(count)
    } catch (e) {
      setErr('Failed to read uploaded PDF. Ensure the file is not encrypted or corrupt.')
      setPdfPageCount(null)
    }
  }

  const stampAndDownloadPdf = async () => {
    if (!pdfFile) {
      setErr('Please select a PDF file to stamp.')
      return
    }

    setIsStamping(true)
    setErr('')
    setSuccessMsg('')

    try {
      const sequence = generate(pdfPageCount)
      if (!sequence) throw new Error('Could not calculate Bates sequence.')

      const buffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const size = parseFloat(fontSize) || 10
      const pages = pdfDoc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const stampText = sequence.items[i] ? sequence.items[i].stamp : `PAGE-${i + 1}`
        const textWidth = font.widthOfTextAtSize(stampText, size)

        let { x, y, alignment } = calculateStampPosition(position, width, height, 36)
        if (alignment === 'right') {
          x -= textWidth
        } else if (alignment === 'center') {
          x -= textWidth / 2
        }

        page.drawText(stampText, {
          x,
          y,
          size,
          font,
          color: rgb(0.1, 0.1, 0.1)
        })
      }

      const stampedPdfBytes = await pdfDoc.save()
      const blob = new Blob([stampedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stamped_${pdfFile.name || 'document.pdf'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccessMsg(`Successfully stamped ${pages.length} pages and downloaded ${link.download}!`)
    } catch (e) {
      setErr(e.message || 'Failed to stamp PDF.')
    } finally {
      setIsStamping(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          PDF Bates Numbering & Exhibit Stamper
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
          Stamp client-side sequential Bates numbering, exhibit tags, and confidentiality marks directly onto PDF documents for legal discovery and audit exhibits.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            Upload PDF Document (Optional — to stamp & download):
          </label>
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
          {pdfPageCount && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
              ✓ Loaded {pdfFile.name} ({pdfPageCount} pages detected)
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Bates Prefix / Tag
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. CONF-EXHIBIT, PLAINTIFF"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Starting Number
            </label>
            <input
              type="number"
              min="0"
              value={startNum}
              onChange={(e) => setStartNum(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Padding Digits
            </label>
            <select
              value={digits}
              onChange={(e) => setDigits(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            >
              <option value="4">4 Digits (e.g. 0001)</option>
              <option value="6">6 Digits (e.g. 000001, Standard)</option>
              <option value="8">8 Digits (e.g. 00000001)</option>
              <option value="10">10 Digits</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Optional Suffix
            </label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. CONFIDENTIAL"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Stamp Position on Page
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            >
              <option value="bottom-right">Bottom Right (Standard Legal)</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-center">Top Center</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Page Count
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {pdfFile ? (
            <button
              type="button"
              onClick={stampAndDownloadPdf}
              disabled={isStamping}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#059669',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isStamping ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {isStamping ? '⏳ Stamping PDF...' : '⚡ Stamp & Download PDF'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => generate()}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--primary, #2563eb)',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Generate Bates Series Schedule
            </button>
          )}
        </div>

        {err && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            ⚠️ {err}
          </div>
        )}

        {successMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            ✓ {successMsg}
          </div>
        )}
      </div>

      {res && (
        <div style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                Bates Sequence Range: <code style={{ color: 'var(--primary, #2563eb)' }}>{res.sampleRange}</code>
              </span>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                Total: {res.totalPages} exhibits ({res.digits}-digit padding, position: {position})
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(res.copyText)}
              style={{
                padding: '0.375rem 0.75rem',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.8125rem'
              }}
            >
              Copy Series List
            </button>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 1rem', width: '25%' }}>Document Page</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Assigned Bates ID</th>
                </tr>
              </thead>
              <tbody>
                {res.items.map((it) => (
                  <tr key={it.page} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 1rem', color: '#64748b' }}>Page {it.page}</td>
                    <td style={{ padding: '0.5rem 1rem', fontWeight: '600', fontFamily: 'monospace' }}>{it.stamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
