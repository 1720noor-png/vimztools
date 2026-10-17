import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib'
import { Download, Loader2, PenTool, Trash2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

interface FieldInfo {
  name: string
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unknown'
  options: string[]
}

function fieldTypeOf(f: unknown): FieldInfo['type'] {
  if (f instanceof PDFTextField) return 'text'
  if (f instanceof PDFCheckBox) return 'checkbox'
  if (f instanceof PDFRadioGroup) return 'radio'
  if (f instanceof PDFDropdown || f instanceof PDFOptionList) return 'dropdown'
  return 'unknown'
}

export default function PdfFormFill() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [signature, setSignature] = useState<string | null>(null)
  const [hasForm, setHasForm] = useState(false)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setFields([])
      setValues({})
      setSignature(null)
      setHasForm(false)
      setBusy(true)
      try {
        const doc = await PDFDocument.load(await readFileAsArrayBuffer(pdf), { ignoreEncryption: true })
        const found: FieldInfo[] = []
        try {
          const form = doc.getForm()
          for (const f of form.getFields()) {
            const name = f.getName()
            const type = fieldTypeOf(f)
            const options: string[] = []
            if (type === 'dropdown' && (f instanceof PDFDropdown || f instanceof PDFOptionList)) {
              try {
                options.push(...f.getOptions())
              } catch {
                // options not readable
              }
            }
            found.push({ name, type, options })
          }
        } catch {
          // no acroform present
        }
        setFields(found)
        setHasForm(found.length > 0)
        if (found.length === 0) {
          toast('No interactive form fields detected - you can still add a signature.', 'info')
        }
      } catch {
        toast('Could not read this PDF form.', 'error')
      } finally {
        setBusy(false)
      }
    },
    [toast],
  )

  const apply = async () => {
    if (!file) return
    setBusy(true)
    try {
      const doc = await PDFDocument.load(await readFileAsArrayBuffer(file), { ignoreEncryption: true })
      const base = stripFileExtension(file.name)

      if (fields.length > 0) {
        const form = doc.getForm()
        for (const f of form.getFields()) {
          const name = f.getName()
          const value = values[name]
          if (value === undefined || value === '') continue
          try {
            if (f instanceof PDFTextField) {
              f.setText(value)
            } else if (f instanceof PDFCheckBox) {
              if (value === 'true' || value === 'checked') f.check()
            } else if (f instanceof PDFRadioGroup || f instanceof PDFDropdown || f instanceof PDFOptionList) {
              f.select(value)
            }
          } catch {
            // field failed to update - skip silently
          }
        }
        try {
          form.flatten()
        } catch {
          // flattening optional
        }
      }

      if (signature) {
        const pages = doc.getPages()
        const target = pages.length > 1 ? pages[pages.length - 1] : pages[0]
        if (!target) {
          toast('This PDF has no pages. Try a different file.', 'error')
          return
        }
        const { width } = target.getSize()
        const png = await (await fetch(signature)).arrayBuffer()
        const img = await doc.embedPng(png as ArrayBuffer)
        target.drawImage(img, {
          x: width - 235,
          y: 65,
          width: 205,
          height: 82,
        })
      }

      const bytes = await doc.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${base}-filled.pdf`)
      toast('Form saved with your values and signature.')
    } catch (e) {
      console.error(e)
      toast('Could not save the filled form.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setFields([])
    setValues({})
    setSignature(null)
    setHasForm(false)
  }

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Seo
        title="PDF Form Filler & Signer - Free Online | vimz Tools"
        description="Fill interactive PDF forms, tick checkboxes and add a drawn signature, then download the completed file. Everything happens in your browser."
      />
      <ToolShell
        title="PDF Form Filler & Signer"
        description="Fill text fields and select boxes of an interactive PDF, draw your signature right on the page, and export the completed form. No uploads."
        icon={<PenTool className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: draw your signature once, then it is embedded into the final PDF automatically."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop an interactive PDF form here"
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {hasForm ? `${fields.length} field${fields.length !== 1 ? 's' : ''} detected` : 'No fillable fields detected'}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-4">
                    {fields.map((f, i) => {
                      if (f.type === 'checkbox') {
                        return (
                          <Field key={`${f.name}-${i}`} label={f.name}>
                            <label className="flex items-center gap-2.5 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={values[f.name] === 'true'}
                                onChange={(e) => setValue(f.name, e.target.checked ? 'true' : 'false')}
                                className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                              />
                              <span>This box is ticked</span>
                            </label>
                          </Field>
                        )
                      }
                      if (f.type === 'dropdown' && f.options.length > 0) {
                        return (
                          <Field key={`${f.name}-${i}`} label={f.name}>
                            <select
                              value={values[f.name] ?? ''}
                              onChange={(e) => setValue(f.name, e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            >
                              <option value="">-- select --</option>
                              {f.options.map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </Field>
                        )
                      }
                      return (
                        <Field key={`${f.name}-${i}`} label={`${f.name}${f.type === 'radio' ? ' (select a value)' : ''}`}>
                          <input
                            type="text"
                            value={values[f.name] ?? ''}
                            onChange={(e) => setValue(f.name, e.target.value)}
                            placeholder={`Type into ${f.name}`}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          />
                        </Field>
                      )
                    })}
                  </div>
                )}

                <SignaturePad value={signature} onChange={setSignature} />

                <Button onClick={apply} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {busy ? 'Saving...' : 'Fill & download PDF'}
                </Button>
              </div>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">About this tool</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Fillable PDFs store form fields inside the file. This tool reads those fields, lets you type
              values, and stamps your signature.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Text fields accept any text value.</li>
              <li>Checkboxes are ticked on or off.</li>
              <li>Dropdowns list the options defined in the PDF.</li>
              <li>The signature is stamped at the bottom-right of the last page.</li>
            </ul>
          </div>

          {busy && <LoadingOverlay message="Filling your PDF form..." />}
        </div>
      </ToolShell>
    </>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function SignaturePad({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)

  const getPos = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) }
  }

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!drawingRef.current || !ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onChange(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Draw your signature</p>
        {value && (
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-slate-400">
        Drag inside the box to draw in black. It is placed on the last page of the PDF.
      </p>
      <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          className="h-44 w-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  )
}