import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import {
  generateHash,
  normalizeAlgorithm,
  SUPPORTED_HASH_ALGORITHMS
} from '@tool-core/developer/hashGenerator.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function HashGenerator() {
  const params = useAutoFillParams({ txt: '', text: '', input: '', alg: 'SHA-256', algorithm: 'SHA-256' })
  const initialAlg = normalizeAlgorithm(params.alg || params.algorithm || 'SHA-256')
  const validAlg = SUPPORTED_HASH_ALGORITHMS.includes(initialAlg) ? initialAlg : 'SHA-256'

  const [alg, setAlg] = useState(validAlg)
  const [txt, setTxt] = useState(params.txt || params.text || params.input || '')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setOut('')
    if (!txt) return setErr('Enter some text to hash.')
    if (!window.crypto?.subtle) return setErr('Web Crypto needs a secure context (HTTPS or localhost).')
    setBusy(true)
    try {
      const hash = await generateHash(txt, alg)
      setOut(hash)
      setErr('')
    } catch (e) {
      setErr('Hashing failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const reset = () => { setTxt(''); setOut(''); setErr('') }

  return (
    <div>
      <Field label="Algorithm">
        <select value={alg} onChange={(e) => setAlg(e.target.value)}>
          {SUPPORTED_HASH_ALGORITHMS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="Text">
        <textarea rows="5" value={txt} onChange={(e) => setTxt(e.target.value)} spellCheck="false" />
      </Field>
      <div className="actions">
        <button className="btn" onClick={run} disabled={busy}>{busy ? 'Hashing…' : 'Generate hash'}</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg>
      {out && <div className="out"><code>{out}</code><CopyBtn text={out} /></div>}
      <p className="hint">Hashed locally with the Web Crypto API. MD5 is not supported by browsers and is not offered. SHA-1 is legacy; prefer SHA-256 or higher.</p>
    </div>
  )
}
