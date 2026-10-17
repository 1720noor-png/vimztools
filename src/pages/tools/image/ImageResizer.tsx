import { useCallback, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Scaling, Download, Loader2, RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Dropzone from '../../../components/ui/Dropzone'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { downloadBlob, formatBytes, getFileExtension, loadImage, revokeObjectUrls, stripFileExtension } from '../../../lib/utils'

interface Result {
  blob: Blob
  url: string
  originalSize: number
  width: number
  height: number
  name: string
}

function canvasToBlobP(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality),
  )
}

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'scale' | 'dimension'>('scale')
  const [percent, setPercent] = useState(50)
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [quality, setQuality] = useState(0.8)
  const [keepRatio, setKeepRatio] = useState(true)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const f = files[0]
      if (!f) return
      try {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (result) URL.revokeObjectURL(result.url)
        const url = URL.createObjectURL(f)
        const img = await loadImage(url)
        setWidth(img.naturalWidth)
        setHeight(img.naturalHeight)
        setFile(f)
        setPreviewUrl(url)
        setResult(null)
      } catch {
        toast('Could not load that image.', 'error')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewUrl, toast],
  )

  const process = async () => {
    if (!file || !previewUrl) return
    setBusy(true)
    try {
      const img = await loadImage(previewUrl)
      let targetW = width
      let targetH = height
      if (mode === 'scale') {
        targetW = Math.round(img.naturalWidth * (percent / 100))
        targetH = Math.round(img.naturalHeight * (percent / 100))
      } else if (keepRatio) {
        const wr = targetW / img.naturalWidth
        const hr = targetH / img.naturalHeight
        const r = Math.min(wr, hr)
        targetW = Math.round(img.naturalWidth * r)
        targetH = Math.round(img.naturalHeight * r)
      }

      targetW = Math.max(1, targetW)
      targetH = Math.max(1, targetH)

      const mime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'

      let outBlob: Blob
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      canvas.getContext('2d')?.drawImage(img, 0, 0, targetW, targetH)

      if (quality < 1 || file.size > 300 * 1024) {
        const rawBlob = await canvasToBlobP(canvas, mime, 1)
        outBlob = await imageCompression(
          new File([rawBlob], file.name, { type: mime }),
          {
            initialQuality: quality,
            useWebWorker: true,
            fileType: mime,
            maxWidthOrHeight: Math.max(targetW, targetH),
          },
        )
      } else {
        outBlob = await canvasToBlobP(canvas, mime)
      }

      const url = URL.createObjectURL(outBlob)
      revokeObjectUrls(result?.url)
      setResult({
        blob: outBlob,
        url,
        originalSize: file.size,
        width: targetW,
        height: targetH,
        name: file.name,
      })
      toast('Image processed successfully!')
    } catch (e) {
      console.error(e)
      toast('Processing failed. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result) return
    const base = stripFileExtension(result.name)
    const ext = getFileExtension(result.name) || 'png'
    downloadBlob(result.blob, `${base}-resized.${ext === 'webp' ? 'webp' : ext}`)
    toast('Image downloaded.')
  }

  const reset = () => {
    revokeObjectUrls(previewUrl, result?.url)
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
  }

  return (
    <>
      <Seo
        title="Image Resizer & Compressor - Free Online | vimz Tools"
        description="Resize images by percentage or exact pixels and compress file size with quality control. 100% client-side, no uploads."
      />
      <ToolShell
        title="Image Resizer & Compressor"
        description="Shrink dimensions and file size of any image with full quality control. Uses Web Workers for fast, in-browser processing."
        icon={<Scaling className="h-6 w-6" />}
        breadcrumb="Image Tools"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".png,.jpg,.jpeg,.webp,.gif,.bmp"
                multiple={false}
                label="Drop an image to resize & compress"
              />
            ) : (
              <>
                {previewUrl && (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4">
                    <img src={previewUrl} alt="Preview" className="max-h-80 rounded-lg object-contain" />
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    <RotateCcw className="h-4 w-4" /> Change image
                  </Button>
                </div>
              </>
            )}

            {result && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
                <h3 className="text-sm font-bold text-primary-800">Result</h3>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
                  <img src={result.url} alt="Resized result" className="max-h-60 rounded-lg border border-primary-200 bg-white p-1 object-contain" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Dimensions</p>
                    <p className="text-sm font-bold text-slate-800">{result.width} × {result.height}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Size</p>
                    <p className="text-sm font-bold text-slate-800">{formatBytes(result.blob.size)}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-400">Saved</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {result.originalSize > result.blob.size
                        ? `${Math.round((1 - result.blob.size / result.originalSize) * 100)}%`
                        : '—'}
                    </p>
                  </div>
                </div>
                <Button variant="success" onClick={download} className="mt-4 w-full">
                  <Download className="h-4 w-4" /> Download resized image
                </Button>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Resize options</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('scale')}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  mode === 'scale' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'
                }`}
              >
                By percentage
              </button>
              <button
                onClick={() => setMode('dimension')}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  mode === 'dimension' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'
                }`}
              >
                By pixels
              </button>
            </div>

            {mode === 'scale' ? (
              <Field label={`Scale: ${percent}%`}>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </Field>
            ) : (
              <>
                <Field label="Width (px)">
                  <TextInput type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                </Field>
                <Field label="Height (px)">
                  <TextInput type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                </Field>
                <label className="flex select-none items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={keepRatio}
                    onChange={(e) => setKeepRatio(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600"
                  />
                  Keep aspect ratio
                </label>
              </>
            )}

            <Field label={`Quality: ${Math.round(quality * 100)}%`}>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>

            <Button onClick={process} disabled={!file || busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scaling className="h-4 w-4" />}
              {busy ? 'Processing...' : 'Resize & compress'}
            </Button>
          </div>
        </div>
      </ToolShell>
    </>
  )
}