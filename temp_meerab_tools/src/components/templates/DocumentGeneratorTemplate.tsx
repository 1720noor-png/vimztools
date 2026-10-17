import { useState } from 'react'
import { Download, Loader2, FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { TemplateShell, inputCls, btnCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

export function DocumentGeneratorTemplate({ tool }: { tool: RegistryTool }) {
  const [title, setTitle] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [body, setBody] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const bullets = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const previewText = [
    title || 'Document title',
    from ? `From: ${from}` : '',
    to ? `To: ${to}` : '',
    new Date().toLocaleDateString(),
    '',
    ...bullets,
    notes ? `Notes: ${notes}` : '',
  ]

  async function download() {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 50))
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(title || 'Document', 20, 24)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(new Date().toLocaleDateString(), 20, 33)
    if (from) doc.text(`From: ${from}`, 20, 43)
    if (to) doc.text(`To: ${to}`, 20, 51)
    doc.setDrawColor(200)
    doc.setLineWidth(0.4)
    doc.line(20, 60, 190, 60)
    let y = 72
    for (const line of bullets) {
      const parts = doc.splitTextToSize(line, 170)
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(parts, 20, y)
      y += (parts.length - 1) * 5 + 7
    }
    if (notes) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.text('Notes', 20, y + 4)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(notes, 170)
      doc.text(lines, 20, y + 12)
    }
    const fileName = `${(title || tool.id || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
    doc.save(fileName)
    setBusy(false)
  }

  return (
    <TemplateShell tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Title</span>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Invoice / Cover Letter / Proposal" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">From</span>
            <input className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name / company" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">To</span>
            <input className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Content (one line per bullet)</span>
            <textarea className={`${inputCls} min-h-44`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Key points, services, or terms..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Notes (optional)</span>
            <textarea className={`${inputCls} min-h-20`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="References, thanks, amounts..." />
          </label>
          <button className={btnCls} onClick={download} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
            <FileText className="h-4 w-4" /> Live preview
          </p>
          <div className="min-h-[24rem] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {previewText.some((l) => l.length > 0) ? (
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-900">{title || 'Document title'}</p>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
                {from && <p className="text-sm text-slate-600">From: {from}</p>}
                {to && <p className="text-sm text-slate-600">To: {to}</p>}
                <div className="my-3 border-t border-slate-200" />
                {bullets.map((b, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-700">
                    <span className="mr-2 font-bold text-primary-500">•</span>
                    {b}
                  </p>
                ))}
                {notes && <p className="mt-4 text-sm text-slate-500"><span className="font-bold">Notes:</span> {notes}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Start typing in the form to see the document preview.</p>
            )}
          </div>
        </div>
      </div>
    </TemplateShell>
  )
}