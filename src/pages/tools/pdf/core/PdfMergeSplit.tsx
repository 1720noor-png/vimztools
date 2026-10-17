import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { FileStack, Merge, Scissors, Trash2, Loader2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone, { FileChip } from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

export default function PdfMergeSplit() {
  const [mode, setMode] = useState<'merge' | 'split'>('merge')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const onFiles = useCallback(
    (incoming: File[]) => {
      const pdfs = incoming.filter((f) => /\.pdf$/i.test(f.name))
      if (pdfs.length === 0) {
        toast('Please choose PDF files.', 'error')
        return
      }
      setFiles((prev) => {
        const existing = new Set(prev.map((f) => `${f.name}:${f.size}`))
        const fresh = pdfs.filter((f) => !existing.has(`${f.name}:${f.size}`))
        return [...prev, ...fresh]
      })
    },
    [toast],
  )

  const move = (i: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const merge = async () => {
    if (files.length < 2) {
      toast('Add at least 2 PDFs to merge.', 'error')
      return
    }
    setBusy(true)
    try {
      const merged = await PDFDocument.create()
      for (const f of files) {
        const src = await PDFDocument.load(await readFileAsArrayBuffer(f), { ignoreEncryption: true })
        const indices = src.getPageIndices()
        const pages = await merged.copyPages(src, indices)
        pages.forEach((p) => merged.addPage(p))
      }
      const bytes = await merged.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'vimz-merged.pdf')
      toast(`Merged ${files.length} PDFs into 1 file.`)
      setFiles([])
    } catch (e) {
      console.error(e)
      toast('Merge failed. Some PDFs may be corrupt or protected.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const split = async () => {
    if (files.length === 0) {
      toast('Add a PDF to split.', 'error')
      return
    }
    setBusy(true)
    try {
      const f = files[0]
      const src = await PDFDocument.load(await readFileAsArrayBuffer(f), { ignoreEncryption: true })
      const total = src.getPageCount()
      const base = stripFileExtension(f.name)

      for (let i = 0; i < total; i++) {
        const doc = await PDFDocument.create()
        const [page] = await doc.copyPages(src, [i])
        doc.addPage(page)
        const bytes = await doc.save()
        downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${base}-page-${i + 1}.pdf`)
      }
      toast(`Split ${total} page${total > 1 ? 's' : ''} into separate files.`)
      setFiles([])
    } catch (e) {
      console.error(e)
      toast('Split failed. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="PDF Merge & Split Tool - Free Online | vimz Tools"
        description="Combine multiple PDFs into one or split a PDF into individual pages. 100% client-side with pdf-lib, no uploads."
      />
      <ToolShell
        title="PDF Merge & Split"
        description="Combine several PDFs into a single document, or split one PDF into individual page files. Uses pdf-lib entirely in your browser."
        icon={<FileStack className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:max-w-md">
          <button
            onClick={() => setMode('merge')}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === 'merge' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Merge className="h-4 w-4" /> Merge
          </button>
          <button
            onClick={() => setMode('split')}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === 'split' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scissors className="h-4 w-4" /> Split
          </button>
        </div>

        {mode === 'merge' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple
                label="Drop PDFs here to merge them"
              />
              {files.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      {files.length} PDF{files.length > 1 && 's'} — merge order is top to bottom
                    </p>
                    <button onClick={() => setFiles([])} className="text-xs font-semibold text-rose-500 hover:text-rose-600">
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {files.map((f, i) => (
                      <div key={`${f.name}:${f.size}`} className="relative">
                        <FileChip
                          file={f}
                          index={i}
                          onRemove={(idx) => setFiles((prev) => prev.filter((_, j) => j !== idx))}
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                          {i > 0 && (
                            <button onClick={() => move(i, -1)} className="px-2 py-1 text-xs text-slate-500 hover:bg-primary-50 hover:text-primary-700" aria-label="Move up">
                              ↑
                            </button>
                          )}
                          {i < files.length - 1 && (
                            <button onClick={() => move(i, 1)} className="px-2 py-1 text-xs text-slate-500 hover:bg-primary-50 hover:text-primary-700" aria-label="Move down">
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={merge} disabled={busy || files.length < 2}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileStack className="h-4 w-4" />}
                    Merge {files.length} PDFs
                  </Button>
                </div>
              )}
            </div>
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold text-slate-800">Merge tips</h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-500">
                <li>• Add PDFs in the order you want them combined.</li>
                <li>• Use the ↑↓ arrows to reorder pages.</li>
                <li>• Your merged file is assembled locally and never uploaded.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a single PDF to split into pages"
              />
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="relative">
                    <FileChip file={files[0]} index={0} onRemove={() => setFiles([])} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={split} disabled={busy || files[0].size > 100 * 1024 * 1024}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                      {busy ? 'Splitting...' : 'Split into separate pages'}
                    </Button>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Trash2 className="h-3.5 w-3.5" /> Each page is exported as its own PDF: name-page-1.pdf, etc.
                  </p>
                </div>
              )}
            </div>
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold text-slate-800">Split options</h3>
              <Field label="Output">
                <Select defaultValue="one-per-page" className="opacity-50">
                  <option value="one-per-page">One PDF per page</option>
                </Select>
              </Field>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Extract each page as an independent PDF file. Great for sharing single
                pages or rebuilding documents.
              </p>
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}