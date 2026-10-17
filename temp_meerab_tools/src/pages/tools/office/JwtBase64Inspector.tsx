import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Fingerprint, KeyRound, Save } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Button, Field, TextArea } from '../../../components/ui/Fields'

function b64encodeUtf8(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
}

function b64decodeUtf8(input: string): string {
  const clean = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(clean)))
}

function b64urlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  return b64decodeUtf8((input + pad).replace(/-/g, '+').replace(/_/g, '/'))
}

function findClaims(payload: Record<string, unknown>) {
  const keys = ['exp', 'iat', 'nbf', 'jti', 'iss', 'sub', 'aud', 'azp', 'scope', 'username', 'role', 'roles', 'email'] as const
  const claims: { label: string; value: string }[] = []
  for (const k of keys) {
    const v = payload[k]
    if (v === undefined || v === null) continue
    if (typeof v === 'number' && (k === 'exp' || k === 'iat' || k === 'nbf')) {
      const d = new Date(v * 1000)
      if (!Number.isNaN(d.getTime())) {
        claims.push({ label: k, value: `${d.toLocaleString()} (${v})` })
        continue
      }
    }
    claims.push({ label: k, value: typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v) })
  }
  return claims
}

interface JwtDecoded {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  claims: { label: string; value: string }[]
  expiry: number | null
  issued: number | null
}

export default function JwtBase64Inspector() {
  const [tab, setTab] = useState<'jwt' | 'base64'>('jwt')
  const [token, setToken] = useState('')
  const [b64Text, setB64Text] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')
  const [lastAction, setLastAction] = useState<'' | 'encode' | 'decode'>('')

  const jwt = useMemo<{ error: string | null; data: JwtDecoded | null }>(() => {
    if (!token.trim()) return { error: null, data: null }
    const parts = token.trim().split('.')
    if (parts.length !== 3) {
      return { error: 'A JWT must have exactly three dot-separated segments: header.payload.signature.', data: null }
    }
    try {
      const header = JSON.parse(b64urlDecode(parts[0])) as Record<string, unknown>
      const payload = JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>
      const expiry = typeof payload.exp === 'number' ? payload.exp : null
      const issued = typeof payload.iat === 'number' ? payload.iat : null
      return {
        error: null,
        data: { header, payload, signature: parts[2], claims: findClaims(payload), expiry, issued },
      }
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : 'The token could not be decoded - check it is complete and correctly base64url-encoded.',
        data: null,
      }
    }
  }, [token])

  const encode = () => {
    try {
      setEncoded(b64encodeUtf8(b64Text))
      setDecoded('')
      setLastAction('encode')
    } catch {
      setLastAction('')
    }
  }

  const decode = () => {
    try {
      const out = b64decodeUtf8(b64Text)
      setDecoded(out)
      setEncoded('')
      setLastAction('decode')
    } catch {
      setDecoded('')
      setEncoded('')
      setLastAction('')
    }
  }

  const expiryLabel = (ts: number | null) => {
    if (ts === null) return null
    const diff = ts * 1000 - Date.now()
    const abs = Math.abs(diff)
    const days = Math.floor(abs / 86400000)
    const hours = Math.floor((abs % 86400000) / 3600000)
    const mins = Math.floor((abs % 3600000) / 60000)
    const human = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    return diff >= 0 ? `expires in ${human}` : `expired ${human} ago`
  }

  return (
    <>
      <Seo
        title="JWT & Base64 Token Inspector - vimz Tools"
        description="Decode JWT headers and payloads, inspect claims and expiry, and encode or decode base64 text in the browser."
      />
      <ToolShell
        title="JWT & Base64 Token Inspector"
        description="Inspect JWT header, claims and lifetime locally, then switch to base64 encode-decode for any other credential or token."
        icon={<Fingerprint className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Paste a token or base64 text - decode happens locally in your tab"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTab('jwt')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'jwt' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            JWT inspector
          </button>
          <button
            onClick={() => setTab('base64')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'base64' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Base64 codec
          </button>
        </div>

        {tab === 'jwt' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <KeyRound className="h-4 w-4 text-primary-600" /> Token input
              </h3>
              <Field label="JWT (header.payload.signature)">
                <TextArea rows={7} value={token} onChange={(e) => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.abc123" className="font-mono" />
              </Field>
              <Button
                variant="ghost"
                className="mt-2 px-3 py-1 text-xs"
                onClick={() => setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiYWRtaW4iOnRydWUsImlhdCI6MTcxNjIwOTAyMiwiZXhwIjoxOTUyMjU2MjIyfQ.sig-sample')}
              >
                Load sample
              </Button>
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                The signature is not verified here - only the header and payload are decoded. Never share real tokens
                from production systems.
              </p>
            </section>

            <section className="space-y-4">
              {jwt.error ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <p className="break-all text-xs text-rose-700">{jwt.error}</p>
                </div>
              ) : jwt.data ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Claims & lifetime</p>
                        <p className="text-[11px] text-slate-400">
                          alg <span className="font-mono text-slate-600">{String(jwt.data.header.alg ?? 'unknown')}</span>
                          {jwt.data.expiry !== null && (
                            <>
                              <span className="mx-1.5 text-slate-300">|</span>
                              <span className={expiryLabel(jwt.data.expiry)?.startsWith('expired') ? 'text-rose-600' : 'text-emerald-600'}>
                                {expiryLabel(jwt.data.expiry)}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {jwt.data.claims.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {jwt.data.claims.map((c) => (
                          <span key={c.label} className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px]">
                            <span className="font-bold text-slate-500">{c.label}:</span> <span className="break-all font-mono text-slate-700">{c.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {jwt.data.expiry === null && (
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700">No exp claim - this token never reports an expiry.</p>
                    )}
                  </div>
                  <CodeBlock title="Header" code={JSON.stringify(jwt.data.header, null, 2)} lang="json" />
                  <CodeBlock title="Payload" code={JSON.stringify(jwt.data.payload, null, 2)} lang="json" />
                  <CodeBlock title="Signature" code={`${jwt.data.signature.slice(0, 28)}... (${jwt.data.signature.length} chars, not verified)`} lang="plain" />
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                  Paste a JWT to inspect its claims and lifetime.
                </p>
              )}
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Fingerprint className="h-4 w-4 text-primary-600" /> Input
              </h3>
              <Field label="Plain text or base64">
                <TextArea rows={8} value={b64Text} onChange={(e) => setB64Text(e.target.value)} placeholder="hello vimz: d3JpdGUgaGVyZQ==" className="font-mono" />
              </Field>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="primary" className="px-3 py-2 text-xs" onClick={encode}>
                  <Save className="h-3.5 w-3.5" /> Encode to base64
                </Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={decode}>
                  <Save className="h-3.5 w-3.5" /> Decode from base64
                </Button>
              </div>
              {lastAction !== '' && !encoded && !decoded && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <p className="text-xs text-rose-700">That input could not be decoded as base64 - it is malformed or truncated.</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              {encoded && (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> Encoded {b64Text.length} characters to {encoded.length} base64 chars.
                  </div>
                  <CodeBlock title="Base64 output" code={encoded} lang="plain" />
                </>
              )}
              {decoded && (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> Decoded successfully.
                  </div>
                  <CodeBlock title="Decoded text" code={decoded} lang="plain" />
                  {/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(decoded.trim()) && (
                    <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-medium text-sky-700">
                      This decodes to a three-segment token - open the JWT inspector tab to read its header and payload.
                    </p>
                  )}
                </>
              )}
              {!encoded && !decoded && lastAction === '' && (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                  Type text to encode, or paste base64 to decode.
                </p>
              )}
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}