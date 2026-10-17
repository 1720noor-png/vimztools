import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { TemplateShell } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export function PdfToolTemplate({ tool }: { tool: RegistryTool }) {
  const [pages, setPages] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !/\.pdf$/i.test(file.name)) {
      setMsg('Please choose a PDF file.')
      return
    }
    setName(file.name)
    setMsg('')
    setBusy(true)
    setPages(null)
    try {
      const buffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      setPages(pdf.numPages)
      await loadingTask.destroy()
      setMsg(`Ready — “${file.name}” has ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}.`)
    } catch {
      setMsg('Could not read that PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <TemplateShell tool={tool}>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-primary-400">
        <Upload className="h-8 w-8 text-slate-400" />
        <span className="mt-3 text-sm font-semibold text-slate-600">Drop a PDF here or click to browse</span>
        <span className="mt-1 text-xs text-slate-400">Stored entirely on your device</span>
        <input type="file" accept="application/pdf" className="hidden" onChange={onFile} />
      </label>

      {busy && (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Opening document…
        </div>
      )}

      {pages !== null && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">{name}</p>
            <p className="mt-0.5 text-xs text-emerald-700">{pages} page{pages === 1 ? '' : 's'} · ready for further processing</p>
          </div>
        </div>
      )}

      {msg && !busy && pages === null && (
        <p className="mt-4 text-sm font-medium text-slate-500">{msg}</p>
      )}
    </TemplateShell>
  )
}