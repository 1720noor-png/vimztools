import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculatePercentage, PERCENTAGE_MODES as modes } from '@tool-core/student/percentageCalculator.js'

export default function PercentageCalculator() {
  const [m, setM] = useState('of')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const calc = () => {
    try {
      const res = calculatePercentage({
        mode: m,
        a,
        b
      })
      setErr('')
      setOut(res.formatted)
    } catch (e) {
      setOut('')
      setErr(e.message)
    }
  }
  const reset = () => { setA(''); setB(''); setOut(''); setErr('') }
  return (
    <div>
      <Field label="Question"><select value={m} onChange={(e) => { setM(e.target.value); setOut(''); setErr('') }}>{Object.entries(modes).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></Field>
      <div className="row">
        <Field label={modes[m][1]}><input type="number" value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label={modes[m][2]}><input type="number" value={b} onChange={(e) => setB(e.target.value)} /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calc}>Calculate</button><button className="btn ghost" onClick={reset}>Reset</button></div>
      <Msg>{err}</Msg>
      {out && <p className="out" role="status">Result: <strong>{out}</strong> <CopyBtn text={out} /></p>}
    </div>
  )
}
