import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { removeBackground } from '@imgly/background-removal'
import { Download, Eraser, Loader2, Upload, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Dropzone from '../../../components/ui/Dropzone'
import { Button } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import {
  canvasToBlob,
  loadImage,
  readFileAsDataUrl,
  revokeObjectUrls,
  stripFileExtension,
} from '../../../lib/utils'

const MAX_SIDE = 1600

type Mode = 'ai' | 'simple'

function removeBackgroundFloodFill(image: HTMLImageElement, tolerance: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      reject(new Error('Canvas 2D context unavailable'))
      return
    }
    ctx.drawImage(image, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const seeds: Array<[number, number, number]> = []
    const addSeed = (x: number, y: number) => {
      const i = (y * width + x) * 4
      seeds.push([data[i], data[i + 1], data[i + 2]])
    }
    const step = Math.max(1, Math.floor(Math.min(width, height) / 40))
    for (let x = 0; x < width; x += step) {
      addSeed(x, 0)
      addSeed(x, height - 1)
    }
    for (let y = 0; y < height; y += step) {
      addSeed(0, y)
      addSeed(width - 1, y)
    }

    const near = (r: number, g: number, b: number) =>
      seeds.some(
        ([sr, sg, sb]) => Math.abs(r - sr) + Math.abs(g - sg) + Math.abs(b - sb) < tolerance,
      )

    const visited = new Uint8Array(width * height)
    const stack: number[] = []
    for (let y = 0; y < height; y++) {
      const rowIndex = y * width
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          const idx = rowIndex + x
          const p = idx * 4
          if (near(data[p], data[p + 1], data[p + 2])) {
            visited[idx] = 1
            stack.push(idx)
          }
        }
      }
    }

    const tryVisit = (idx: number) => {
      if (visited[idx]) return
      const p = idx * 4
      if (near(data[p], data[p + 1], data[p + 2])) {
        visited[idx] = 1
        stack.push(idx)
      }
    }

    while (stack.length > 0) {
      const idx = stack.pop() as number
      const x = idx % width
      const y = Math.floor(idx / width)
      if (x > 0) tryVisit(idx - 1)
      if (x < width - 1) tryVisit(idx + 1)
      if (y > 0) tryVisit(idx - width)
      if (y < height - 1) tryVisit(idx + width)
    }

    for (let i = 0; i < data.length; i += 4) {
      if (visited[Math.floor(i / 4)]) {
        data[i + 3] = 0
      }
    }
    ctx.putImageData(imageData, 0, 0)
    canvasToBlob(canvas).then(resolve).catch(reject)
  })
}

