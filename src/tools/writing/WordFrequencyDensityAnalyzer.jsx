import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { analyzeWordFrequency } from '@tool-core/writing/wordFrequencyDensity.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function WordFrequencyDensityAnalyzer() {
  const defaultText = 'Search engine optimization is vital for modern websites. Optimization helps content rank higher on search engines.'
  const params = useAutoFillParams({ text: defaultText, input: '', src: '' })
  const [text, setText] = useState(params.text || params.input || params.src || defaultText)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      if (!text.trim()) return setErr('Paste text to analyze.')
      setErr('')
      const outcome = analyzeWordFrequency(text)
      setRes({ val: outcome.val, copyText: outcome.val })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setText(defaultText); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Paste Text / Content">
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