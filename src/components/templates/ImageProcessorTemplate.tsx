import { useEffect, useRef, useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import { TemplateShell, btnCls, btnGhostCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

export function ImageProcessorTemplate({ tool }: { tool: RegistryTool }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!img || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(img, 0, 0)
  }, [img])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = url
  }

  function applyFilter(fn: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    fn(ctx)
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${tool.id || 'image'}-edited.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function grayscale() {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 30))
    applyFilter((ctx) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        d[i] = d[i + 1] = d[i + 2] = gray
      }
      ctx.putImageData(imageData, 0, 0)
    })
    setBusy(false)
  }

  async function negative() {
    applyFilter((ctx) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i]
        d[i + 1] = 255 - d[i + 1]
        d[i + 2] = 255 - d[i + 2]
      }
      ctx.putImageData(imageData, 0, 0)
    })
  }

  async function rotate() {
    const el = img
    if (!el || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = el.naturalHeight
    canvas.height = el.naturalWidth
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(el, -el.naturalWidth / 2, -el.naturalHeight / 2)
  }

  return (
    <TemplateShell tool={tool}>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-primary-400">
        <Upload className="h-8 w-8 text-slate-400" />
        <span className="mt-3 text-sm font-semibold text-slate-600">Click to upload an image</span>
        <span className="mt-1 text-xs text-slate-400">PNG, JPG, WebP — processed locally</span>
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>

      {img && (
        <div className="mt-6">
          <canvas ref={canvasRef} className="max-h-80 w-full rounded-xl border border-slate-200 object-contain" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={btnGhostCls} onClick={grayscale} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Grayscale
            </button>
            <button className={btnGhostCls} onClick={negative}>Negative</button>
            <button className={btnGhostCls} onClick={rotate}>Rotate 90°</button>
            <button className={btnCls} onClick={download}>
              <Download className="h-4 w-4" /> Download PNG
            </button>
          </div>
        </div>
      )}
    </TemplateShell>
  )
}