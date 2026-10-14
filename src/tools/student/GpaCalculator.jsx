import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateGpa, GRADE_POINTS } from '@tool-core/student/gpaCalculator.js'

let n = 0
const blank = () => ({ id: ++n, name: '', g: 'A', c: '' })
export default function GpaCalculator() {
  const [rows, setRows] = useState([blank(), blank(), blank()])
  const [prev, setPrev] = useState({ g: '', c: '' })
  const [out, setOut] = useState(null)
  const [err, setErr] = useState('')
  const upd = (id, k, v) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)))
  const calc = () => {
    try {
      const courses = rows.map((r) => ({ grade: r.g, credits: r.c, name: r.name }))
      const res = calculateGpa({
        courses,
        previousCgpa: prev.g,
        previousCredits: prev.c
      })
      setErr('')
      setOut({ gpa: res.formattedGpa, cr: res.semesterCredits, cgpa: res.formattedCgpa })
    } catch (e) {
      setOut(null)
      setErr(e.message)
    }
  }
  const reset = () => { setRows([blank(), blank(), blank()]); setPrev({ g: '', c: '' }); setOut(null); setErr('') }
  return (
    <div>
      {rows.map((r, i) => (
        <div className="row" key={r.id}>
          <Field label={`Course ${i + 1}`}><input value={r.name} onChange={(e) => upd(r.id, 'name', e.target.value)} placeholder="Optional" /></Field>
          <Field label="Grade"><select value={r.g} onChange={(e) => upd(r.id, 'g', e.target.value)}>{Object.keys(GRADE_POINTS).map((g) => <option key={g}>{g}</option>)}</select></Field>
          <Field label="Credit hours"><input type="number" min="0" step="0.5" value={r.c} onChange={(e) => upd(r.id, 'c', e.target.value)} /></Field>
          <button type="button" className="btn ghost" onClick={() => setRows((x) => (x.length > 1 ? x.filter((y) => y.id !== r.id) : x))} aria-label={`Remove course ${i + 1}`}>Remove</button>
        </div>
      ))}
      <div className="row">
        <Field label="Previous CGPA (optional)"><input type="number" min="0" max="4" step="0.01" value={prev.g} onChange={(e) => setPrev({ ...prev, g: e.target.value })} /></Field>
        <Field label="Previous credit hours (optional)"><input type="number" min="0" step="0.5" value={prev.c} onChange={(e) => setPrev({ ...prev, c: e.target.value })} /></Field>
      </div>
      <div className="actions">
        <button className="btn ghost" onClick={() => setRows((r) => [...r, blank()])}>Add course</button>
        <button className="btn" onClick={calc}>Calculate</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg>
      {out && <p className="out" role="status">GPA: <strong>{out.gpa}</strong> <small>from {out.cr} credit hours (4.0 scale)</small>{out.cgpa && <><br />Cumulative CGPA: <strong>{out.cgpa}</strong></>}</p>}
    </div>
  )
}
