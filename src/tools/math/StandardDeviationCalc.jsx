import { useState } from 'react'
import { Field, CopyBtn, Msg } from '../../components/ui.jsx'
import { calculateStandardDeviation } from '@tool-core/math/standardDeviation.js'

export default function StandardDeviationCalc() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const process = () => {
    setErr(''); setResult(null)
    if (!input.trim()) { setErr('Please enter text.'); return }
    try {
      const res = calculateStandardDeviation({ numbers: input })
      setResult({
        mean: res.meanFormatted,
        variance: res.variancePopFormatted,
        sd: res.stdDevPopFormatted,
        count: res.count
      })
    } catch (e) {
      setErr(e.message)
    }
  }
  return (
    <div>
      <Field label="Numbers (comma separated)"><textarea rows={5} value={input} onChange={e=>setInput(e.target.value)} placeholder="10, 12, 23, 23, 16, 23, 21, 16" /></Field>
      <div className="actions"><button className="btn" onClick={process}>Process</button></div>
      <Msg>{err}</Msg>
      {result && <div className="out" role="status"><p><strong>Mean:</strong> {result.mean}</p><p><strong>Variance:</strong> {result.variance}</p><p><strong>Std Dev:</strong> {result.sd}</p><p><strong>Count:</strong> {result.count}</p></div>}
      <p className="hint">Population standard deviation.</p>
    </div>
  )
}
