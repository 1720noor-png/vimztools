import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { convertTextCase, normalizeCaseMode } from '@tool-core/writing/textCaseConverter.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function TextCaseConverterTool() {
  const params = useAutoFillParams({ text: 'hello world example text', input: '', src: '', mode: 'upper' })
  const [text, setText] = useState(params.text || params.input || params.src || 'hello world example text')
  const [mode, setMode] = useState(normalizeCaseMode(params.mode || 'upper'))
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      if (!text.trim()) return setErr('Enter text to convert.')
      setErr('')
      const outcome = convertTextCase(text, mode)
      setRes({ val: outcome.val, copyText: outcome.val })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setText('hello world example text'); setMode('upper'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Case Format">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="title">Title Case</option>
            <option value="sentence">Sentence case</option>
            <option value="camel">camelCase</option>
            <option value="pascal">PascalCase</option>
            <option value="snake">snake_case</option>
            <option value="kebab">kebab-case</option>
          </select>
        </Field>
        <Field label="Input Text">
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