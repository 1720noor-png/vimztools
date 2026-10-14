import { useState } from 'react'
import { Field, Msg, CopyBtn, download } from '../../components/ui.jsx'
import { formatJson, minifyJson } from '@tool-core/developer/jsonFormatter.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function JsonFormatter() {
  const params = useAutoFillParams({ src: '', json: '', ind: '2' })
  const [src, setSrc] = useState(params.src || params.json || '')
  const [ind, setInd] = useState(params.ind || '2')
  const [out, setOut] = useState('')
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  const run = (min) => {
    setOut(''); setOk('')
    if (!src.trim()) return setErr('Paste some JSON first.')
    try {
      if (min) {
        setOut(minifyJson(src))
        setErr(''); setOk('Minified JSON')
      } else {
        setOut(formatJson(src, ind))
        setErr(''); setOk('Valid JSON')
      }
    } catch (e) {
      setErr(e.message)
    }
  }

  const reset = () => { setSrc(''); setOut(''); setOk(''); setErr('') }

  return (
    <div>
      <Field label="JSON input"><textarea rows="8" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck="false" placeholder='{"name":"ToolHub"}' /></Field>
      <div className="actions">
        <Field label="Indent"><select value={ind} onChange={(e) => setInd(e.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></Field>
        <button className="btn" onClick={() => run(false)}>Format</button>
        <button className="btn" onClick={() => run(true)}>Minify</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg><Msg kind="ok">{ok}</Msg>
      {out && <><Field label="Output"><textarea rows="8" readOnly value={out} /></Field>
        <div className="actions"><CopyBtn text={out} /><button className="btn ghost" onClick={() => download('formatted.json', out, 'application/json')}>Download</button></div></>}
    </div>
  )
}