export default function BackgroundRemover() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('ai')
  const [tolerance, setTolerance] = useState(48)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultUrlRef = useRef<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => revokeObjectUrls(resultUrlRef.current)
  }, [])

  const setResult = useCallback((url: string | null) => {
    revokeObjectUrls(resultUrlRef.current)
    resultUrlRef.current = url
    setResultUrl(url)
  }, [])

  const onFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file || busy) return
      try {
        const dataUrl = await readFileAsDataUrl(file)
        setSourceUrl(dataUrl)
        setSourceName(file.name)
        setResult(null)
      } catch {
        toast('Failed to read image.', 'error')
      }
    },
    [busy, setResult, toast],
  )

  const onPickFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void onFiles([file])
      e.target.value = ''
    },
    [onFiles],
  )

  const selectMode = useCallback(
    (next: Mode) => {
      setMode(next)
      setResult(null)
      setProgress(null)
    },
    [setResult],
  )

  const remove = useCallback(async () => {
    if (!sourceUrl || busy) return
    setBusy(true)
    try {
      if (mode === 'simple') {
        setProgress('Reading pixels…')
        const image = await loadImage(sourceUrl)
        setProgress('Scanning edges and filling background…')
        const blob = await removeBackgroundFloodFill(image, tolerance)
        setResult(URL.createObjectURL(blob))
        setProgress(null)
        toast('Background removed! Download your transparent PNG.')
      } else {
        setProgress('Loading AI model (only once)…')
        const blob = await removeBackground(sourceUrl, {
          progress: (_key, current, total) => {
            setProgress(`${Math.round((current / total) * 100)}%`)
          },
          output: { format: 'image/png', quality: 1 },
        })
        setResult(URL.createObjectURL(blob))
        setProgress(null)
        toast('Background removed! Download your transparent PNG.')
      }
    } catch (e) {
      console.error(e)
      setProgress(null)
      toast('Background removal failed. Try a clearer image.', 'error')
    } finally {
      setBusy(false)
    }
  }, [busy, mode, setResult, sourceUrl, toast, tolerance])

  const download = useCallback(() => {
    if (!resultUrl) return
    const base = stripFileExtension(sourceName) || 'image'
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${base}-transparent.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast('Transparent PNG downloaded.')
  }, [resultUrl, sourceName, toast])

  const reset = useCallback(() => {
    setResult(null)
    setSourceUrl(null)
    setSourceName('')
    setProgress(null)
  }, [setResult])

  const modeBase =
    'rounded-lg px-4 py-2 text-sm transition ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 '
  const modeActive = modeBase + 'bg-white font-bold text-slate-900 shadow-sm'
  const modeIdle = modeBase + 'font-medium text-slate-500 hover:text-slate-800'

  return (
    <>
      <Seo
        title="AI Background Remover - Free Online | vimz Tools"
        description="Remove image backgrounds right in your browser with on-device AI for a transparent PNG. Free, private, no uploads."
      />
      <ToolShell
        title="AI Background Remover"
        description="Remove the background from any portrait or product photo using on-device AI, or the simple canvas mode for flat-color backgrounds. Runs locally — your image never leaves the browser."
        icon={<Eraser className="h-6 w-6" />}
        breadcrumb="Image Tools"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button type="button" onClick={() => selectMode('ai')} className={mode === 'ai' ? modeActive : modeIdle}>
              AI (on-device model)
            </button>
            <button
              type="button"
              onClick={() => selectMode('simple')}
              className={mode === 'simple' ? modeActive : modeIdle}
            >
              Simple (canvas)
            </button>
          </div>
          {mode === 'simple' && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              Tolerance
              <input
                type="range"
                min={4}
                max={160}
                step={4}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-36 accent-primary-600"
              />
              <span className="w-8 text-right font-bold text-slate-700">{tolerance}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">1. Source image</h3>
            {!sourceUrl ? (
              <>
                <Dropzone
                  onFiles={onFiles}
                  accept=".png,.jpg,.jpeg,.webp"
                  multiple={false}
                  label="Drop an image to remove its background"
                />
                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="h-4 w-4" /> Browse files
                </Button>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-center rounded-xl bg-[conic-gradient(#eee_25%,#fff_0_50%,#eee_0_75%,#fff_0)] bg-[length:16px_16px] p-3">
                  <img src={sourceUrl} alt="Original" className="max-h-72 rounded-lg object-contain" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="truncate text-xs text-slate-400">{sourceName}</p>
                  <button onClick={reset} className="text-xs font-semibold text-rose-500 hover:text-rose-600">
                    Remove
                  </button>
                </div>
              </div>
            )}
            {busy && (
              <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-800">Removing background...</p>
                  {progress && <p className="text-xs text-primary-500">{progress}</p>}
                </div>
              </div>
            )}
            <Button onClick={remove} disabled={!sourceUrl || busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? 'Processing...' : 'Remove background'}
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">2. Result</h3>
            {resultUrl ? (
              <>
                <div className="flex items-center justify-center rounded-xl bg-[conic-gradient(#eee_25%,#fff_0_50%,#eee_0_75%,#fff_0)] bg-[length:16px_16px] p-3">
                  <img src={resultUrl} alt="Background removed" className="max-h-72 rounded-lg object-contain" />
                </div>
                <Button variant="success" onClick={download} className="w-full">
                  <Download className="h-4 w-4" /> Download transparent PNG
                </Button>
              </>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-center">
                <Eraser className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">
                  {busy ? 'Working on it...' : 'Your transparent PNG will appear here.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}