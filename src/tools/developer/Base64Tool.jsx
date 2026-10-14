import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { encodeBase64, decodeBase64 } from '@tool-core/developer/base64Converter.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function Base64Tool() {
  const params = useAutoFillParams({ src: '', text: '', input: '', mode: 'encode' })
  const initialMode = params.mode && params.mode.toLowerCase() === 'decode' ? 'decode' : 'encode'
  const [mode, setMode] = useState(initialMode)
  const [src, setSrc] = useState(params.src || params.text || params.input || '')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')

  const run = () => {
    setOut('')
    if (!src) return setErr('Enter some text first.')
    try {
      if (mode === 'encode') {
        setOut(encodeBase64(src))
      } else {
        setOut(decodeBase64(src))
      }
      setErr('')
    } catch {
      setErr(mode === 'decode' ? 'This is not valid Base64 text (or it does not contain UTF-8 text).' : 'Could not encode this text.')
    }
  }

  const reset = () => { setSrc(''); setOut(''); setErr('') }

  return (
    <div>
      <Field label="Mode"><select value={mode} onChange={(e) => { setMode(e.target.value); setOut(''); setErr('') }}><option value="encode">Encode text to Base64</option><option value="decode">Decode Base64 to text</option></select></Field>
      <Field label="Input"><textarea rows="6" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck="false" /></Field>
      <div className="actions"><button className="btn" onClick={run}>Convert</button><button className="btn ghost" onClick={reset}>Reset</button></div>
      <Msg>{err}</Msg>
      {out && <><Field label="Output"><textarea rows="6" readOnly value={out} /></Field><div className="actions"><CopyBtn text={out} /></div></>}
      <p className="hint">Processed locally in your browser.</p>
    </div>
  )
}
