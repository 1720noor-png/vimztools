import { useState } from 'react'
import { Binary, ArrowRightLeft } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function encodeUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i]
    const b2 = bytes[i + 1]
    const b3 = bytes[i + 2]
    const n = (b1 << 16) | ((b2 ?? 0) << 8) | (b3 ?? 0)
    out += b64chars[(n >> 18) & 63]
    out += b64chars[(n >> 12) & 63]
    out += b2 === undefined ? '=' : b64chars[(n >> 6) & 63]
    out += b3 === undefined ? '=' : b64chars[n & 63]
  }
  return out
}

function decodeUtf8(input: string): { ok: boolean; value: string; error?: string } {
  const clean = input.replace(/\s+/g, '')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
    return { ok: false, value: '', error: 'Invalid Base64 input.' }
  }
  const bytes: number[] = []
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = b64chars.indexOf(clean[i])
    const c2 = b64chars.indexOf(clean[i + 1])
    const c3 = clean[i + 2] === '=' ? 0 : b64chars.indexOf(clean[i + 2])
    const c4 = clean[i + 3] === '=' ? 0 : b64chars.indexOf(clean[i + 3])
    if (c1 < 0 || c2 < 0 || (clean[i + 2] !== '=' && c3 < 0) || (clean[i + 3] !== '=' && c4 < 0)) {
      return { ok: false, value: '', error: 'Invalid Base64 characters.' }
    }
    bytes.push((c1 << 2) | (c2 >> 4))
    if (clean[i + 2] !== '=') bytes.push(((c2 & 15) << 4) | (c3 >> 2))
    if (clean[i + 3] !== '=') bytes.push(((c3 & 3) << 6) | c4)
  }
  try {
    return { ok: true, value: new TextDecoder().decode(new Uint8Array(bytes)) }
  } catch {
    return { ok: false, value: '', error: 'Decoded bytes are not valid UTF-8 text.' }
  }
}

export default function Base64EncoderDecoder() {
  const [tab, setTab] = useState<'encode' | 'decode' | 'file'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const runEncode = () => {
    setError('')
    setOutput(encodeUtf8(input))
  }

  const runDecode = () => {
    setError('')
    const r = decodeUtf8(input)
    if (!r.ok) {
      setError(r.error ?? 'Invalid input.')
      setOutput('')
    } else {
      setOutput(r.value)
    }
  }

  const onFile = (f: File | undefined) => {
    if (!f) return
    setFileName(f.name)
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      setOutput(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => setError('Could not read the file.')
    reader.readAsDataURL(f)
  }

  return (
    <>
      <Seo
        title="Base64 Encoder & Decoder - vimz Tools"
        description="Encode or decode text and files to and from Base64 instantly, entirely in your browser."
      />
      <ToolShell
        title="Base64 Encoder & Decoder"
        description="Turn text or files into Base64 and back, with no data ever leaving your device."
        icon={<Binary className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a mode, paste your input or choose a file, then convert instantly."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(['encode', 'decode', 'file'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'encode' ? 'Encode text' : t === 'decode' ? 'Decode text' : 'Encode file'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label={tab === 'decode' ? 'Base64 input' : 'Plain text input'}>
              <TextArea rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder={tab === 'decode' ? 'Paste Base64 here...' : 'Type or paste text here...'} />
            </Field>
            {tab === 'file' && (
              <Field label="Choose a file to encode">
                <TextInput type="file" onChange={(e) => onFile(e.target.files?.[0])} />
              </Field>
            )}
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={tab === 'encode' ? runEncode : runDecode} disabled={!input.trim() && tab !== 'file'}>
                <ArrowRightLeft className="h-4 w-4" /> {tab === 'decode' ? 'Decode' : 'Encode'}
              </Button>
              {tab === 'file' && <Button onClick={() => setOutput('')}>Clear</Button>}
            </div>
          </div>
          <div className="space-y-4">
            {fileName && (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                Encoded {fileName}
              </p>
            )}
            <Field label="Output">
              <TextArea readOnly rows={8} value={output} placeholder="Result appears here..." className="bg-slate-50" />
            </Field>
            <CodeBlock title="Output" code={output || 'No output yet'} lang="plain" />
            <p className="text-xs leading-relaxed text-slate-400">
              All encoding happens in your browser with the Web Encoding API. Files never leave this device.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}