import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { deduplicateLines } from '@tool-core/writing/lineDeduplicator.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function DuplicateLineDeduplicator() {
  const defaultText = 'apple\nbanana\napple\norange\nbanana'
  const params = useAutoFillParams({ text: defaultText, input: '', src: '', sort: 'none', sortMode: 'none' })
  const [text, setText] = useState(params.text || params.input || params.src || defaultText)
  const [sortMode, setSortMode] = useState(params.sort || params.sortMode || 'none')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      if (!text.trim()) return setErr('Paste text lines.')
      setErr('')
      const outcome = deduplicateLines(text, { sortMode })
      setRes({ val: outcome.val, copyText: outcome.output })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setText(defaultText); setSortMode('none'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Sort Order">
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="none">Keep Original Order</option>
            <option value="asc">Sort A to Z</option>
            <option value="desc">Sort Z to A</option>
          </select>
        </Field>
        <Field label="List Items (One per line)">
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="" />
        </Field>
      </div>
      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={calc}>Calculate / Process</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg>
      {res && (
        <div className="out" role="status" style={{ marginTop: '1rem' }}>
          {typeof res === 'string' ? (
            <p>Result: <strong>{res}</strong></p>
          ) : (
            <div>
              <p>Result: <strong>{res.val}</strong></p>
            </div>
          )}
          <CopyBtn text={typeof res === 'string' ? res : (res.copyText || JSON.stringify(res))} />
        </div>
      )}
    </div>
  )
}