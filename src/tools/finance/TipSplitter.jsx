import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateTipSplitter } from '@tool-core/finance/tipSplitter.js'

export default function TipSplitter() {
  const [bill, setBill] = useState('')
  const [tip, setTip] = useState('')
  const [people, setPeople] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const calculate = () => {
    setErr('')
    setResult(null)
    try {
      const outcome = calculateTipSplitter({ bill, tip, people })
      setResult({
        tip: outcome.formattedTip,
        total: outcome.formattedTotal,
        perPerson: outcome.formattedPerPerson,
        people: outcome.people
      })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  return (
    <div>
      <div className="row">
        <Field label="Bill ($)"><input type="number" value={bill} onChange={e=>setBill(e.target.value)} placeholder="85.50" /></Field>
        <Field label="Tip (%)"><input type="number" value={tip} onChange={e=>setTip(e.target.value)} placeholder="18" /></Field>
        <Field label="People"><input type="number" value={people} onChange={e=>setPeople(e.target.value)} placeholder="4" /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calculate}>Calculate</button></div>
      <Msg>{err}</Msg>
      {result && <div className="out" role="status"><p><strong>Tip:</strong> ${result.tip}</p><p><strong>Total:</strong> ${result.total}</p><p><strong>Per Person ({result.people}):</strong> ${result.perPerson}</p></div>}
      <p className="hint">Split bills with tip evenly.</p>
    </div>
  )
}
