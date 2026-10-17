import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound, Plug, Terminal, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'

type Tab = 'curl' | 'auth'

const VERBS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

interface HeaderKV {
  key: string
  value: string
}

function tokenizeShell(input: string): string[] {
  const out: string[] = []
  let cur = ''
  let inSQ = false
  let inDQ = false
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]
    if (inSQ) {
      if (ch === "'") inSQ = false
      else cur += ch
      continue
    }
    if (inDQ) {
      if (ch === '"') inDQ = false
      else cur += ch
      continue
    }
    if (ch === "'") {
      inSQ = true
      continue
    }
    if (ch === '"') {
      inDQ = true
      continue
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur)
        cur = ''
      }
      continue
    }
    cur += ch
  }
  if (cur) out.push(cur)
  return out
}

function parseCurl(input: string) {
  const toks = tokenizeShell(input)
  const headers: HeaderKV[] = []
  const bodyParts: string[] = []
  let method = 'GET'
  let url = ''
  let auth: string | null = null
  let positionalUrl = ''

  for (let i = 0; i < toks.length; i += 1) {
    const t = toks[i]
    if (t === '-X' || t === '--request') {
      method = (toks[i + 1] ?? 'GET').toUpperCase()
      i += 1
      continue
    }
    if (t === '-H' || t === '--header') {
      const raw = toks[i + 1] ?? ''
      const sep = raw.indexOf(':')
      if (sep > 0) {
        headers.push({ key: raw.slice(0, sep).trim(), value: raw.slice(sep + 1).trim() })
      } else if (raw.trim()) {
        headers.push({ key: raw.trim(), value: '' })
      }
      i += 1
      continue
    }
    if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-urlencode' || t === '--data-ascii') {
      bodyParts.push(toks[i + 1] ?? '')
      i += 1
      continue
    }
    if (t === '-u' || t === '--user') {
      const cred = toks[i + 1] ?? ''
      if (cred.trim()) auth = `Basic ${b64encodeUtf8(cred.trim())}`
      i += 1
      continue
    }
    if (!t.startsWith('-') && !url) {
      if (/^https?:\/\//i.test(t) || /^\//.test(t)) {
        url = t
      } else if (!positionalUrl && VERBS.includes(t.toUpperCase())) {
        method = t.toUpperCase()
      } else {
        positionalUrl = t
      }
    } else if (!t.startsWith('-') && !positionalUrl) {
      positionalUrl = t
    }
  }

  if (!url && positionalUrl) url = positionalUrl

  const separators = bodyParts.filter((b) => !b.includes('='))
  const body =
    bodyParts.length > 1 && separators.length === 0
      ? bodyParts
          .map((p) => {
            const eq = p.indexOf('=')
            if (eq > 0) return `${p.slice(0, eq + 1)}${encodeURIComponent(p.slice(eq + 1))}`
            return p
          })
          .join('&')
      : bodyParts.join('')

  return {
    method: method || 'GET',
    url,
    headers,
    body,
    auth,
  }
}

function b64encodeUtf8(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
}

function b64decodeUtf8(input: string): string {
  const clean = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(clean)))
}

function decodeAuth(input: string) {
  const trimmed = input.trim()
  const space = trimmed.indexOf(' ')
  const kind = space > 0 ? trimmed.slice(0, space).trim().toLowerCase() : ''
  const cred = space > 0 ? trimmed.slice(space + 1).trim() : trimmed
  if (!trimmed) return { error: 'Paste an Authorization header value such as Basic dXNlcjpwYXNz or Bearer <token>.' }
  if (kind === 'basic') {
    try {
      const decoded = b64decodeUtf8(cred)
      const colon = decoded.indexOf(':')
      return {
        error: null,
        detail: {
          scheme: 'Basic',
          decoded,
          username: colon > 0 ? decoded.slice(0, colon) : '',
          secret: colon > 0 ? decoded.slice(colon + 1) : decoded,
        },
      }
    } catch {
      return { error: 'Basic credentials are not valid base64.' }
    }
  }
  if (kind === 'bearer') {
    if (cred.split('.').length === 3) {
      return {
        error: null,
        jwt: true,
        payload: cred,
        detail: { scheme: 'Bearer', token: `${cred.slice(0, 24)}...`, hint: 'JWT detected - open the JWT & Base64 Token Inspector to decode it.' },
      }
    }
    return { error: null, detail: { scheme: 'Bearer', token: cred, hint: 'Opaque bearer token (not a JWT).' } }
  }
  return { error: 'Unsupported scheme. Use Basic or Bearer followed by a space and the credentials.' }
}

