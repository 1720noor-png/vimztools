import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Html5Qrcode } from 'html5-qrcode'
import { QrCode, ScanLine, Download, RefreshCw, Camera, CameraOff } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

const errorLevels = [
  { value: 'L', label: 'L — Low (7%)' },
  { value: 'M', label: 'M — Medium (15%)' },
  { value: 'Q', label: 'Q — Quartile (25%)' },
  { value: 'H', label: 'H — High (30%)' },
]

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://')
  const [size, setSize] = useState(256)
  const [fg, setFg] = useState('#1f2937')
  const [bg, setBg] = useState('#ffffff')
  const [errLevel, setErrLevel] = useState('M')
  const [qrUrl, setQrUrl] = useState('')
  const [scanMode, setScanMode] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const { toast } = useToast()

  const generate = async () => {
    if (!text.trim()) {
      toast('Enter some text or a URL first.', 'error')
      return
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        errorCorrectionLevel: errLevel as 'L' | 'M' | 'Q' | 'H',
        color: { dark: fg, light: bg },
      })
      if (qrUrl.startsWith('blob:')) URL.revokeObjectURL(qrUrl)
      setQrUrl(url)
    } catch (e) {
      console.error(e)
      toast('Could not generate QR code.', 'error')
    }
  }

  useEffect(() => {
    if (text.trim()) generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, size, fg, bg, errLevel])

  const download = () => {
    if (!qrUrl) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'vimz-qr-code.png'
    a.click()
    toast('QR code downloaded.')
  }

  const startScan = async () => {
    setScanMode(true)
    setScannerError('')
    setScanResult('')
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } }, (decoded) => {
        setScanResult(decoded)
        setScanning(false)
        toast('QR code scanned!')
        scanner.stop().then(() => scanner.clear())
      }, () => {})
      setScanning(true)
    } catch (e) {
      console.error(e)
      setScannerError('Could not start camera. Check permissions or use a different browser.')
      setScanning(false)
    }
  }

  const stopScan = async () => {
    setScanning(false)
    setScanMode(false)
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch { /* already stopped */ }
      scannerRef.current = null
    }
  }

  useEffect(() => () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
      } catch {
        /* already cleared */
      }
    }
  }, [])

  const resultType = scanResult.startsWith('http') ? 'URL' : scanResult.startsWith('mailto') ? 'Email' : scanResult.startsWith('tel:') ? 'Phone' : 'Text'

  return (
    <>
      <Seo
        title="QR Code Generator & Scanner - vimz Tools"
        description="Create custom QR codes with colors and error correction, or scan codes with your webcam. Free, private, all in-browser."
      />
      <ToolShell
        title="QR Code Generator & Scanner"
        description="Generate QR codes for URLs, text, Wi-Fi and more — or scan them with your webcam. Both work fully offline and privately."
        icon={<QrCode className="h-6 w-6" />}
        breadcrumb="Student Tools"
      >
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:max-w-md">
          <button
            onClick={() => {
              if (scanMode) stopScan()
              setScanMode(false)
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${!scanMode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <QrCode className="h-4 w-4" /> Generate
          </button>
          <button
            onClick={() => {
              setScanMode(true)
              if (!scanning && !scannerRef.current) startScan()
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${scanMode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ScanLine className="h-4 w-4" /> Scan
          </button>
        </div>

        {!scanMode ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Content (URL, text, phone, etc.)">
                <TextArea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" />
              </Field>
              <Field label={`Size: ${size}px`}>
                <input type="range" min={96} max={1024} step={16} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary-600" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Foreground">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-slate-300" />
                </Field>
                <Field label="Background">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-slate-300" />
                </Field>
              </div>
              <Field label="Error correction">
                <Select value={errLevel} onChange={(e) => setErrLevel(e.target.value)}>
                  {errorLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </Select>
              </Field>
              <Button onClick={generate}>
                <RefreshCw className="h-4 w-4" /> Regenerate QR
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              {qrUrl ? (
                <>
                  <img src={qrUrl} alt="Generated QR code" className="h-56 w-56 rounded-xl border border-slate-200 p-2 shadow-sm sm:h-64 sm:w-64" width={size} height={size} />
                  <div className="mt-5 flex gap-2">
                    <Button variant="success" onClick={download}>
                      <Download className="h-4 w-4" /> Download PNG
                    </Button>
                    <Button variant="secondary" onClick={async () => {
                      try {
                        const svg = await QRCode.toString(text, { type: 'svg', errorCorrectionLevel: errLevel as 'L' | 'M' | 'Q' | 'H', color: { dark: fg, light: bg } })
                        const blob = new Blob([svg], { type: 'image/svg+xml' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'vimz-qr-code.svg'
                        a.click()
                        setTimeout(() => URL.revokeObjectURL(url), 3000)
                        toast('SVG downloaded.')
                      } catch {
                        toast('SVG export failed.', 'error')
                      }
                    }}>
                      Download SVG
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <QrCode className="h-16 w-16 text-slate-200" />
                  <p className="mt-3 text-sm text-slate-400">Enter content to generate a QR code</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  {scanning ? <Camera className="h-4 w-4 text-emerald-600" /> : <CameraOff className="h-4 w-4 text-slate-400" />}
                  Scanner
                </h3>
                <div className="flex gap-2">
                  {!scanning ? (
                    <Button onClick={startScan} disabled={!!scannerError}>
                      <Camera className="h-4 w-4" /> Start camera
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => scannerRef.current?.stop().then(stopScan)}>
                      <CameraOff className="h-4 w-4" /> Stop
                    </Button>
                  )}
                </div>
              </div>
              <div id="qr-reader" className="overflow-hidden rounded-xl border border-slate-200 [&_video]:rounded-xl" />
              {scannerError && (
                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {scannerError}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800">Scanned result</h3>
              {scanResult ? (
                <div>
                  <p className="mt-2 inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">{resultType}</p>
                  <p className="mt-3 break-all rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-800">{scanResult}</p>
                  <div className="mt-4 flex gap-2">
                    {scanResult.startsWith('http') && (
                      <Button onClick={() => window.open(scanResult, '_blank')}>
                        Open link
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(scanResult); toast('Copied!') }}>
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <ScanLine className="h-10 w-10 text-slate-200" />
                  <p className="mt-3 text-sm text-slate-400">
                    {scanning ? 'Point your camera at a QR code...' : 'Start the camera to scan a QR code.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}