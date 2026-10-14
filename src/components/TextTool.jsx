import { useState } from 'react'
import { Field, Msg, CopyBtn, download } from './ui.jsx'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

// actions: [{label, run(text, option) => string, report?: show result as a message, stats?: show size change}]
export default function TextTool({ actions, select, placeholder, filename = 'output.txt', rows = 8, note }) {
  const params = useAutoFillParams({ src: '', text: '', input: '', url: '', opt: '' })
  const [src, setSrc] = useState(params.src || params.text || params.input || params.url || '')
  const [opt, setOpt] = useState(params.opt || (select ? select.options[0][0] : ''))
  const [out, setOut] = useState('')
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  const go = (a) => {
    setOut(''); setOk('')
    if (!src.trim()) return setErr('Enter some input first.')
    try {
      const r = a.run(src, opt)
      setErr('')
      if (a.report) setOk(r)
      else { setOut(r); if (a.stats) setOk(`${src.length} → ${r.length} characters (${Math.round((1 - r.length / src.length) * 100)}% smaller)`) }
    } catch (e) { setErr(e.message) }
  }

  const reset = () => { setSrc(''); setOut(''); setOk(''); setErr('') }

  return (
    <div>
      {select && <Field label={select.label}><select value={opt} onChange={(e) => { setOpt(e.target.value); setOut(''); setOk(''); setErr('') }}>{select.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>}
      <Field label="Input"><textarea rows={rows} value={src} onChange={(e) => setSrc(e.target.value)} spellCheck="false" placeholder={placeholder} /></Field>
      <div className="actions">
        {actions.map((a) => <button key={a.label} className="btn" onClick={() => go(a)}>{a.label}</button>)}
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg><Msg kind="ok">{ok}</Msg>
      {out && <><Field label="Output"><textarea rows={rows} readOnly value={out} /></Field>
        <div className="actions"><CopyBtn text={out} /><button className="btn ghost" onClick={() => download(filename, out)}>Download</button></div></>}
      <p className="hint">{note || 'Processed locally in your browser.'}</p>
    </div>
  )
}