const SAMPLE_CURL = `curl --request POST \\
  --url https://api.vimz.example.com/v1/orders \\
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.abc123' \\
  --header 'Content-Type: application/json' \\
  --data '{"customer": "Alice", "total": 1250}'`

function buildStructured(parsed: ReturnType<typeof parseCurl>) {
  return JSON.stringify(
    {
      method: parsed.method || 'GET',
      url: parsed.url || '',
      headers: parsed.headers,
      body: parsed.body || null,
      auth: parsed.auth,
    },
    null,
    2,
  )
}

function buildPostman(parsed: ReturnType<typeof parseCurl>) {
  const parts = [`curl --request ${parsed.method || 'GET'} --url ${parsed.url || '<url>'}`]
  for (const h of parsed.headers) parts.push(`  --header '${h.key}: ${h.value}'`)
  if (parsed.auth) parts.push(`  --header 'Authorization: ${parsed.auth}'`)
  if (parsed.body) parts.push(`  --data '${parsed.body}'`)
  return parts.join(' \\\n')
}

export default function ApiHttpHeaderFormatter() {
  const [tab, setTab] = useState<Tab>('curl')
  const [curlInput, setCurlInput] = useState('')
  const [authInput, setAuthInput] = useState('')

  const parsed = useMemo(() => {
    if (!curlInput.trim()) return null
    try {
      return parseCurl(curlInput)
    } catch {
      return null
    }
  }, [curlInput])

  const authResult = useMemo(() => {
    if (!authInput.trim()) return null
    try {
      return decodeAuth(authInput)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not decode that header.' }
    }
  }, [authInput])

  return (
    <>
      <Seo
        title="API Payload & HTTP Header Formatter - vimz Tools"
        description="Turn cURL commands into structured JSON requests and decode Basic and Bearer authorization headers."
      />
      <ToolShell
        title="API Payload & HTTP Header Formatter"
        description="Convert pasted cURL commands into structured JSON and Postman-style requests, and inspect authorization header credentials."
        icon={<Plug className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Paste a cURL snippet or an Authorization header to get a structured view"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setTab('curl')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'curl' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Terminal className="h-4 w-4" /> cURL converter
          </button>
          <button
            onClick={() => setTab('auth')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'auth' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <KeyRound className="h-4 w-4" /> Auth header decoder
          </button>
        </div>

        {tab === 'curl' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">cURL input</h3>
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => setCurlInput(SAMPLE_CURL)}>
                  <Wand2 className="h-3.5 w-3.5" /> Load sample
                </Button>
              </div>
              <TextArea rows={12} value={curlInput} onChange={(e) => setCurlInput(e.target.value)} placeholder="curl --request GET --url https://api.example.com/v1/items ..." className="font-mono" />
              {parsed && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold text-white">{parsed.method || 'GET'}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600">{parsed.url || 'no url'}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600">{parsed.headers.length} headers</span>
                    {parsed.auth && <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600">auth present</span>}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <CodeBlock title="Structured JSON payload" code={parsed ? buildStructured(parsed) : 'Paste a cURL command to see it structured here...'} lang="json" />
              <CodeBlock title="Postman-style request" code={parsed ? buildPostman(parsed) : ''} lang="plain" />
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                The converter reads the common flags -X, -H, -d, --data-raw and -u. URL-encoded key-value pairs are joined
                with the ampersand separator.
              </p>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <KeyRound className="h-4 w-4 text-primary-600" /> Authorization header
              </h3>
              <Field label="Header value">
                <TextInput value={authInput} onChange={(e) => setAuthInput(e.target.value)} placeholder="Basic dXNlcjpwYXNz" className="font-mono" />
              </Field>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Supported schemes: Basic (base64 user:pass) and Bearer (opaque token or JWT pointer).
              </p>
              <Button variant="ghost" className="mt-2 px-3 py-1 text-xs" onClick={() => setAuthInput('Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.abc123')}>
                Try a JWT sample
              </Button>
            </section>

            <section className="space-y-4">
              {!authResult && (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                  Paste an Authorization header to decode it locally.
                </p>
              )}
              {authResult?.error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <p className="break-all text-xs text-rose-700">{authResult.error}</p>
                </div>
              )}
              {authResult && !authResult.error && (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {authResult.jwt ? 'JWT detected in bearer credentials.' : 'Header decoded.'}
                  </div>
                  <CodeBlock title="Decoded details" code={JSON.stringify(authResult.detail, null, 2)} lang="json" />
                </>
              )}
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}